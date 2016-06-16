package api

import (
	"crypto/tls"
	"net"
	"net/http"
	"net/http/httputil"
	"net/url"
	"time"

	"github.com/Unknwon/log"
	"github.com/grafana/grafana/pkg/middleware"
	"github.com/grafana/grafana/pkg/setting"
	"github.com/grafana/grafana/pkg/util"
)

var gNetProxyTransport = &http.Transport{
	TLSClientConfig: &tls.Config{InsecureSkipVerify: false},
	Proxy:           http.ProxyFromEnvironment,
	Dial: (&net.Dialer{
		Timeout:   30 * time.Second,
		KeepAlive: 30 * time.Second,
	}).Dial,
	TLSHandshakeTimeout: 10 * time.Second,
}

func ReverseProxyGnetReq(proxyPath string) *httputil.ReverseProxy {
	url, _ := url.Parse(setting.GrafanaNetUrl)

	director := func(req *http.Request) {
		req.URL.Scheme = url.Scheme
		req.URL.Host = url.Host
		req.Host = url.Host

		req.URL.Path = util.JoinUrlFragments(url.Path+"/api", proxyPath)
		log.Info("Url: %v", req.URL.Path)

		// clear cookie headers
		req.Header.Del("Cookie")
		req.Header.Del("Set-Cookie")
	}

	return &httputil.ReverseProxy{Director: director}
}

func ProxyGnetRequest(c *middleware.Context) {
	proxyPath := c.Params("*")
	proxy := ReverseProxyGnetReq(proxyPath)
	proxy.Transport = gNetProxyTransport
	proxy.ServeHTTP(c.Resp, c.Req.Request)
	c.Resp.Header().Del("Set-Cookie")
}
