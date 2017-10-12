import angular from 'angular';
import moment from 'moment';
import _ from 'lodash';
import $ from 'jquery';

import {DEFAULT_ANNOTATION_COLOR} from 'app/core/utils/colors';
import {Emitter, contextSrv, appEvents} from 'app/core/core';
import {DashboardRow} from './row/row_model';
import {PanelModel} from './PanelModel';
import sortByKeys from 'app/core/utils/sort_by_keys';

export const CELL_HEIGHT = 30;
export const CELL_VMARGIN = 10;

export class DashboardModel {
  id: any;
  title: any;
  autoUpdate: any;
  description: any;
  tags: any;
  style: any;
  timezone: any;
  editable: any;
  graphTooltip: any;
  rows: DashboardRow[];
  time: any;
  timepicker: any;
  hideControls: any;
  templating: any;
  annotations: any;
  refresh: any;
  snapshot: any;
  schemaVersion: number;
  version: number;
  revision: number;
  links: any;
  gnetId: any;
  meta: any;
  events: any;
  editMode: boolean;
  folderId: number;
  panels: PanelModel[];

  constructor(data, meta?) {
    if (!data) {
      data = {};
    }

    this.events = new Emitter();
    this.id = data.id || null;
    this.revision = data.revision;
    this.title = data.title || 'No Title';
    this.autoUpdate = data.autoUpdate;
    this.description = data.description;
    this.tags = data.tags || [];
    this.style = data.style || "dark";
    this.timezone = data.timezone || '';
    this.editable = data.editable !== false;
    this.graphTooltip = data.graphTooltip || 0;
    this.hideControls = data.hideControls || false;
    this.time = data.time || { from: 'now-6h', to: 'now' };
    this.timepicker = data.timepicker || {};
    this.templating = this.ensureListExist(data.templating);
    this.annotations = this.ensureListExist(data.annotations);
    this.refresh = data.refresh;
    this.snapshot = data.snapshot;
    this.schemaVersion = data.schemaVersion || 0;
    this.version = data.version || 0;
    this.links = data.links || [];
    this.gnetId = data.gnetId || null;
    this.folderId = data.folderId || null;
    this.panels = _.map(data.panels || [], panelData => new PanelModel(panelData));

    this.addBuiltInAnnotationQuery();
    this.initMeta(meta);
    this.updateSchema(data);
  }

  addBuiltInAnnotationQuery() {
    let found = false;
    for (let item of this.annotations.list) {
      if (item.builtIn === 1) {
        found = true;
        break;
      }
    }

    if (found) {
      return;
    }

    this.annotations.list.unshift({
      datasource: '-- Grafana --',
      name: 'Annotations & Alerts',
      type: 'dashboard',
      iconColor: DEFAULT_ANNOTATION_COLOR,
      enable: true,
      hide: true,
      builtIn: 1,
    });
  }

  private initMeta(meta) {
    meta = meta || {};

    meta.canShare = meta.canShare !== false;
    meta.canSave = meta.canSave !== false;
    meta.canStar = meta.canStar !== false;
    meta.canEdit = meta.canEdit !== false;

    if (!this.editable) {
      meta.canEdit = false;
      meta.canDelete = false;
      meta.canSave = false;
    }

    this.meta = meta;
  }

  // cleans meta data and other non peristent state
  getSaveModelClone() {
    // temp remove stuff
    var events = this.events;
    var meta = this.meta;
    var variables = this.templating.list;
    var panels = this.panels;

    delete this.events;
    delete this.meta;
    delete this.panels;

    // prepare save model
    this.templating.list = _.map(variables, variable => variable.getSaveModel ? variable.getSaveModel() : variable);
    this.panels = _.map(panels, panel => panel.getSaveModel());

    // make clone
    var copy = $.extend(true, {}, this);
    //  sort clone
    copy = sortByKeys(copy);
    console.log(copy.panels);

    // restore properties
    this.events = events;
    this.meta = meta;
    this.templating.list = variables;
    this.panels = panels;

    return copy;
  }

  setViewMode(panel: PanelModel, fullscreen: boolean, isEditing: boolean) {
    this.meta.fullscreen = fullscreen;
    this.meta.isEditing = isEditing && this.meta.canEdit;

    panel.setViewMode(fullscreen, this.meta.isEditing);

    this.events.emit('view-mode-changed', panel);
  }

  private ensureListExist(data) {
    if (!data) { data = {}; }
    if (!data.list) { data.list = []; }
    return data;
  }

  getNextPanelId() {
    var j, panel, max = 0;
    for (j = 0; j < this.panels.length; j++) {
      panel = this.panels[j];
      if (panel.id > max) { max = panel.id; }
    }
    return max + 1;
  }

