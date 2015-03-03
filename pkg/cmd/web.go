// Copyright 2014 Unknwon
// Copyright 2014 Torkel Ödegaard

package cmd

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strconv"

	"github.com/Unknwon/macaron"
	"github.com/codegangsta/cli"
	"github.com/macaron-contrib/session"

	"github.com/grafana/grafana/pkg/api"
	"github.com/grafana/grafana/pkg/log"
	"github.com/grafana/grafana/pkg/middleware"
	"github.com/grafana/grafana/pkg/plugins"
	"github.com/grafana/grafana/pkg/services/eventpublisher"
	"github.com/grafana/grafana/pkg/setting"
	"github.com/grafana/grafana/pkg/social"
)

var Web = cli.Command{
	Name:        "web",
	Usage:       "Starts Grafana backend & web server",
	Description: "Starts Grafana backend & web server",
	Action:      runWeb,
}

func newMacaron() *macaron.Macaron {
	macaron.Env = setting.Env

	m := macaron.New()
	m.Use(middleware.Logger())
	m.Use(macaron.Recovery())
	if setting.EnableGzip {
		m.Use(macaron.Gziper())
	}

	mapStatic(m, "", "public")
	mapStatic(m, "app", "app")
	mapStatic(m, "css", "css")
	mapStatic(m, "img", "img")
	mapStatic(m, "fonts", "fonts")

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
	initRuntime(c)
	writePIDFile(c)

	social.NewOAuthService()
	eventpublisher.Init()
	plugins.Init()

	var err error
	m := newMacaron()
	api.Register(m)

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

func writePIDFile(c *cli.Context) {
	path := c.GlobalString("pidfile")
	if path == "" {
		return
	}

	// Ensure the required directory structure exists.
	err := os.MkdirAll(filepath.Dir(path), 0700)
	if err != nil {
		log.Fatal(3, "Failed to verify pid directory", err)
	}

	// Retrieve the PID and write it.
	pid := strconv.Itoa(os.Getpid())
	if err := ioutil.WriteFile(path, []byte(pid), 0644); err != nil {
		log.Fatal(3, "Failed to write pidfile", err)
	}
}
