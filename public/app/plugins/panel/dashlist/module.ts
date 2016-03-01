///<reference path="../../../headers/common.d.ts" />

import _ from 'lodash';
import config from 'app/core/config';
import {PanelCtrl} from 'app/plugins/sdk';
import {impressions} from 'app/features/dashboard/impression_store';

 // Set and populate defaults
var panelDefaults = {
  mode: 'starred',
  query: '',
  limit: 10,
  tags: []
};

class DashListCtrl extends PanelCtrl {
  static templateUrl = 'module.html';

  dashList: any[];
  modes: any[];

  /** @ngInject */
  constructor($scope, $injector, private backendSrv) {
    super($scope, $injector);
    _.defaults(this.panel, panelDefaults);

    if (this.panel.tag) {
      this.panel.tags = [$scope.panel.tag];
      delete this.panel.tag;
    }
  }

  initEditMode() {
    super.initEditMode();
    this.modes = ['starred', 'search', 'recently viewed'];
    this.icon = "fa fa-star";
    this.addEditorTab('Options', () => {
      return {templateUrl: 'public/app/plugins/panel/dashlist/editor.html'};
    });
  }

  refresh() {
    var params: any = {limit: this.panel.limit};

    if (this.panel.mode === 'recently viewed') {

      var dashListNames = impressions.getDashboardOpened().filter((imp) => {
        return imp.orgId === config.bootData.user.orgId;
      });

      dashListNames = _.first(dashListNames, params.limit).map((dashboard) => {
        return {
          title: dashboard.title,
          uri: dashboard.type + '/' + dashboard.slug
        };
      });


      this.dashList = dashListNames;
      this.renderingCompleted();
      return;
    }

    if (this.panel.mode === 'starred') {
      params.starred = "true";
    } else {
      params.query = this.panel.query;
      params.tag = this.panel.tags;
    }

    return this.backendSrv.search(params).then(result => {
      this.dashList = result;
      this.renderingCompleted();
    });
  }
}

export {DashListCtrl, DashListCtrl as PanelCtrl}
