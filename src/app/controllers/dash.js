/** @scratch /index/0
 * = Kibana
 *
 * // Why can't I have a preamble here?
 *
 * == Introduction
 *
 * Kibana is an open source (Apache Licensed), browser based analytics and search dashboard for
 * ElasticSearch. Kibana is a snap to setup and start using. Written entirely in HTML and Javascript
 * it requires only a plain webserver, Kibana requires no fancy server side components.
 * Kibana strives to be easy to get started with, while also being flexible and powerful, just like
 * Elasticsearch.
 *
 * include::configuration/config.js.asciidoc[]
 *
 * include::panels.asciidoc[]
 *
 */

define([
  'angular',
  'jquery',
  'config',
  'underscore',
  'services/all'
],
function (angular, $, config, _) {
  "use strict";

  var module = angular.module('kibana.controllers');

  module.controller('DashCtrl', function(
    $scope, $rootScope, $route, ejsResource, dashboard, alertSrv, panelMove, keyboardManager, grafanaVersion) {

    $scope.requiredElasticSearchVersion = ">=0.90.3";

    $scope.editor = {
      index: 0
    };

    $scope.grafanaVersion = grafanaVersion[0] === '@' ? 'version: master' : grafanaVersion;

    // For moving stuff around the dashboard.
    $scope.panelMoveDrop = panelMove.onDrop;
    $scope.panelMoveStart = panelMove.onStart;
    $scope.panelMoveStop = panelMove.onStop;
    $scope.panelMoveOver = panelMove.onOver;
    $scope.panelMoveOut = panelMove.onOut;


    $scope.init = function() {
      $scope.config = config;
      // Make stuff, including underscore.js available to views
      $scope._ = _;
      $scope.dashboard = dashboard;
      $scope.dashAlerts = alertSrv;

      // Clear existing alerts
      alertSrv.clearAll();

      $scope.reset_row();

      $scope.ejs = ejsResource(config.elasticsearch, config.elasticsearchBasicAuth);

      $scope.bindKeyboardShortcuts();
    };

    $scope.bindKeyboardShortcuts = function() {
      $rootScope.$on('panel-fullscreen-enter', function() {
        $rootScope.fullscreen = true;
      });

      $rootScope.$on('panel-fullscreen-exit', function() {
        $rootScope.fullscreen = false;
      });

      $rootScope.$on('dashboard-saved', function() {
        if ($rootScope.fullscreen) {
          $rootScope.$emit('panel-fullscreen-exit');
        }
      });

      keyboardManager.bind('ctrl+f', function(evt) {
        $rootScope.$emit('open-search', evt);
      }, { inputDisabled: true });

      keyboardManager.bind('ctrl+h', function() {
        var current = dashboard.current.hideControls;
        dashboard.current.hideControls = !current;
        dashboard.current.panel_hints = current;
      }, { inputDisabled: true });

      keyboardManager.bind('ctrl+s', function(evt) {
        $rootScope.$emit('save-dashboard', evt);
      }, { inputDisabled: true });

      keyboardManager.bind('ctrl+r', function() {
        dashboard.refresh();
      }, { inputDisabled: true });

      keyboardManager.bind('ctrl+z', function(evt) {
        $rootScope.$emit('zoom-out', evt);
      }, { inputDisabled: true });

      keyboardManager.bind('esc', function() {
        var popups = $('.popover.in');
        if (popups.length > 0) {
          return;
        }
        $rootScope.$emit('panel-fullscreen-exit');
      }, { inputDisabled: true });
    };

    $scope.countWatchers = function (scopeStart) {
      var q = [scopeStart || $rootScope], watchers = 0, scope;
      while (q.length > 0) {
        scope = q.pop();
        if (scope.$$watchers) {
          watchers += scope.$$watchers.length;
        }
        if (scope.$$childHead) {
          q.push(scope.$$childHead);
        }
        if (scope.$$nextSibling) {
          q.push(scope.$$nextSibling);
        }
      }
      window.console.log(watchers);
    };

    $scope.isPanel = function(obj) {
      if(!_.isNull(obj) && !_.isUndefined(obj) && !_.isUndefined(obj.type)) {
        return true;
      } else {
        return false;
      }
    };

    $scope.add_row = function(dash,row) {
      dash.rows.push(row);
    };

    $scope.reset_row = function() {
      $scope.row = {
        title: '',
        height: '150px',
        editable: true,
      };
    };

    $scope.row_style = function(row) {
      return { 'min-height': row.collapse ? '5px' : row.height };
    };

    $scope.panel_path =function(type) {
      if(type) {
        return 'app/panels/'+type.replace(".","/");
      } else {
        return false;
      }
    };

    $scope.edit_path = function(type) {
      var p = $scope.panel_path(type);
      if(p) {
        return p+'/editor.html';
      } else {
        return false;
      }
    };

    $scope.setEditorTabs = function(panelMeta) {
      $scope.editorTabs = ['General','Panel'];
      if(!_.isUndefined(panelMeta.editorTabs)) {
        $scope.editorTabs =  _.union($scope.editorTabs,_.pluck(panelMeta.editorTabs,'title'));
      }
      return $scope.editorTabs;
    };

    // This is whoafully incomplete, but will do for now
    $scope.parse_error = function(data) {
      var _error = data.match("nested: (.*?);");
      return _.isNull(_error) ? data : _error[1];
    };

    $scope.colors = [
      "#7EB26D","#EAB839","#6ED0E0","#EF843C","#E24D42","#1F78C1","#BA43A9","#705DA0", //1
      "#508642","#CCA300","#447EBC","#C15C17","#890F02","#0A437C","#6D1F62","#584477", //2
      "#B7DBAB","#F4D598","#70DBED","#F9BA8F","#F29191","#82B5D8","#E5A8E2","#AEA2E0", //3
      "#629E51","#E5AC0E","#64B0C8","#E0752D","#BF1B00","#0A50A1","#962D82","#614D93", //4
      "#9AC48A","#F2C96D","#65C5DB","#F9934E","#EA6460","#5195CE","#D683CE","#806EB7", //5
      "#3F6833","#967302","#2F575E","#99440A","#58140C","#052B51","#511749","#3F2B5B", //6
      "#E0F9D7","#FCEACA","#CFFAFF","#F9E2D2","#FCE2DE","#BADFF4","#F9D9F9","#DEDAF7"  //7
    ];

    $scope.init();
  });
});