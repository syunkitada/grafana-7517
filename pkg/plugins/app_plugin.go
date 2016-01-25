package plugins

import (
	"encoding/json"
	"strings"

	"github.com/grafana/grafana/pkg/models"
)

type AppPluginPage struct {
	Name    string          `json:"name"`
	Url     string          `json:"url"`
	ReqRole models.RoleType `json:"reqRole"`
}

type AppPluginCss struct {
	Light string `json:"light"`
	Dark  string `json:"dark"`
}

type AppIncludeInfo struct {
	Name string `json:"name"`
	Type string `json:"type"`
	Id   string `json:"id"`
}

type AppPlugin struct {
	FrontendPluginBase
	Css      *AppPluginCss     `json:"css"`
	Pages    []AppPluginPage   `json:"pages"`
	Routes   []*AppPluginRoute `json:"routes"`
	Includes []AppIncludeInfo  `json:"-"`

	Pinned  bool `json:"-"`
	Enabled bool `json:"-"`
}

type AppPluginRoute struct {
	Path            string                 `json:"path"`
	Method          string                 `json:"method"`
	ReqSignedIn     bool                   `json:"reqSignedIn"`
	ReqGrafanaAdmin bool                   `json:"reqGrafanaAdmin"`
	ReqRole         models.RoleType        `json:"reqRole"`
	Url             string                 `json:"url"`
	Headers         []AppPluginRouteHeader `json:"headers"`
}

type AppPluginRouteHeader struct {
	Name    string `json:"name"`
	Content string `json:"content"`
}

func (app *AppPlugin) Load(decoder *json.Decoder, pluginDir string) error {
	if err := decoder.Decode(&app); err != nil {
		return err
	}

	if app.Css != nil {
		app.Css.Dark = evalRelativePluginUrlPath(app.Css.Dark, app.Id)
		app.Css.Light = evalRelativePluginUrlPath(app.Css.Light, app.Id)
	}

	app.PluginDir = pluginDir
	app.initFrontendPlugin()

	// check if we have child panels
	for _, panel := range Panels {
		if strings.HasPrefix(panel.PluginDir, app.PluginDir) {
			panel.IncludedInAppId = app.Id
			app.Includes = append(app.Includes, AppIncludeInfo{
				Name: panel.Name,
				Id:   panel.Id,
				Type: panel.Type,
			})
		}
	}

	Apps[app.Id] = app
	return nil
}