  forEachPanel(callback) {
    for (let i = 0; i < this.panels.length; i++) {
      callback(this.panels[i], i);
    }
  }

  getPanelById(id) {
    for (let panel of this.panels) {
      if (panel.id === id) {
        return panel;
      }
    }
    return null;
  }

  addPanel(panel) {
    panel.id = this.getNextPanelId();
    this.panels.unshift(new PanelModel(panel));
    this.events.emit('panel-added', panel);
  }

  removePanel(panel, ask?) {
    // confirm deletion
    if (ask !== false) {
      var text2, confirmText;
      if (panel.alert) {
        text2 = "Panel includes an alert rule, removing panel will also remove alert rule";
        confirmText = "YES";
      }

      appEvents.emit('confirm-modal', {
        title: 'Remove Panel',
        text: 'Are you sure you want to remove this panel?',
        text2: text2,
        icon: 'fa-trash',
        confirmText: confirmText,
        yesText: 'Remove',
        onConfirm: () => {
          this.removePanel(panel, false);
        }
      });
      return;
    }

    var index = _.indexOf(this.panels, panel);
    this.panels.splice(index, 1);
    this.events.emit('panel-removed', panel);
  }

  setPanelFocus(id) {
    this.meta.focusPanelId = id;
  }

  updateSubmenuVisibility() {
    this.meta.submenuEnabled = (() => {
      if (this.links.length > 0) { return true; }

      var visibleVars = _.filter(this.templating.list, variable => variable.hide !== 2);
      if (visibleVars.length > 0) { return true; }

      var visibleAnnotations = _.filter(this.annotations.list, annotation => annotation.hide !== true);
      if (visibleAnnotations.length > 0) { return true; }

      return false;
    })();
  }

  getPanelInfoById(panelId) {
    var result: any = {};
    _.each(this.rows, function(row) {
      _.each(row.panels, function(panel, index) {
        if (panel.id === panelId) {
          result.panel = panel;
          result.row = row;
          result.index = index;
        }
      });
    });

    _.each(this.panels, function(panel, index) {
      if (panel.id === panelId) {
        result.panel = panel;
        result.index = index;
      }
    });

    if (!result.panel) {
      return null;
    }

    return result;
  }

  duplicatePanel(panel, row) {
    var newPanel = angular.copy(panel);
    newPanel.id = this.getNextPanelId();

    delete newPanel.repeat;
    delete newPanel.repeatIteration;
    delete newPanel.repeatPanelId;
    delete newPanel.scopedVars;
    if (newPanel.alert) {
      delete newPanel.thresholds;
    }
    delete newPanel.alert;

    row.addPanel(newPanel);
    return newPanel;
  }

  formatDate(date, format?) {
    date = moment.isMoment(date) ? date : moment(date);
    format = format || 'YYYY-MM-DD HH:mm:ss';
    let timezone = this.getTimezone();

    return timezone === 'browser' ?
      moment(date).format(format) :
      moment.utc(date).format(format);
  }

  destroy() {
    this.events.removeAllListeners();
    for (let row of this.rows) {
      row.destroy();
    }
  }

  on(eventName, callback) {
    this.events.on(eventName, callback);
  }

  off(eventName, callback?) {
    this.events.off(eventName, callback);
  }

  cycleGraphTooltip() {
    this.graphTooltip = (this.graphTooltip + 1) % 3;
  }

  sharedTooltipModeEnabled() {
    return this.graphTooltip > 0;
  }

  sharedCrosshairModeOnly() {
    return this.graphTooltip === 1;
  }

  getRelativeTime(date) {
    date = moment.isMoment(date) ? date : moment(date);

    return this.timezone === 'browser' ?
      moment(date).fromNow() :
      moment.utc(date).fromNow();
  }

  getNextQueryLetter(panel) {
    var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    return _.find(letters, function(refId) {
      return _.every(panel.targets, function(other) {
        return other.refId !== refId;
      });
    });
  }

  isTimezoneUtc() {
    return this.getTimezone() === 'utc';
  }

  getTimezone() {
    return this.timezone ? this.timezone : contextSrv.user.timezone;
  }

