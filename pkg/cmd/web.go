// Copyright 2014 Unknwon
// Copyright 2014 Torkel Ödegaard

package cmd

import (
	"fmt"
	"net/http"
	"path"

	"github.com/Unknwon/macaron"
	"github.com/codegangsta/cli"
	"github.com/macaron-contrib/session"

	"github.com/torkelo/grafana-pro/pkg/api"
	"github.com/torkelo/grafana-pro/pkg/log"
	"github.com/torkelo/grafana-pro/pkg/middleware"
	"github.com/torkelo/grafana-pro/pkg/setting"
	"github.com/torkelo/grafana-pro/pkg/social"
	"github.com/torkelo/grafana-pro/pkg/stores/sqlstore"
)

var CmdWeb = cli.Command{
	Name:        "web",
	Usage:       "grafana web",
	Description: "Starts Grafana backend & web server",
	Action:      runWeb,
	Flags: []cli.Flag{
		cli.StringFlag{
			Name:  "config",
			Value: "grafana.ini",
			Usage: "path to config file",
		},
	},
}

func newMacaron() *macaron.Macaron {
	m := macaron.New()
	m.Use(middleware.Logger())
	m.Use(macaron.Recovery())

	mapStatic(m, "", "public")
	mapStatic(m, "app", "app")
	mapStatic(m, "css", "css")
	mapStatic(m, "img", "img")
	mapStatic(m, "font", "font")

	m.Use(session.Sessioner(setting.SessionOptions))

	m.Use(macaron.Renderer(macaron.RenderOptions{
		Directory:  path.Join(setting.StaticRootPath, "views"),
		IndentJSON: macaron.Env != macaron.PROD,
		Delims:     macaron.Delims{Left: "[[", Right: "]]"},
	}))

	m.Use(middleware.GetContextHandler())
	return m
}

func mapStatic(m *macaron.Macaron, dir string, prefix string) {
	m.Use(macaron.Static(
		path.Join(setting.StaticRootPath, dir),
		macaron.StaticOptions{
			SkipLogging: true,
			Prefix:      prefix,
		},
	))
}

func runWeb(c *cli.Context) {
	log.Info("Starting Grafana 2.0-alpha")

	setting.NewConfigContext()
	setting.InitServices()
	social.NewOAuthService()

	sqlstore.Init()
	sqlstore.NewEngine()

	m := newMacaron()
	api.Register(m)

	var err error
	listenAddr := fmt.Sprintf("%s:%s", setting.HttpAddr, setting.HttpPort)
	log.Info("Listen: %v://%s%s", setting.Protocol, listenAddr, setting.AppSubUrl)
	switch setting.Protocol {
	case setting.HTTP:
		err = http.ListenAndServe(listenAddr, m)
	case setting.HTTPS:
		err = http.ListenAndServeTLS(listenAddr, setting.CertFile, setting.KeyFile, m)
	default:
		log.Fatal(4, "Invalid protocol: %s", setting.Protocol)
	}

	if err != nil {
		log.Fatal(4, "Fail to start server: %v", err)
	}
}
