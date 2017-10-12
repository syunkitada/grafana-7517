package api

import (
	"crypto/tls"
	"net"
	"net/http"
	"time"

	"github.com/grafana/grafana/pkg/api/pluginproxy"
	"github.com/grafana/grafana/pkg/log"
	"github.com/grafana/grafana/pkg/middleware"
	m "github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/plugins"
	"github.com/grafana/grafana/pkg/util"
	macaron "gopkg.in/macaron.v1"
)

var pluginProxyTransport = &http.Transport{
	TLSClientConfig: &tls.Config{
		InsecureSkipVerify: true,
		Renegotiation:      tls.RenegotiateFreelyAsClient,
	},
	Proxy: http.ProxyFromEnvironment,
	Dial: (&net.Dialer{
		Timeout:   30 * time.Second,
		KeepAlive: 30 * time.Second,
		DualStack: true,
	}).Dial,
	TLSHandshakeTimeout: 10 * time.Second,
}

func InitAppPluginRoutes(r *macaron.Macaron) {
	for _, plugin := range plugins.Apps {
		for _, route := range plugin.Routes {
			url := util.JoinUrlFragments("/api/plugin-proxy/"+plugin.Id, route.Path)
			handlers := make([]macaron.Handler, 0)
			handlers = append(handlers, middleware.Auth(&middleware.AuthOptions{
				ReqSignedIn: true,
			}))

			if route.ReqRole != "" {
				if route.ReqRole == m.ROLE_ADMIN {
					handlers = append(handlers, middleware.RoleAuth(m.ROLE_ADMIN))
				} else if route.ReqRole == m.ROLE_EDITOR {
					handlers = append(handlers, middleware.RoleAuth(m.ROLE_EDITOR, m.ROLE_ADMIN))
				}
			}
			handlers = append(handlers, AppPluginRoute(route, plugin.Id))
			r.Route(url, route.Method, handlers...)
			log.Debug("Plugins: Adding proxy route %s", url)
		}
	}
}

func AppPluginRoute(route *plugins.AppPluginRoute, appId string) macaron.Handler {
	return func(c *middleware.Context) {
		path := c.Params("*")

		proxy := pluginproxy.NewApiPluginProxy(c, path, route, appId)
		proxy.Transport = pluginProxyTransport
		proxy.ServeHTTP(c.Resp, c.Req.Request)
	}
}
