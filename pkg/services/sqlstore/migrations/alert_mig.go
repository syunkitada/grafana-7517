package migrations

import (
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addAlertMigrations(mg *Migrator) {

	alertV1 := Table{
		Name: "alert",
		Columns: []*Column{
			{Name: "id", Type: DB_BigInt, IsPrimaryKey: true, IsAutoIncrement: true},
			{Name: "dashboard_id", Type: DB_BigInt, Nullable: false},
			{Name: "panel_id", Type: DB_BigInt, Nullable: false},
			{Name: "org_id", Type: DB_BigInt, Nullable: false},
			{Name: "name", Type: DB_NVarchar, Length: 255, Nullable: false},
			{Name: "description", Type: DB_NVarchar, Length: 255, Nullable: false},
			{Name: "state", Type: DB_NVarchar, Length: 255, Nullable: false},
			{Name: "settings", Type: DB_Text, Nullable: false},
			{Name: "frequency", Type: DB_BigInt, Nullable: false},
			{Name: "handler", Type: DB_BigInt, Nullable: false},
			{Name: "enabled", Type: DB_Bool, Nullable: false},
			{Name: "created", Type: DB_DateTime, Nullable: false},
			{Name: "updated", Type: DB_DateTime, Nullable: false},
		},
	}

	// create table
	mg.AddMigration("create alert table v1", NewAddTableMigration(alertV1))

	alert_changes := Table{
		Name: "alert_change",
		Columns: []*Column{
			{Name: "id", Type: DB_BigInt, IsPrimaryKey: true, IsAutoIncrement: true},
			{Name: "alert_id", Type: DB_BigInt, Nullable: false},
			{Name: "org_id", Type: DB_BigInt, Nullable: false},
			{Name: "type", Type: DB_NVarchar, Length: 50, Nullable: false},
			{Name: "created", Type: DB_DateTime, Nullable: false},
		},
	}

	mg.AddMigration("create alert_change table v1", NewAddTableMigration(alert_changes))

	alert_state_log := Table{
		Name: "alert_state",
		Columns: []*Column{
			{Name: "id", Type: DB_BigInt, IsPrimaryKey: true, IsAutoIncrement: true},
			{Name: "alert_id", Type: DB_BigInt, Nullable: false},
			{Name: "org_id", Type: DB_BigInt, Nullable: false},
			{Name: "new_state", Type: DB_NVarchar, Length: 50, Nullable: false},
			{Name: "info", Type: DB_Text, Nullable: true},
			{Name: "created", Type: DB_DateTime, Nullable: false},
		},
	}

	mg.AddMigration("create alert_state_log table v1", NewAddTableMigration(alert_state_log))

	alert_heartbeat := Table{
		Name: "alert_heartbeat",
		Columns: []*Column{
			{Name: "id", Type: DB_BigInt, IsPrimaryKey: true, IsAutoIncrement: true},
			{Name: "server_id", Type: DB_NVarchar, Length: 50, Nullable: false},
			{Name: "created", Type: DB_DateTime, Nullable: false},
			{Name: "updated", Type: DB_DateTime, Nullable: false},
		},
	}

	mg.AddMigration("create alert_heartbeat table v1", NewAddTableMigration(alert_heartbeat))
}
