package migrations

import (
	"fmt"
	"strings"
)

type Dialect interface {
	DriverName() string
	QuoteStr() string
	Quote(string) string
	AndStr() string
	AutoIncrStr() string
	OrStr() string
	EqStr() string
	ShowCreateNull() bool
	SqlType(col *Column) string

	CreateIndexSql(tableName string, index *Index) string
	CreateTableSql(table *Table) string
	AddColumnSql(tableName string, Col *Column) string

	TableCheckSql(tableName string) (string, []interface{})
}

type BaseDialect struct {
	dialect    Dialect
	driverName string
}

func (d *BaseDialect) DriverName() string {
	return d.driverName
}

func (b *BaseDialect) ShowCreateNull() bool {
	return true
}

func (b *BaseDialect) AndStr() string {
	return "AND"
}

func (b *BaseDialect) OrStr() string {
	return "OR"
}

func (b *BaseDialect) EqStr() string {
	return "="
}

func (b *BaseDialect) CreateTableSql(table *Table) string {
	var sql string
	sql = "CREATE TABLE IF NOT EXISTS "
	sql += b.dialect.Quote(table.Name) + " (\n"

	pkList := table.PrimaryKeys

	for _, col := range table.Columns {
		if col.IsPrimaryKey && len(pkList) == 1 {
			sql += col.String(b.dialect)
		} else {
			sql += col.StringNoPk(b.dialect)
		}
		sql = strings.TrimSpace(sql)
		sql += "\n, "
	}

	if len(pkList) > 1 {
		sql += "PRIMARY KEY ( "
		sql += b.dialect.Quote(strings.Join(pkList, b.dialect.Quote(",")))
		sql += " ), "
	}

	sql = sql[:len(sql)-2] + ")"
	sql += ";"
	return sql
}

func (db *BaseDialect) AddColumnSql(tableName string, col *Column) string {
	return fmt.Sprintf("alter table %s ADD COLUMN %s", tableName, col.StringNoPk(db.dialect))
}

func (db *BaseDialect) CreateIndexSql(tableName string, index *Index) string {
	quote := db.dialect.Quote
	var unique string
	var idxName string
	if index.Type == UniqueIndex {
		unique = " UNIQUE"
		idxName = fmt.Sprintf("UQE_%v_%v", tableName, index.Name)
	} else {
		idxName = fmt.Sprintf("IDX_%v_%v", tableName, index.Name)
	}

	return fmt.Sprintf("CREATE%s INDEX %v ON %v (%v);", unique,
		quote(idxName), quote(tableName),
		quote(strings.Join(index.Cols, quote(","))))
}
