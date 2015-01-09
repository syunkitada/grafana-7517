package sqlstore

import (
	"time"

	"github.com/torkelo/grafana-pro/pkg/bus"
	m "github.com/torkelo/grafana-pro/pkg/models"

	"github.com/go-xorm/xorm"
)

func init() {
	bus.AddHandler("sql", GetDataSources)
	bus.AddHandler("sql", AddDataSource)
	bus.AddHandler("sql", DeleteDataSource)
	bus.AddHandler("sql", UpdateDataSource)
	bus.AddHandler("sql", GetDataSourceById)
}

func GetDataSourceById(query *m.GetDataSourceByIdQuery) error {
	sess := x.Limit(100, 0).Where("account_id=? AND id=?", query.AccountId, query.Id)
	has, err := sess.Get(&query.Result)

	if !has {
		return m.ErrDataSourceNotFound
	}
	return err
}

func GetDataSources(query *m.GetDataSourcesQuery) error {
	sess := x.Limit(100, 0).Where("account_id=?", query.AccountId).Asc("name")

	query.Result = make([]*m.DataSource, 0)
	return sess.Find(&query.Result)
}

func DeleteDataSource(cmd *m.DeleteDataSourceCommand) error {
	return inTransaction(func(sess *xorm.Session) error {
		var rawSql = "DELETE FROM data_source WHERE id=? and account_id=?"
		_, err := sess.Exec(rawSql, cmd.Id, cmd.AccountId)
		return err
	})
}

func AddDataSource(cmd *m.AddDataSourceCommand) error {

	return inTransaction(func(sess *xorm.Session) error {
		var err error

		ds := m.DataSource{
			AccountId: cmd.AccountId,
			Name:      cmd.Name,
			Type:      cmd.Type,
			Access:    cmd.Access,
			Url:       cmd.Url,
			User:      cmd.User,
			Password:  cmd.Password,
			Database:  cmd.Database,
			Created:   time.Now(),
			Updated:   time.Now(),
		}

		_, err = sess.Insert(&ds)
		cmd.Result = &ds

		return err
	})
}

func UpdateDataSource(cmd *m.UpdateDataSourceCommand) error {

	return inTransaction(func(sess *xorm.Session) error {
		var err error

		ds := m.DataSource{
			Id:        cmd.Id,
			AccountId: cmd.AccountId,
			Name:      cmd.Name,
			Type:      cmd.Type,
			Access:    cmd.Access,
			Url:       cmd.Url,
			User:      cmd.User,
			Password:  cmd.Password,
			Database:  cmd.Database,
			Updated:   time.Now(),
		}

		_, err = sess.Where("id=? and account_id=?", ds.Id, ds.AccountId).Update(&ds)
		return err
	})
}
