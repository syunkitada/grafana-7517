package middleware

import (
	ms "github.com/go-macaron/session"
	"gopkg.in/macaron.v1"

	m "github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/services/session"
)

func Sessioner(options *ms.Options) macaron.Handler {
	session.Init(options)

	return func(ctx *m.Context) {
		ctx.Next()

		if err := ctx.Session.Release(); err != nil {
			panic("session(release): " + err.Error())
		}
	}
}