  private updateSchema(old) {
    var i, j, k;
    var oldVersion = this.schemaVersion;
    var panelUpgrades = [];
    this.schemaVersion = 16;

    if (oldVersion === this.schemaVersion) {
      return;
    }

    // version 2 schema changes
    if (oldVersion < 2) {

      if (old.services) {
        if (old.services.filter) {
          this.time = old.services.filter.time;
          this.templating.list = old.services.filter.list || [];
        }
      }

      panelUpgrades.push(function(panel) {
        // rename panel type
        if (panel.type === 'graphite') {
          panel.type = 'graph';
        }

        if (panel.type !== 'graph') {
          return;
        }

        if (_.isBoolean(panel.legend)) { panel.legend = { show: panel.legend }; }

        if (panel.grid) {
          if (panel.grid.min) {
            panel.grid.leftMin = panel.grid.min;
            delete panel.grid.min;
          }

          if (panel.grid.max) {
            panel.grid.leftMax = panel.grid.max;
            delete panel.grid.max;
          }
        }

        if (panel.y_format) {
          panel.y_formats[0] = panel.y_format;
          delete panel.y_format;
        }

        if (panel.y2_format) {
          panel.y_formats[1] = panel.y2_format;
          delete panel.y2_format;
        }
      });
    }

    // schema version 3 changes
    if (oldVersion < 3) {
      // ensure panel ids
      var maxId = this.getNextPanelId();
      panelUpgrades.push(function(panel) {
        if (!panel.id) {
          panel.id = maxId;
          maxId += 1;
        }
      });
    }

    // schema version 4 changes
    if (oldVersion < 4) {
      // move aliasYAxis changes
      panelUpgrades.push(function(panel) {
        if (panel.type !== 'graph') { return; }
        _.each(panel.aliasYAxis, function(value, key) {
          panel.seriesOverrides = [{ alias: key, yaxis: value }];
        });
        delete panel.aliasYAxis;
      });
    }

    if (oldVersion < 6) {
      // move pulldowns to new schema
      var annotations = _.find(old.pulldowns, { type: 'annotations' });

      if (annotations) {
        this.annotations = {
          list: annotations.annotations || [],
        };
      }

      // update template variables
      for (i = 0 ; i < this.templating.list.length; i++) {
        var variable = this.templating.list[i];
        if (variable.datasource === void 0) { variable.datasource = null; }
        if (variable.type === 'filter') { variable.type = 'query'; }
        if (variable.type === void 0) { variable.type = 'query'; }
        if (variable.allFormat === void 0) { variable.allFormat = 'glob'; }
      }
    }

    if (oldVersion < 7) {
      if (old.nav && old.nav.length) {
        this.timepicker = old.nav[0];
      }

      // ensure query refIds
      panelUpgrades.push(function(panel) {
        _.each(panel.targets, function(target) {
          if (!target.refId) {
            target.refId = this.getNextQueryLetter(panel);
            }
          }.bind(this));
        });
      }

      if (oldVersion < 8) {
        panelUpgrades.push(function(panel) {
          _.each(panel.targets, function(target) {
            // update old influxdb query schema
            if (target.fields && target.tags && target.groupBy) {
              if (target.rawQuery) {
                delete target.fields;
                delete target.fill;
              } else {
                target.select = _.map(target.fields, function(field) {
                  var parts = [];
                  parts.push({type: 'field', params: [field.name]});
                  parts.push({type: field.func, params: []});
                  if (field.mathExpr) {
                    parts.push({type: 'math', params: [field.mathExpr]});
                  }
                  if (field.asExpr) {
                    parts.push({type: 'alias', params: [field.asExpr]});
                  }
                  return parts;
                });
                delete target.fields;
                _.each(target.groupBy, function(part) {
                  if (part.type === 'time' && part.interval)  {
                    part.params = [part.interval];
                    delete part.interval;
                  }
                  if (part.type === 'tag' && part.key) {
                    part.params = [part.key];
                    delete part.key;
                  }
                });

                if (target.fill) {
                  target.groupBy.push({type: 'fill', params: [target.fill]});
                  delete target.fill;
                }
              }
            }
          });
        });
      }

      // schema version 9 changes
      if (oldVersion < 9) {
        // move aliasYAxis changes
        panelUpgrades.push(function(panel) {
          if (panel.type !== 'singlestat' && panel.thresholds !== "") { return; }

          if (panel.thresholds) {
            var k = panel.thresholds.split(",");

            if (k.length >= 3) {
              k.shift();
              panel.thresholds = k.join(",");
            }
          }
        });
      }

      // schema version 10 changes
      if (oldVersion < 10) {
        // move aliasYAxis changes
        panelUpgrades.push(function(panel) {
          if (panel.type !== 'table') { return; }

          _.each(panel.styles, function(style) {
            if (style.thresholds && style.thresholds.length >= 3) {
              var k = style.thresholds;
              k.shift();
              style.thresholds = k;
            }
          });
        });
      }

      if (oldVersion < 12) {
        // update template variables
        _.each(this.templating.list, function(templateVariable) {
          if (templateVariable.refresh) { templateVariable.refresh = 1; }
          if (!templateVariable.refresh) { templateVariable.refresh = 0; }
          if (templateVariable.hideVariable) {
            templateVariable.hide = 2;
          } else if (templateVariable.hideLabel) {
            templateVariable.hide = 1;
          }
        });
      }

      if (oldVersion < 12) {
        // update graph yaxes changes
        panelUpgrades.push(function(panel) {
          if (panel.type !== 'graph') { return; }
          if (!panel.grid) { return; }

          if (!panel.yaxes) {
            panel.yaxes = [
              {
                show: panel['y-axis'],
                min: panel.grid.leftMin,
                max: panel.grid.leftMax,
                logBase: panel.grid.leftLogBase,
                format: panel.y_formats[0],
                label: panel.leftYAxisLabel,
              },
              {
                show: panel['y-axis'],
                min: panel.grid.rightMin,
                max: panel.grid.rightMax,
                logBase: panel.grid.rightLogBase,
                format: panel.y_formats[1],
                label: panel.rightYAxisLabel,
              }
            ];

            panel.xaxis = {
              show: panel['x-axis'],
            };

            delete panel.grid.leftMin;
            delete panel.grid.leftMax;
            delete panel.grid.leftLogBase;
            delete panel.grid.rightMin;
            delete panel.grid.rightMax;
            delete panel.grid.rightLogBase;
            delete panel.y_formats;
            delete panel.leftYAxisLabel;
            delete panel.rightYAxisLabel;
            delete panel['y-axis'];
            delete panel['x-axis'];
          }
        });
      }

      if (oldVersion < 13) {
        // update graph yaxes changes
        panelUpgrades.push(function(panel) {
          if (panel.type !== 'graph') { return; }
          if (!panel.grid) { return; }

          panel.thresholds = [];
          var t1: any = {}, t2: any = {};

          if (panel.grid.threshold1 !== null) {
            t1.value = panel.grid.threshold1;
            if (panel.grid.thresholdLine) {
              t1.line = true;
              t1.lineColor = panel.grid.threshold1Color;
              t1.colorMode = 'custom';
            } else {
              t1.fill = true;
              t1.fillColor = panel.grid.threshold1Color;
              t1.colorMode = 'custom';
            }
          }

          if (panel.grid.threshold2 !== null) {
            t2.value = panel.grid.threshold2;
            if (panel.grid.thresholdLine) {
              t2.line = true;
              t2.lineColor = panel.grid.threshold2Color;
              t2.colorMode = 'custom';
            } else {
              t2.fill = true;
              t2.fillColor = panel.grid.threshold2Color;
              t2.colorMode = 'custom';
            }
          }

          if (_.isNumber(t1.value)) {
            if (_.isNumber(t2.value)) {
              if (t1.value > t2.value) {
                t1.op = t2.op = 'lt';
                panel.thresholds.push(t1);
                panel.thresholds.push(t2);
              } else {
                t1.op = t2.op = 'gt';
                panel.thresholds.push(t1);
                panel.thresholds.push(t2);
              }
            } else {
              t1.op = 'gt';
              panel.thresholds.push(t1);
            }
          }

          delete panel.grid.threshold1;
          delete panel.grid.threshold1Color;
          delete panel.grid.threshold2;
          delete panel.grid.threshold2Color;
          delete panel.grid.thresholdLine;
        });
      }

      if (oldVersion < 14) {
        this.graphTooltip = old.sharedCrosshair ? 1 : 0;
      }

      if (oldVersion < 16) {
        this.upgradeToGridLayout(old);
      }

      if (panelUpgrades.length === 0) {
        return;
      }

      for (j = 0; j < this.panels.length; j++) {
        for (k = 0; k < panelUpgrades.length; k++) {
          panelUpgrades[k].call(this, this.panels[j]);
        }
      }
    }

    upgradeToGridLayout(old) {
      let yPos = 0;
      //let rowIds = 1000;
      //

      if (!old.rows) {
        return;
      }

      for (let row of old.rows) {
        let xPos = 0;
        let height: any = row.height || 250;

        // if (this.meta.keepRows) {
        //   this.panels.push({
        //     id: rowIds++,
        //     type: 'row',
        //     title: row.title,
        //     x: 0,
        //     y: yPos,
        //     height: 1,
        //     width: 12
        //   });
        //
        //   yPos += 1;
        // }

        if (_.isString(height)) {
          height = parseInt(height.replace('px', ''), 10);
        }

        const rowGridHeight = Math.ceil(height / CELL_HEIGHT);

        for (let panel of row.panels) {
          // should wrap to next row?
          if (xPos + panel.span >= 12) {
            yPos += rowGridHeight;
          }

          panel.gridPos = { x: xPos, y: yPos, w: panel.span, h: rowGridHeight };

          delete panel.span;

          xPos += panel.gridPos.w;

          this.panels.push(new PanelModel(panel));
        }

        yPos += rowGridHeight;
      }

    }
}
