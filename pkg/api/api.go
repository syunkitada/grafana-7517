package api

import (
	"github.com/Unknwon/macaron"
	"github.com/macaron-contrib/binding"
	"github.com/torkelo/grafana-pro/pkg/api/dtos"
	"github.com/torkelo/grafana-pro/pkg/middleware"
	m "github.com/torkelo/grafana-pro/pkg/models"
	"github.com/torkelo/grafana-pro/pkg/setting"
)

// Register adds http routes
func Register(r *macaron.Macaron) {
	reqSignedIn := middleware.Auth(&middleware.AuthOptions{ReqSignedIn: true})
	reqGrafanaAdmin := middleware.Auth(&middleware.AuthOptions{ReqSignedIn: true, ReqGrafanaAdmin: true})
	reqEditorRole := middleware.RoleAuth(m.ROLE_EDITOR, m.ROLE_ADMIN)
	reqAccountAdmin := middleware.RoleAuth(m.ROLE_ADMIN)
	bind := binding.Bind

	// not logged in views
	r.Get("/", reqSignedIn, Index)
	r.Post("/logout", LogoutPost)
	r.Post("/login", bind(dtos.LoginCommand{}), LoginPost)
	r.Get("/login/:name", OAuthLogin)
	r.Get("/login", LoginView)

	// authed views
	r.Get("/profile/", reqSignedIn, Index)
	r.Get("/account/", reqSignedIn, Index)
	r.Get("/account/datasources/", reqSignedIn, Index)
	r.Get("/account/users/", reqSignedIn, Index)
	r.Get("/account/apikeys/", reqSignedIn, Index)
	r.Get("/account/import/", reqSignedIn, Index)
	r.Get("/admin/users", reqGrafanaAdmin, Index)
	r.Get("/dashboard/*", reqSignedIn, Index)

	// sign up
	r.Get("/signup", Index)
	r.Post("/api/user/signup", bind(m.CreateUserCommand{}), SignUp)

	// authed api
	r.Group("/api", func() {
		// user
		r.Group("/user", func() {
			r.Get("/", GetUser)
			r.Put("/", bind(m.UpdateUserCommand{}), UpdateUser)
			r.Post("/using/:id", SetUsingAccount)
			r.Get("/accounts", GetUserAccounts)
		})

		// account
		r.Group("/account", func() {
			r.Get("/", GetAccount)
			r.Post("/", bind(m.CreateAccountCommand{}), CreateAccount)
			r.Put("/", bind(m.UpdateAccountCommand{}), UpdateAccount)
			r.Post("/users", bind(m.AddAccountUserCommand{}), AddAccountUser)
			r.Get("/users", GetAccountUsers)
			r.Delete("/users/:id", RemoveAccountUser)
		}, reqAccountAdmin)

		// auth api keys
		r.Group("/auth/keys", func() {
			r.Combo("/").
				Get(GetApiKeys).
				Post(bind(m.AddApiKeyCommand{}), AddApiKey).
				Put(bind(m.UpdateApiKeyCommand{}), UpdateApiKey)
			r.Delete("/:id", DeleteApiKey)
		}, reqAccountAdmin)

		// Data sources
		r.Group("/datasources", func() {
			r.Combo("/").Get(GetDataSources).Put(AddDataSource).Post(UpdateDataSource)
			r.Delete("/:id", DeleteDataSource)
			r.Any("/proxy/:id/*", reqSignedIn, ProxyDataSourceRequest)
		}, reqAccountAdmin)

		// Dashboard
		r.Group("/dashboard", func() {
			r.Combo("/:slug").Get(GetDashboard).Delete(DeleteDashboard)
			r.Post("/", reqEditorRole, bind(m.SaveDashboardCommand{}), PostDashboard)
		})

		// Search
		r.Get("/search/", Search)

		// metrics
		r.Get("/metrics/test", GetTestMetrics)
	}, reqSignedIn)

	// admin api
	r.Group("/api/admin", func() {
		r.Get("/users", AdminSearchUsers)
	}, reqGrafanaAdmin)

	// rendering
	r.Get("/render/*", reqSignedIn, RenderToPng)

	r.NotFound(NotFound)
}

func setIndexViewData(c *middleware.Context) error {
	settings, err := getFrontendSettings(c)
	if err != nil {
		return err
	}

	currentUser := &dtos.CurrentUser{
		IsSignedIn:     c.IsSignedIn,
		Login:          c.Login,
		Email:          c.Email,
		Name:           c.Name,
		AccountName:    c.AccountName,
		AccountRole:    c.AccountRole,
		GravatarUrl:    dtos.GetGravatarUrl(c.Email),
		IsGrafanaAdmin: c.IsGrafanaAdmin,
	}

	c.Data["User"] = currentUser
	c.Data["Settings"] = settings
	c.Data["AppUrl"] = setting.AppUrl
	c.Data["AppSubUrl"] = setting.AppSubUrl

	return nil
}

func Index(c *middleware.Context) {
	if err := setIndexViewData(c); err != nil {
		c.Handle(500, "Failed to get settings", err)
		return
	}

	c.HTML(200, "index")
}

func NotFound(c *middleware.Context) {
	if c.IsApiRequest() {
		c.JsonApiErr(200, "Not found", nil)
		return
	}

	if err := setIndexViewData(c); err != nil {
		c.Handle(500, "Failed to get settings", err)
		return
	}

	c.HTML(404, "index")
}
