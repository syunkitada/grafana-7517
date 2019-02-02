// Libaries
import { StoreState } from 'app/types';
import { ThunkAction } from 'redux-thunk';

// Services & Utils
import { getBackendSrv } from 'app/core/services/backend_srv';
import { actionCreatorFactory } from 'app/core/redux';
import { ActionOf } from 'app/core/redux/actionCreatorFactory';
import { createSuccessNotification } from 'app/core/copy/appNotification';

// Actions
import { loadPluginDashboards } from '../../plugins/state/actions';
import { notifyApp } from 'app/core/actions';

// Types
import {
  DashboardAcl,
  DashboardAclDTO,
  PermissionLevel,
  DashboardAclUpdateDTO,
  NewDashboardAclItem,
} from 'app/types/acl';
import { DashboardLoadingState, MutableDashboard } from 'app/types/dashboard';

export const loadDashboardPermissions = actionCreatorFactory<DashboardAclDTO[]>('LOAD_DASHBOARD_PERMISSIONS').create();
export const setDashboardLoadingState = actionCreatorFactory<DashboardLoadingState>('SET_DASHBOARD_LOADING_STATE').create();
export const setDashboardModel = actionCreatorFactory<MutableDashboard>('SET_DASHBOARD_MODEL').create();

export type Action = ActionOf<DashboardAclDTO[]>;

export type ThunkResult<R> = ThunkAction<R, StoreState, undefined, any>;

export function getDashboardPermissions(id: number): ThunkResult<void> {
  return async dispatch => {
    const permissions = await getBackendSrv().get(`/api/dashboards/id/${id}/permissions`);
    dispatch(loadDashboardPermissions(permissions));
  };
}

function toUpdateItem(item: DashboardAcl): DashboardAclUpdateDTO {
  return {
    userId: item.userId,
    teamId: item.teamId,
    role: item.role,
    permission: item.permission,
  };
}

export function updateDashboardPermission(
  dashboardId: number,
  itemToUpdate: DashboardAcl,
  level: PermissionLevel
): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const { dashboard } = getStore();
    const itemsToUpdate = [];

    for (const item of dashboard.permissions) {
      if (item.inherited) {
        continue;
      }

      const updated = toUpdateItem(item);

      // if this is the item we want to update, update it's permission
      if (itemToUpdate === item) {
        updated.permission = level;
      }

      itemsToUpdate.push(updated);
    }

    await getBackendSrv().post(`/api/dashboards/id/${dashboardId}/permissions`, { items: itemsToUpdate });
    await dispatch(getDashboardPermissions(dashboardId));
  };
}

export function removeDashboardPermission(dashboardId: number, itemToDelete: DashboardAcl): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const dashboard = getStore().dashboard;
    const itemsToUpdate = [];

    for (const item of dashboard.permissions) {
      if (item.inherited || item === itemToDelete) {
        continue;
      }
      itemsToUpdate.push(toUpdateItem(item));
    }

    await getBackendSrv().post(`/api/dashboards/id/${dashboardId}/permissions`, { items: itemsToUpdate });
    await dispatch(getDashboardPermissions(dashboardId));
  };
}

export function addDashboardPermission(dashboardId: number, newItem: NewDashboardAclItem): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const { dashboard } = getStore();
    const itemsToUpdate = [];

    for (const item of dashboard.permissions) {
      if (item.inherited) {
        continue;
      }
      itemsToUpdate.push(toUpdateItem(item));
    }

    itemsToUpdate.push({
      userId: newItem.userId,
      teamId: newItem.teamId,
      role: newItem.role,
      permission: newItem.permission,
    });

    await getBackendSrv().post(`/api/dashboards/id/${dashboardId}/permissions`, { items: itemsToUpdate });
    await dispatch(getDashboardPermissions(dashboardId));
  };
}

export function importDashboard(data, dashboardTitle: string): ThunkResult<void> {
  return async dispatch => {
    await getBackendSrv().post('/api/dashboards/import', data);
    dispatch(notifyApp(createSuccessNotification('Dashboard Imported', dashboardTitle)));
    dispatch(loadPluginDashboards());
  };
}

export function removeDashboard(uri: string): ThunkResult<void> {
  return async dispatch => {
    await getBackendSrv().delete(`/api/dashboards/${uri}`);
    dispatch(loadPluginDashboards());
  };
}

