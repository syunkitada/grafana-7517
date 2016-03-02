///<reference path="../../headers/common.d.ts" />

import angular from 'angular';
import _ from 'lodash';

export class PluginEditCtrl {
  model: any;
  pluginId: any;
  includedPanels: any;
  includedDatasources: any;
  tabIndex: number;
  preUpdateHook: () => any;
  postUpdateHook: () => any;

  /** @ngInject */
  constructor(private backendSrv: any, private $routeParams: any) {
    this.model = {};
    this.pluginId = $routeParams.pluginId;
    this.tabIndex = 0;

    this.backendSrv.get(`/api/org/plugins/${this.pluginId}/settings`).then(result => {
      this.model = result;
      this.includedPanels = _.where(result.includes, {type: 'panel'});
      this.includedDatasources = _.where(result.includes, {type: 'datasource'});
    });
  }

  update() {
    var chain = Promise.resolve();
    var self = this;
    // if set, handle the preUpdateHook. If this returns a promise,
    // the next step of execution will block until the promise resolves.
    // if the promise is rejected, this update will be aborted.
    if (this.preUpdateHook != null) {
      chain = chain.then(function() {
        return Promise.resolve(self.preUpdateHook());
      });
    }

    // Perform the core update procedure
    chain = chain.then(function() {
      var updateCmd = _.extend({
        pluginId: self.model.pluginId,
        orgId: self.model.orgId,
        enabled: self.model.enabled,
        pinned: self.model.pinned,
        jsonData: self.model.jsonData,
        secureJsonData: self.model.secureJsonData,
      }, {});

      return self.backendSrv.post(`/api/org/plugins/${self.pluginId}/settings`, updateCmd);
    });

    // if set, performt he postUpdate hook. If a promise is returned it will block
    // the final step of the update procedure (reloading the page) until the promise
    // resolves.  If the promise is rejected the page will not be reloaded. 
    if (this.postUpdateHook != null) {
      chain = chain.then(function() {
        return Promise.resolve(this.postUpdateHook());
      });
    }

    // all stesp in the update procedure are complete, so reload the page to make changes
    // take effect.
    chain.then(function() {
      window.location.href = window.location.href;
    });
  }

  setPreUpdateHook(callback: () => any) {
    this.preUpdateHook = callback;
  }

  setPOstUpdateHook(callback: () => any) {
    this.postUpdateHook = callback;
  }

  toggleEnabled() {
    this.update();
  }

  togglePinned() {
    this.update();
  }
}

angular.module('grafana.controllers').controller('PluginEditCtrl', PluginEditCtrl);

