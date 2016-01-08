package api

import (
	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/middleware"
	m "github.com/grafana/grafana/pkg/models"
)

func ValidateOrgPlaylist(c *middleware.Context) {
	id := c.ParamsInt64(":id")
	query := m.GetPlaylistByIdQuery{Id: id}
	err := bus.Dispatch(&query)

	if err != nil {
		c.JsonApiErr(404, "Playlist not found", err)
		return
	}

	if query.Result.OrgId != c.OrgId {
		c.JsonApiErr(403, "You are not allowed to edit/view playlist", nil)
		return
	}
}

func SearchPlaylists(c *middleware.Context) Response {
	query := c.Query("query")
	limit := c.QueryInt("limit")

	if limit == 0 {
		limit = 1000
	}

	searchQuery := m.PlaylistQuery{
		Title: query,
		Limit: limit,
		OrgId: c.OrgId,
	}

	err := bus.Dispatch(&searchQuery)
	if err != nil {
		return ApiError(500, "Search failed", err)
	}

	return Json(200, searchQuery.Result)
}

func GetPlaylist(c *middleware.Context) Response {
	id := c.ParamsInt64(":id")
	cmd := m.GetPlaylistByIdQuery{Id: id}

	if err := bus.Dispatch(&cmd); err != nil {
		return ApiError(500, "Playlist not found", err)
	}

	return Json(200, cmd.Result)
}

func GetPlaylistDashboards(c *middleware.Context) Response {
	id := c.ParamsInt64(":id")

	query := m.GetPlaylistDashboardsQuery{Id: id}
	if err := bus.Dispatch(&query); err != nil {
		return ApiError(500, "Playlist not found", err)
	}

	return Json(200, query.Result)
}

func DeletePlaylist(c *middleware.Context) Response {
	id := c.ParamsInt64(":id")

	cmd := m.DeletePlaylistQuery{Id: id}
	if err := bus.Dispatch(&cmd); err != nil {
		return ApiError(500, "Failed to delete playlist", err)
	}

	return Json(200, "")
}

func CreatePlaylist(c *middleware.Context, query m.CreatePlaylistQuery) Response {
	query.OrgId = c.OrgId
	err := bus.Dispatch(&query)
	if err != nil {
		return ApiError(500, "Failed to create playlist", err)
	}

	return Json(200, query.Result)
}

func UpdatePlaylist(c *middleware.Context, query m.UpdatePlaylistQuery) Response {
	err := bus.Dispatch(&query)
	if err != nil {
		return ApiError(500, "Failed to save playlist", err)
	}

	return Json(200, query.Result)
}
