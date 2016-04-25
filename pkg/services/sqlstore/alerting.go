package sqlstore

import (
	"fmt"
	"github.com/go-xorm/xorm"
	"github.com/grafana/grafana/pkg/bus"
	m "github.com/grafana/grafana/pkg/models"
	"time"
)

func init() {
	bus.AddHandler("sql", SaveAlerts)
}

func SaveAlertChange(change string, alert m.AlertRule) error {
	return inTransaction(func(sess *xorm.Session) error {
		_, err := sess.Insert(&m.AlertRuleChange{
			OrgId:   alert.OrgId,
			Type:    change,
			Created: time.Now(),
			AlertId: alert.Id,
		})

		if err != nil {
			return err
		}

		return nil
	})
}

func alertIsDifferent(rule1, rule2 m.AlertRule) bool {
	result := false

	result = result || rule1.Aggregator != rule2.Aggregator
	result = result || rule1.CritLevel != rule2.CritLevel
	result = result || rule1.WarnLevel != rule2.WarnLevel
	result = result || rule1.Query != rule2.Query
	result = result || rule1.QueryRefId != rule2.QueryRefId
	result = result || rule1.Interval != rule2.Interval
	result = result || rule1.Title != rule2.Title
	result = result || rule1.Description != rule2.Description
	result = result || rule1.QueryRange != rule2.QueryRange

	return result
}

func SaveAlerts(cmd *m.SaveAlertsCommand) error {
	//this function should be refactored

	fmt.Printf("Saving alerts for dashboard %v\n", cmd.DashboardId)

	alerts, err := GetAlertsByDashboardId(cmd.DashboardId)
	if err != nil {
		return err
	}

	for _, alert := range *cmd.Alerts {
		update := false
		var alertToUpdate m.AlertRule

		for _, k := range alerts {
			if alert.PanelId == k.PanelId {
				update = true
				alert.Id = k.Id
				alertToUpdate = k
			}
		}

		if update {

			if alertIsDifferent(alertToUpdate, alert) {
				_, err = x.Id(alert.Id).Update(&alert)
				if err != nil {
					return err
				}

				SaveAlertChange("UPDATED", alert)
			}

		} else {
			_, err = x.Insert(&alert)
			if err != nil {
				return err
			}
			SaveAlertChange("CREATED", alert)
		}
	}

	for _, missingAlert := range alerts {
		missing := true

		for _, k := range *cmd.Alerts {
			if missingAlert.PanelId == k.PanelId {
				missing = false
			}
		}

		if missing {
			_, err = x.Exec("DELETE FROM alert_rule WHERE id = ?", missingAlert.Id)
			if err != nil {
				return err
			}

			err = SaveAlertChange("DELETED", missingAlert)
			if err != nil {
				return err
			}
		}
	}

	return nil
}

func GetAlertsByDashboardId(dashboardId int64) ([]m.AlertRule, error) {
	alerts := make([]m.AlertRule, 0)
	err := x.Where("dashboard_id = ?", dashboardId).Find(&alerts)

	if err != nil {
		return []m.AlertRule{}, err
	}

	return alerts, nil
}

func GetAlertsByDashboardAndPanelId(dashboardId, panelId int64) (m.AlertRule, error) {
	// this code should be refactored!!
	// uniqueness should be garanted!

	alerts := make([]m.AlertRule, 0)
	err := x.Where("dashboard_id = ? and panel_id = ?", dashboardId, panelId).Find(&alerts)

	if err != nil {
		return m.AlertRule{}, err
	}

	if len(alerts) != 1 {
		return m.AlertRule{}, err
	}

	return alerts[0], nil
}

func GetAlertRuleChanges(orgid int64) ([]m.AlertRuleChange, error) {
	alertChanges := make([]m.AlertRuleChange, 0)
	err := x.Where("org_id = ?", orgid).Find(&alertChanges)

	if err != nil {
		return []m.AlertRuleChange{}, err
	}

	return alertChanges, nil
}
