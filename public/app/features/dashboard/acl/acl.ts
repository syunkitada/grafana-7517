///<reference path="../../../headers/common.d.ts" />

import coreModule from 'app/core/core_module';
import appEvents from 'app/core/app_events';
import _ from 'lodash';

export class AclCtrl {
  tabIndex: any;
  dashboard: any;
  userPermissions: Permission[];
  userGroupPermissions: Permission[];
  permissionTypeOptions = [
    {value: 1, text: 'View'},
    {value: 2, text: 'Read-only Edit'},
    {value: 4, text: 'Edit'}
  ];
  userLogin: string;
  userId: number;
  userSegment: any;
  type = 'User';
  userGroupId: number;
  userGroupSegment: any;
  permission = 1;

  /** @ngInject */
  constructor(private backendSrv, private $scope, $sce, private uiSegmentSrv) {
    this.tabIndex = 0;
    this.userPermissions = [];
    this.userGroupPermissions = [];
    this.get(this.dashboard.id);
  }

  get(dashboardId: number) {
    return this.backendSrv.get(`/api/dashboards/${dashboardId}/acl`)
      .then(result => {
        this.userPermissions = _.filter(result, p => { return p.userId > 0;});
        this.userGroupPermissions = _.filter(result, p => { return p.userGroupId > 0;});
      });
  }

  addPermission() {
    if (this.type === 'User') {
      if (this.userSegment.value === 'Choose User') {
        return;
      }

      this.backendSrv.post(`/api/dashboards/${this.dashboard.id}/acl`, {
        userId: this.userId,
        permissionType: this.permission
      }).then(() => {
        this.userId = 0;
        this.userLogin = '';
        this.userSegment.value = 'Choose User';
        this.userSegment.text = 'Choose User';
        this.userSegment.html = 'Choose User';
        this.get(this.dashboard.id);
      });
    } else {
      if (this.userGroupSegment.value === 'Choose User Group') {
        return;
      }

      this.backendSrv.post(`/api/dashboards/${this.dashboard.id}/acl`, {
        userGroupId: this.userGroupId,
        permissionType: this.permission
      }).then(() => {
        this.userGroupId = 0;
        this.userGroupSegment.value = 'Choose User Group';
        this.userGroupSegment.text = 'Choose User Group';
        this.userGroupSegment.html = 'Choose User Group';
        this.get(this.dashboard.id);
      });
    }
  }

  removeUserPermission(permission: Permission) {
    this.backendSrv.delete(`/api/dashboards/${permission.dashboardId}/acl/user/${permission.userId}`).then(() => {
      this.get(permission.dashboardId);
    });
  }

  removeUserGroupPermission(permission: Permission) {
    this.backendSrv.delete(`/api/dashboards/${permission.dashboardId}/acl/user-group/${permission.userGroupId}`).then(() => {
      this.get(permission.dashboardId);
    });
  }
}

export function aclSettings() {
  return {
    restrict: 'E',
    templateUrl: 'public/app/features/dashboard/acl/acl.html',
    controller: AclCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: { dashboard: "=" }
  };
}

export interface FormModel {
  dashboardId: number;
  userId?: number;
  userGroupId?: number;
  PermissionType: number;
}

export interface Permission {
  id: number;
  orgId: number;
  dashboardId: number;
  created: Date;
  updated: Date;
  userId: number;
  userLogin: number;
  userEmail: string;
  userGroupId: number;
  userGroup: string;
  permissions: string[];
  permissionType: number[];
}

coreModule.directive('aclSettings', aclSettings);
