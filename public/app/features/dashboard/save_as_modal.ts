///<reference path="../../headers/common.d.ts" />

import coreModule from 'app/core/core_module';

const  template = `
<div class="modal-body">
	<div class="modal-header">
		<h2 class="modal-header-title">
			<i class="fa fa-copy"></i>
			<span class="p-l-1">Save As...</span>
		</h2>

		<a class="modal-header-close" ng-click="ctrl.dismiss();">
			<i class="fa fa-remove"></i>
		</a>
	</div>

	<div class="modal-content">
		<div class="p-t-2">
			<div class="gf-form">
				<label class="gf-form-label">New name</label>
				<input type="text" class="gf-form-input" ng-model="ctrl.clone.title" give-focus="true" ng-keydown="ctrl.keyDown($event)">
			</div>
		</div>

		<div class="gf-form-button-row text-center">
			<a class="btn btn-success" ng-click="ctrl.save();">Save</a>
			<a class="btn-text" ng-click="ctrl.dismiss();">Cancel</a>
		</div>
	</div>
</div>
`;

export class SaveDashboardAsModalCtrl {
  clone: any;
  dismiss: () => void;

  /** @ngInject */
  constructor(private $scope, private dashboardSrv) {
    var dashboard = this.dashboardSrv.getCurrent();
    this.clone = dashboard.getSaveModelClone();
    this.clone.id = null;
    this.clone.title += ' Copy';
    this.clone.editable = true;
    this.clone.hideControls = false;

    // remove alerts
    this.clone.rows.forEach(row => {
      row.panels.forEach(panel => {
        delete panel.alert;
      });
    });

    delete this.clone.autoUpdate;
  }

  save() {
    return this.dashboardSrv.save(this.clone).then(this.dismiss);
  }

  keyDown(evt) {
    if (evt.keyCode === 13) {
      this.save();
    }
  }
}

export function saveDashboardAsDirective() {
  return {
    restrict: 'E',
    template: template,
    controller: SaveDashboardAsModalCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {dismiss: "&"}
  };
}

coreModule.directive('saveDashboardAsModal',  saveDashboardAsDirective);
