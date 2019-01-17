package middleware

import (
	"net/http"
	"net/url"
	"strconv"
	"time"

	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/components/apikeygen"
	"github.com/grafana/grafana/pkg/log"
	m "github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/services/auth"
	"github.com/grafana/grafana/pkg/services/session"
	"github.com/grafana/grafana/pkg/setting"
	"github.com/grafana/grafana/pkg/util"
	macaron "gopkg.in/macaron.v1"
)

var (
	ReqGrafanaAdmin = Auth(&AuthOptions{ReqSignedIn: true, ReqGrafanaAdmin: true})
	ReqSignedIn     = Auth(&AuthOptions{ReqSignedIn: true})
	ReqEditorRole   = RoleAuth(m.ROLE_EDITOR, m.ROLE_ADMIN)
	ReqOrgAdmin     = RoleAuth(m.ROLE_ADMIN)
)

func GetContextHandler(ats *auth.UserAuthTokenService) macaron.Handler {
	return func(c *macaron.Context) {
		ctx := &m.ReqContext{
			Context:        c,
			SignedInUser:   &m.SignedInUser{},
			Session:        session.GetSession(),
			IsSignedIn:     false,
			AllowAnonymous: false,
			SkipCache:      false,
			Logger:         log.New("context"),
		}

		orgId := int64(0)
		orgIdHeader := ctx.Req.Header.Get("X-Grafana-Org-Id")
		if orgIdHeader != "" {
			orgId, _ = strconv.ParseInt(orgIdHeader, 10, 64)
		}

		// the order in which these are tested are important
		// look for api key in Authorization header first
		// then init session and look for userId in session
		// then look for api key in session (special case for render calls via api)
		// then test if anonymous access is enabled
		switch {
		case initContextWithRenderAuth(ctx):
		case initContextWithApiKey(ctx):
		case initContextWithBasicAuth(ctx, orgId):
		case initContextWithAuthProxy(ctx, orgId):
		//case initContextWithUserSessionCookie(ctx, orgId):
		case initContextWithToken(ctx, orgId, ats):
		case initContextWithAnonymousUser(ctx):
		}

		ctx.Logger = log.New("context", "userId", ctx.UserId, "orgId", ctx.OrgId, "uname", ctx.Login)
		ctx.Data["ctx"] = ctx

		c.Map(ctx)

		c.Next()

		//if signed in with token
		rotated, err := ats.RefreshToken(ctx.UserToken, ctx.RemoteAddr(), ctx.Req.UserAgent())
		if err != nil {
			ctx.Logger.Error("failed to rotate token", "error", err)
			return
		}

		if rotated {
			ctx.Logger.Info("new token", "unhashed token", ctx.UserToken.UnhashedToken)
			//c.SetCookie("grafana_session", url.QueryEscape(ctx.UserToken.UnhashedToken), nil, setting.AppSubUrl+"/", setting.Domain, false, true)
			// ctx.Resp.Header().Del("Set-Cookie")
			cookie := http.Cookie{
				Name:     "grafana_session",
				Value:    url.QueryEscape(ctx.UserToken.UnhashedToken),
				HttpOnly: true,
				MaxAge:   int(time.Minute * 10),
				Domain:   setting.Domain,
				Path:     setting.AppSubUrl + "/",
			}

			ctx.Resp.Header().Add("Set-Cookie", cookie.String())
		}

		// update last seen every 5min
		if ctx.ShouldUpdateLastSeenAt() {
			ctx.Logger.Debug("Updating last user_seen_at", "user_id", ctx.UserId)
			if err := bus.Dispatch(&m.UpdateUserLastSeenAtCommand{UserId: ctx.UserId}); err != nil {
				ctx.Logger.Error("Failed to update last_seen_at", "error", err)
			}
		}
	}
}

func initContextWithAnonymousUser(ctx *m.ReqContext) bool {
	if !setting.AnonymousEnabled {
		return false
	}

	orgQuery := m.GetOrgByNameQuery{Name: setting.AnonymousOrgName}
	if err := bus.Dispatch(&orgQuery); err != nil {
		log.Error(3, "Anonymous access organization error: '%s': %s", setting.AnonymousOrgName, err)
		return false
	}

	ctx.IsSignedIn = false
	ctx.AllowAnonymous = true
	ctx.SignedInUser = &m.SignedInUser{IsAnonymous: true}
	ctx.OrgRole = m.RoleType(setting.AnonymousOrgRole)
	ctx.OrgId = orgQuery.Result.Id
	ctx.OrgName = orgQuery.Result.Name
	return true
}

