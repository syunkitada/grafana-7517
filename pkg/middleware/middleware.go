package middleware

import (
	"fmt"
	"strings"

	macaron "gopkg.in/macaron.v1"

	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/setting"
)

var (
	ReqGrafanaAdmin = Auth(&AuthOptions{
		ReqSignedIn:     true,
		ReqGrafanaAdmin: true,
	})
	ReqSignedIn   = Auth(&AuthOptions{ReqSignedIn: true})
	ReqEditorRole = RoleAuth(models.ROLE_EDITOR, models.ROLE_ADMIN)
	ReqOrgAdmin   = RoleAuth(models.ROLE_ADMIN)
)

func AddDefaultResponseHeaders(cfg *setting.Cfg) macaron.Handler {
	return func(ctx *macaron.Context) {
		ctx.Resp.Before(func(w macaron.ResponseWriter) {
			// if response has already been written, skip.
			if w.Written() {
				return
			}

			if !strings.HasPrefix(ctx.Req.URL.Path, "/api/datasources/proxy/") {
				addNoCacheHeaders(ctx.Resp)
			}

			if !cfg.AllowEmbedding {
				addXFrameOptionsDenyHeader(w)
			}

			addSecurityHeaders(w, cfg)
		})
	}
}

// addSecurityHeaders adds HTTP(S) response headers that enable various security protections in the client's browser.
func addSecurityHeaders(w macaron.ResponseWriter, cfg *setting.Cfg) {
	if (cfg.Protocol == setting.HTTPSScheme || cfg.Protocol == setting.HTTP2Scheme) && cfg.StrictTransportSecurity {
		strictHeaderValues := []string{fmt.Sprintf("max-age=%v", cfg.StrictTransportSecurityMaxAge)}
		if cfg.StrictTransportSecurityPreload {
			strictHeaderValues = append(strictHeaderValues, "preload")
		}
		if cfg.StrictTransportSecuritySubDomains {
			strictHeaderValues = append(strictHeaderValues, "includeSubDomains")
		}
		w.Header().Add("Strict-Transport-Security", strings.Join(strictHeaderValues, "; "))
	}

	if cfg.ContentTypeProtectionHeader {
		w.Header().Add("X-Content-Type-Options", "nosniff")
	}

	if cfg.XSSProtectionHeader {
		w.Header().Add("X-XSS-Protection", "1; mode=block")
	}
}

func addNoCacheHeaders(w macaron.ResponseWriter) {
	w.Header().Add("Cache-Control", "no-cache")
	w.Header().Add("Pragma", "no-cache")
	w.Header().Add("Expires", "-1")
}

func addXFrameOptionsDenyHeader(w macaron.ResponseWriter) {
	w.Header().Add("X-Frame-Options", "deny")
}
