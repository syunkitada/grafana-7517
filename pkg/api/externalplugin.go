package api

import (
	"encoding/json"
	"net/http"
	"net/http/httputil"
	"net/url"

	"github.com/Unknwon/macaron"
	"github.com/grafana/grafana/pkg/log"
	"github.com/grafana/grafana/pkg/middleware"
	"github.com/grafana/grafana/pkg/plugins"
	"github.com/grafana/grafana/pkg/util"
)

func InitExternalPluginRoutes(r *macaron.Macaron) {
	/*
		// Handle Auth and role requirements
		if route.ReqSignedIn {
			c.Invoke(middleware.Auth(&middleware.AuthOptions{ReqSignedIn: true}))
		}
		if route.ReqGrafanaAdmin {
			c.Invoke(middleware.Auth(&middleware.AuthOptions{ReqSignedIn: true, ReqGrafanaAdmin: true}))
		}
		if route.ReqRole != nil {
			if *route.ReqRole == m.ROLE_EDITOR {
				c.Invoke(middleware.RoleAuth(m.ROLE_EDITOR, m.ROLE_ADMIN))
			}
			if *route.ReqRole == m.ROLE_ADMIN {
				c.Invoke(middleware.RoleAuth(m.ROLE_ADMIN))
			}
		}
	*/
	for _, plugin := range plugins.ExternalPlugins {
		log.Info("Plugin: Adding proxy routes for backend plugin")
		for _, route := range plugin.Routes {
			log.Info("Plugin: Adding route %s /api/plugin-proxy/%s", route.Method, route.Path)
			r.Route(util.JoinUrlFragments("/api/plugin-proxy/", route.Path), route.Method, ExternalPlugin(route.Url))
		}
	}
}

func ExternalPlugin(routeUrl string) macaron.Handler {
	return func(c *middleware.Context) {
		path := c.Params("*")

		//Create a HTTP header with the context in it.
		ctx, err := json.Marshal(c.SignedInUser)
		if err != nil {
			c.JsonApiErr(500, "failed to marshal context to json.", err)
			return
		}
		targetUrl, _ := url.Parse(routeUrl)
		proxy := NewExternalPluginProxy(string(ctx), path, targetUrl)
		proxy.Transport = dataProxyTransport
		proxy.ServeHTTP(c.RW(), c.Req.Request)
	}
}

func NewExternalPluginProxy(ctx string, proxyPath string, targetUrl *url.URL) *httputil.ReverseProxy {
	director := func(req *http.Request) {
		req.URL.Scheme = targetUrl.Scheme
		req.URL.Host = targetUrl.Host
		req.Host = targetUrl.Host

		req.URL.Path = util.JoinUrlFragments(targetUrl.Path, proxyPath)

		// clear cookie headers
		req.Header.Del("Cookie")
		req.Header.Del("Set-Cookie")
		req.Header.Add("Grafana-Context", ctx)
	}

	return &httputil.ReverseProxy{Director: director}
}
