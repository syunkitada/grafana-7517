package sqlstore

import (
	"time"

	"github.com/go-xorm/xorm"
	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/log"
	sqlite3 "github.com/mattn/go-sqlite3"
)

type dbTransactionFunc func(sess *xorm.Session) error
type dbTransactionFunc2 func(sess *session) error

type session struct {
	*xorm.Session
	events []interface{}
}

func (sess *session) publishAfterCommit(msg interface{}) {
	sess.events = append(sess.events, msg)
}

func inTransaction(callback dbTransactionFunc) error {
	return inTransactionWithRetry(callback, 0)
}

func inTransactionWithRetry(callback dbTransactionFunc, retry int) error {
	var err error

	sess := x.NewSession()
	defer sess.Close()

	if err = sess.Begin(); err != nil {
		return err
	}

	err = callback(sess)

	// special handling of database locked errors for sqlite, then we can retry 3 times
	if sqlError, ok := err.(sqlite3.Error); ok && retry < 5 {
		if sqlError.Code == sqlite3.ErrLocked {
			sess.Rollback()
			time.Sleep(time.Millisecond * time.Duration(10))
			sqlog.Info("Database table locked, sleeping then retrying", "retry", retry)
			return inTransactionWithRetry(callback, retry+1)
		}
	}

	if err != nil {
		sess.Rollback()
		return err
	} else if err = sess.Commit(); err != nil {
		return err
	}

	return nil
}

func inTransaction2(callback dbTransactionFunc2) error {
	var err error

	sess := session{Session: x.NewSession()}

	defer sess.Close()
	if err = sess.Begin(); err != nil {
		return err
	}

	err = callback(&sess)

	if err != nil {
		sess.Rollback()
		return err
	} else if err = sess.Commit(); err != nil {
		return err
	}

	if len(sess.events) > 0 {
		for _, e := range sess.events {
			if err = bus.Publish(e); err != nil {
				log.Error(3, "Failed to publish event after commit", err)
			}
		}
	}

	return nil
}
