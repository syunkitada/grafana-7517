package sqlstore

import (
	"fmt"
	"time"

	"github.com/grafana/grafana/pkg/bus"
	m "github.com/grafana/grafana/pkg/models"
)

func init() {
	bus.AddHandler("sql", SetDashboardAcl)
	bus.AddHandler("sql", UpdateDashboardAcl)
	bus.AddHandler("sql", RemoveDashboardAcl)
	bus.AddHandler("sql", GetDashboardAclInfoList)
}

func UpdateDashboardAcl(cmd *m.UpdateDashboardAclCommand) error {
	return inTransaction(func(sess *DBSession) error {
		// delete existing items
		_, err := sess.Exec("DELETE FROM dashboard_acl WHERE dashboard_id=?", cmd.DashboardId)
		if err != nil {
			return err
		}

		for _, item := range cmd.Items {
			if item.UserId == 0 && item.UserGroupId == 0 && !item.Role.IsValid() {
				return m.ErrDashboardAclInfoMissing
			}

			if item.DashboardId == 0 {
				return m.ErrDashboardPermissionDashboardEmpty
			}

			sess.Nullable("user_id", "user_group_id")
			if _, err := sess.Insert(item); err != nil {
				return err
			}
		}

		// Update dashboard HasAcl flag
		dashboard := m.Dashboard{HasAcl: true}
		if _, err := sess.Cols("has_acl").Where("id=? OR folder_id=?", cmd.DashboardId, cmd.DashboardId).Update(&dashboard); err != nil {
			return err
		}
		return nil
	})
}

func SetDashboardAcl(cmd *m.SetDashboardAclCommand) error {
	return inTransaction(func(sess *DBSession) error {
		if cmd.UserId == 0 && cmd.UserGroupId == 0 {
			return m.ErrDashboardAclInfoMissing
		}

		if cmd.DashboardId == 0 {
			return m.ErrDashboardPermissionDashboardEmpty
		}

		if res, err := sess.Query("SELECT 1 from "+dialect.Quote("dashboard_acl")+" WHERE dashboard_id =? and (user_group_id=? or user_id=?)", cmd.DashboardId, cmd.UserGroupId, cmd.UserId); err != nil {
			return err
		} else if len(res) == 1 {

			entity := m.DashboardAcl{
				Permission: cmd.Permission,
				Updated:    time.Now(),
			}

			if _, err := sess.Cols("updated", "permission").Where("dashboard_id =? and (user_group_id=? or user_id=?)", cmd.DashboardId, cmd.UserGroupId, cmd.UserId).Update(&entity); err != nil {
				return err
			}

			return nil
		}

		entity := m.DashboardAcl{
			OrgId:       cmd.OrgId,
			UserGroupId: cmd.UserGroupId,
			UserId:      cmd.UserId,
			Created:     time.Now(),
			Updated:     time.Now(),
			DashboardId: cmd.DashboardId,
			Permission:  cmd.Permission,
		}

		cols := []string{"org_id", "created", "updated", "dashboard_id", "permission"}

		if cmd.UserId != 0 {
			cols = append(cols, "user_id")
		}

		if cmd.UserGroupId != 0 {
			cols = append(cols, "user_group_id")
		}

		_, err := sess.Cols(cols...).Insert(&entity)
		if err != nil {
			return err
		}

		cmd.Result = entity

		// Update dashboard HasAcl flag
		dashboard := m.Dashboard{
			HasAcl: true,
		}

		if _, err := sess.Cols("has_acl").Where("id=? OR folder_id=?", cmd.DashboardId, cmd.DashboardId).Update(&dashboard); err != nil {
			return err
		}

		return nil
	})
}

func RemoveDashboardAcl(cmd *m.RemoveDashboardAclCommand) error {
	return inTransaction(func(sess *DBSession) error {
		var rawSQL = "DELETE FROM " + dialect.Quote("dashboard_acl") + " WHERE org_id =? and id=?"
		_, err := sess.Exec(rawSQL, cmd.OrgId, cmd.AclId)
		if err != nil {
			return err
		}

		return err
	})
}

func GetDashboardAclInfoList(query *m.GetDashboardAclInfoListQuery) error {
	dashboardFilter := fmt.Sprintf(`IN (
    SELECT %d
    UNION
    SELECT folder_id from dashboard where id = %d
  )`, query.DashboardId, query.DashboardId)

	rawSQL := `
	SELECT
		da.id,
		da.org_id,
		da.dashboard_id,
		da.user_id,
		da.user_group_id,
		da.permission,
		da.role,
		da.created,
		da.updated,
		u.login AS user_login,
		u.email AS user_email,
		ug.name AS user_group
  FROM` + dialect.Quote("dashboard_acl") + ` as da
		LEFT OUTER JOIN ` + dialect.Quote("user") + ` AS u ON u.id = da.user_id
		LEFT OUTER JOIN user_group ug on ug.id = da.user_group_id
	WHERE dashboard_id ` + dashboardFilter + ` AND da.org_id = ?

	-- Also include default permission if has_acl = 0

	UNION
		SELECT
			da.id,
			da.org_id,
			da.dashboard_id,
			da.user_id,
			da.user_group_id,
			da.permission,
			da.role,
			da.created,
			da.updated,
			'' as user_login,
			'' as user_email,
			'' as user_group
			FROM dashboard_acl as da, dashboard as dash
			WHERE dash.id = ? AND dash.has_acl = 0 AND da.dashboard_id = -1
	`

	query.Result = make([]*m.DashboardAclInfoDTO, 0)
	err := x.SQL(rawSQL, query.OrgId, query.DashboardId).Find(&query.Result)

	for _, p := range query.Result {
		p.PermissionName = p.Permission.String()
	}

	return err
}
