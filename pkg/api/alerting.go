package api

import (
	"github.com/grafana/grafana/pkg/api/dtos"
	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/middleware"
	"github.com/grafana/grafana/pkg/models"
)

func ValidateOrgAlert(c *middleware.Context) {
	id := c.ParamsInt64(":alertId")
	query := models.GetAlertByIdQuery{Id: id}

	if err := bus.Dispatch(&query); err != nil {
		c.JsonApiErr(404, "Alert not found", nil)
		return
	}

	if c.OrgId != query.Result.OrgId {
		c.JsonApiErr(403, "You are not allowed to edit/view alert", nil)
		return
	}
}

// GET /api/alerting/changes
func GetAlertChanges(c *middleware.Context) Response {
	query := models.GetAlertChangesQuery{
		OrgId: c.OrgId,
	}

	limit := c.QueryInt64("limit")
	if limit == 0 {
		limit = 50
	}

	query.Limit = limit
	query.SinceId = c.QueryInt64("sinceId")

	if err := bus.Dispatch(&query); err != nil {
		return ApiError(500, "List alerts failed", err)
	}

	return Json(200, query.Result)
}

// GET /api/alerts
func GetAlerts(c *middleware.Context) Response {
	query := models.GetAlertsQuery{
		OrgId:       c.OrgId,
		State:       c.QueryStrings("state"),
		DashboardId: c.QueryInt64("dashboardId"),
		PanelId:     c.QueryInt64("panelId"),
	}

	if err := bus.Dispatch(&query); err != nil {
		return ApiError(500, "List alerts failed", err)
	}

	dashboardIds := make([]int64, 0)
	alertDTOs := make([]*dtos.AlertRuleDTO, 0)
	for _, alert := range query.Result {
		dashboardIds = append(dashboardIds, alert.DashboardId)
		alertDTOs = append(alertDTOs, &dtos.AlertRuleDTO{
			Id:          alert.Id,
			DashboardId: alert.DashboardId,
			PanelId:     alert.PanelId,
			Query:       alert.Query,
			QueryRefId:  alert.QueryRefId,
			WarnLevel:   alert.WarnLevel,
			CritLevel:   alert.CritLevel,
			Frequency:   alert.Frequency,
			Name:        alert.Name,
			Description: alert.Description,
			QueryRange:  alert.QueryRange,
			Aggregator:  alert.Aggregator,
			State:       alert.State,
		})
	}

	dashboardsQuery := models.GetDashboardsQuery{
		DashboardIds: dashboardIds,
	}

	if len(alertDTOs) > 0 {
		if err := bus.Dispatch(&dashboardsQuery); err != nil {
			return ApiError(500, "List alerts failed", err)
		}
	}

	//TODO: should be possible to speed this up with lookup table
	for _, alert := range alertDTOs {
		for _, dash := range *dashboardsQuery.Result {
			if alert.DashboardId == dash.Id {
				alert.DashbboardUri = "db/" + dash.Slug
			}
		}
	}

	return Json(200, alertDTOs)
}

// GET /api/alerts/:id
func GetAlert(c *middleware.Context) Response {
	id := c.ParamsInt64(":alertId")
	query := models.GetAlertByIdQuery{Id: id}

	if err := bus.Dispatch(&query); err != nil {
		return ApiError(500, "List alerts failed", err)
	}

	return Json(200, &query.Result)
}

// DEL /api/alerts/:id
func DelAlert(c *middleware.Context) Response {
	alertId := c.ParamsInt64(":alertId")

	if alertId == 0 {
		return ApiError(401, "Failed to parse alertid", nil)
	}

	cmd := models.DeleteAlertCommand{AlertId: alertId}

	if err := bus.Dispatch(&cmd); err != nil {
		return ApiError(500, "Failed to delete alert", err)
	}

	var resp = map[string]interface{}{"alertId": alertId}
	return Json(200, resp)
}

// GET /api/alerts/events/:id
func GetAlertStates(c *middleware.Context) Response {
	alertId := c.ParamsInt64(":alertId")

	query := models.GetAlertsStateQuery{
		AlertId: alertId,
	}

	if err := bus.Dispatch(&query); err != nil {
		return ApiError(500, "Failed get alert state log", err)
	}

	return Json(200, query.Result)
}

// PUT /api/alerts/events/:id
func PutAlertState(c *middleware.Context, cmd models.UpdateAlertStateCommand) Response {
	cmd.AlertId = c.ParamsInt64(":alertId")

	query := models.GetAlertByIdQuery{Id: cmd.AlertId}
	if err := bus.Dispatch(&query); err != nil {
		return ApiError(500, "Failed to get alertstate", err)
	}

	if query.Result.OrgId != 0 && query.Result.OrgId != c.OrgId {
		return ApiError(500, "Alert not found", nil)
	}

	if err := bus.Dispatch(&cmd); err != nil {
		return ApiError(500, "Failed to set new state", err)
	}

	return Json(200, cmd.Result)
}