func initContextWithToken(ctx *m.ReqContext, orgID int64, ts *auth.UserAuthTokenService) bool {
	unhashedToken := ctx.GetCookie("grafana_session")
	if unhashedToken == "" {
		return false
	}

	user, err := ts.LookupToken(unhashedToken)
	if err != nil {
		ctx.Logger.Info("failed to look up user based on cookie")
		return false
	}

	query := m.GetSignedInUserQuery{UserId: user.UserId, OrgId: orgID}
	if err := bus.Dispatch(&query); err != nil {
		ctx.Logger.Error("Failed to get user with id", "userId", user.UserId, "error", err)
		return false
	}

	ctx.SignedInUser = query.Result
	ctx.IsSignedIn = true
	ctx.UserToken = user

	return true
}

func initContextWithUserSessionCookie(ctx *m.ReqContext, orgId int64) bool {
	// initialize session
	if err := ctx.Session.Start(ctx.Context); err != nil {
		ctx.Logger.Error("Failed to start session", "error", err)
		return false
	}

	var userId int64
	if userId = getRequestUserId(ctx); userId == 0 {
		return false
	}

	query := m.GetSignedInUserQuery{UserId: userId, OrgId: orgId}
	if err := bus.Dispatch(&query); err != nil {
		ctx.Logger.Error("Failed to get user with id", "userId", userId, "error", err)
		return false
	}

	ctx.SignedInUser = query.Result
	ctx.IsSignedIn = true
	return true
}

func initContextWithApiKey(ctx *m.ReqContext) bool {
	var keyString string
	if keyString = getApiKey(ctx); keyString == "" {
		return false
	}

	// base64 decode key
	decoded, err := apikeygen.Decode(keyString)
	if err != nil {
		ctx.JsonApiErr(401, "Invalid API key", err)
		return true
	}

	// fetch key
	keyQuery := m.GetApiKeyByNameQuery{KeyName: decoded.Name, OrgId: decoded.OrgId}
	if err := bus.Dispatch(&keyQuery); err != nil {
		ctx.JsonApiErr(401, "Invalid API key", err)
		return true
	}

	apikey := keyQuery.Result

	// validate api key
	if !apikeygen.IsValid(decoded, apikey.Key) {
		ctx.JsonApiErr(401, "Invalid API key", err)
		return true
	}

	ctx.IsSignedIn = true
	ctx.SignedInUser = &m.SignedInUser{}
	ctx.OrgRole = apikey.Role
	ctx.ApiKeyId = apikey.Id
	ctx.OrgId = apikey.OrgId
	return true
}

func initContextWithBasicAuth(ctx *m.ReqContext, orgId int64) bool {

	if !setting.BasicAuthEnabled {
		return false
	}

	header := ctx.Req.Header.Get("Authorization")
	if header == "" {
		return false
	}

	username, password, err := util.DecodeBasicAuthHeader(header)
	if err != nil {
		ctx.JsonApiErr(401, "Invalid Basic Auth Header", err)
		return true
	}

	loginQuery := m.GetUserByLoginQuery{LoginOrEmail: username}
	if err := bus.Dispatch(&loginQuery); err != nil {
		ctx.JsonApiErr(401, "Basic auth failed", err)
		return true
	}

	user := loginQuery.Result

	loginUserQuery := m.LoginUserQuery{Username: username, Password: password, User: user}
	if err := bus.Dispatch(&loginUserQuery); err != nil {
		ctx.JsonApiErr(401, "Invalid username or password", err)
		return true
	}

	query := m.GetSignedInUserQuery{UserId: user.Id, OrgId: orgId}
	if err := bus.Dispatch(&query); err != nil {
		ctx.JsonApiErr(401, "Authentication error", err)
		return true
	}

	ctx.SignedInUser = query.Result
	ctx.IsSignedIn = true
	return true
}

func AddDefaultResponseHeaders() macaron.Handler {
	return func(ctx *m.ReqContext) {
		if ctx.IsApiRequest() && ctx.Req.Method == "GET" {
			ctx.Resp.Header().Add("Cache-Control", "no-cache")
			ctx.Resp.Header().Add("Pragma", "no-cache")
			ctx.Resp.Header().Add("Expires", "-1")
		}
	}
}
