package api

import (
	"strconv"

	"github.com/torkelo/grafana-pro/pkg/bus"
	"github.com/torkelo/grafana-pro/pkg/middleware"
	m "github.com/torkelo/grafana-pro/pkg/models"
	"github.com/torkelo/grafana-pro/pkg/setting"
)

func getFrontendSettings(c *middleware.Context) (map[string]interface{}, error) {
	accountDataSources := make([]*m.DataSource, 0)

	if c.IsSignedIn {
		query := m.GetDataSourcesQuery{AccountId: c.UsingAccountId}
		err := bus.Dispatch(&query)

		if err != nil {
			return nil, err
		}

		accountDataSources = query.Result
	}

	datasources := make(map[string]interface{})

	for _, ds := range accountDataSources {
		url := ds.Url

		if ds.Access == m.DS_ACCESS_PROXY {
			url = setting.AppSubUrl + "/api/datasources/proxy/" + strconv.FormatInt(ds.Id, 10)
		}

		var dsMap = map[string]interface{}{
			"type":    ds.Type,
			"url":     url,
			"default": ds.IsDefault,
		}

		if ds.Type == m.DS_INFLUXDB {
			if ds.Access == m.DS_ACCESS_DIRECT {
				dsMap["username"] = ds.User
				dsMap["password"] = ds.Password
				dsMap["url"] = url + "/db/" + ds.Database
			}
		}

		if ds.Type == m.DS_ES {
			dsMap["index"] = ds.Database
		}

		datasources[ds.Name] = dsMap
	}

	// add grafana backend data source
	datasources["grafana"] = map[string]interface{}{
		"type":      "grafana",
		"grafanaDB": true,
	}

	jsonObj := map[string]interface{}{
		"datasources": datasources,
		"appSubUrl":   setting.AppSubUrl,
		"buildInfo": map[string]interface{}{
			"version":    setting.BuildVersion,
			"commit":     setting.BuildCommit,
			"buildstamp": setting.BuildStamp,
		},
	}

	return jsonObj, nil
}
