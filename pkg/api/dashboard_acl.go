package api

import (
	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/metrics"
	"github.com/grafana/grafana/pkg/middleware"
	m "github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/services/guardian"
	"github.com/grafana/grafana/pkg/util"
)

func GetDashboardAcl(c *middleware.Context) Response {
	dashId := c.ParamsInt64(":id")

	guardian := guardian.NewDashboardGuardian(dashId, c.OrgId, c.SignedInUser)

	if canView, err := guardian.CanView(); err != nil || !canView {
		return dashboardGuardianResponse(err)
	}

	query := m.GetDashboardPermissionsQuery{DashboardId: dashId}
	if err := bus.Dispatch(&query); err != nil {
		return ApiError(500, "Failed to get Dashboard ACL", err)
	}

	return Json(200, &query.Result)
}

func PostDashboardAcl(c *middleware.Context, cmd m.AddOrUpdateDashboardPermissionCommand) Response {
	dashId := c.ParamsInt64(":id")

	guardian := guardian.NewDashboardGuardian(dashId, c.OrgId, c.SignedInUser)
	if canSave, err := guardian.CanSave(); err != nil || !canSave {
		return dashboardGuardianResponse(err)
	}

	cmd.OrgId = c.OrgId
	cmd.DashboardId = dashId

	if err := bus.Dispatch(&cmd); err != nil {
		if err == m.ErrDashboardPermissionUserOrUserGroupEmpty {
			return ApiError(409, err.Error(), err)
		}
		return ApiError(500, "Failed to create permission", err)
	}

	metrics.M_Api_Dashboard_Acl_Create.Inc(1)

	return Json(200, &util.DynMap{
		"permissionId": cmd.Result.Id,
		"message":      "Permission created",
	})
}

func DeleteDashboardAclByUser(c *middleware.Context) Response {
	dashId := c.ParamsInt64(":id")
	userId := c.ParamsInt64(":userId")

	guardian := guardian.NewDashboardGuardian(dashId, c.OrgId, c.SignedInUser)
	if canSave, err := guardian.CanSave(); err != nil || !canSave {
		return dashboardGuardianResponse(err)
	}

	cmd := m.RemoveDashboardPermissionCommand{DashboardId: dashId, UserId: userId, OrgId: c.OrgId}

	if err := bus.Dispatch(&cmd); err != nil {
		return ApiError(500, "Failed to delete permission for user", err)
	}

	return Json(200, "")
}

func DeleteDashboardAclByUserGroup(c *middleware.Context) Response {
	dashId := c.ParamsInt64(":id")
	userGroupId := c.ParamsInt64(":userGroupId")

	guardian := guardian.NewDashboardGuardian(dashId, c.OrgId, c.SignedInUser)
	if canSave, err := guardian.CanSave(); err != nil || !canSave {
		return dashboardGuardianResponse(err)
	}

	cmd := m.RemoveDashboardPermissionCommand{DashboardId: dashId, UserGroupId: userGroupId, OrgId: c.OrgId}

	if err := bus.Dispatch(&cmd); err != nil {
		return ApiError(500, "Failed to delete permission for user", err)
	}

	return Json(200, "")
}
