package dashboard

import (
	"context"
	"fmt"
	"github.com/grafana/grafana/pkg/services/alerting"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/grafana/grafana/pkg/bus"

	"github.com/grafana/grafana/pkg/components/simplejson"
	"github.com/grafana/grafana/pkg/log"
	"github.com/grafana/grafana/pkg/models"
)

type fileReader struct {
	Cfg            *DashboardsAsConfig
	Path           string
	log            log.Logger
	dashboardCache *dashboardCache
}

type dashboardCache struct {
	mutex      *sync.Mutex
	dashboards map[string]*DashboardJson
}

func newDashboardCache() *dashboardCache {
	return &dashboardCache{
		dashboards: map[string]*DashboardJson{},
		mutex:      &sync.Mutex{},
	}
}

func (dc *dashboardCache) addCache(json *DashboardJson) {
	dc.mutex.Lock()
	defer dc.mutex.Unlock()
	dc.dashboards[json.Path] = json
}

func (dc *dashboardCache) getCache(path string) (*DashboardJson, bool) {
	dc.mutex.Lock()
	defer dc.mutex.Unlock()
	v, exist := dc.dashboards[path]
	return v, exist
}

func NewDashboardFilereader(cfg *DashboardsAsConfig, log log.Logger) (*fileReader, error) {
	path, ok := cfg.Options["folder"].(string)
	if !ok {
		return nil, fmt.Errorf("Failed to load dashboards. folder param is not a string")
	}

	if _, err := os.Stat(path); os.IsNotExist(err) {
		log.Error("Cannot read directory", "error", err)
	}

	return &fileReader{
		Cfg:            cfg,
		Path:           path,
		log:            log,
		dashboardCache: newDashboardCache(),
	}, nil
}

func (fr *fileReader) ReadAndListen(ctx context.Context) error {
	ticker := time.NewTicker(time.Second * 10)

	if err := fr.walkFolder(); err != nil {
		fr.log.Error("failed to search for dashboards", "error", err)
	}

	for {
		select {
		case <-ticker.C:
			fr.walkFolder()
		case <-ctx.Done():
			return nil
		}
	}
}

func (fr *fileReader) walkFolder() error {
	if _, err := os.Stat(fr.Path); err != nil {
		if os.IsNotExist(err) {
			return err
		}
	}

	return filepath.Walk(fr.Path, func(path string, f os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if f.IsDir() {
			if strings.HasPrefix(f.Name(), ".") {
				return filepath.SkipDir
			}
			return nil
		}

		if !strings.HasSuffix(f.Name(), ".json") {
			return nil
		}

		cachedDashboard, exist := fr.dashboardCache.getCache(path)
		if exist && cachedDashboard.ModTime == f.ModTime() {
			return nil
		}

		dash, err := fr.readDashboardFromFile(path)
		if err != nil {
			fr.log.Error("failed to load dashboard from ", "file", path, "error", err)
			return nil
		}

		cmd := &models.GetDashboardQuery{Slug: dash.Dashboard.Slug}
		err = bus.Dispatch(cmd)

		if err == models.ErrDashboardNotFound {
			fr.log.Debug("saving new dashboard", "file", path)
			return fr.saveDashboard(dash)
		}

		if err != nil {
			fr.log.Error("failed to query for dashboard", "slug", dash.Dashboard.Slug, "error", err)
			return nil
		}

		if cmd.Result.Updated.Unix() >= f.ModTime().Unix() {
			fr.log.Debug("already using latest version", "dashboard", dash.Dashboard.Slug)
			return nil
		}

		fr.log.Debug("no dashboard in cache. Loading dashboard from disk into database.", "file", path)
		return fr.saveDashboard(dash)
	})
}

func (fr *fileReader) readDashboardFromFile(path string) (*DashboardJson, error) {
	reader, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer reader.Close()

	data, err := simplejson.NewFromReader(reader)
	if err != nil {
		return nil, err
	}

	stat, _ := os.Stat(path)
	dash := &DashboardJson{}
	dash.Dashboard = models.NewDashboardFromJson(data)
	dash.TitleLower = strings.ToLower(dash.Dashboard.Title)
	dash.Path = path
	dash.ModTime = stat.ModTime()
	dash.OrgId = fr.Cfg.OrgId
	dash.Folder = fr.Cfg.Folder

	if dash.Dashboard.Title == "" {
		return nil, models.ErrDashboardTitleEmpty
	}

	fr.dashboardCache.addCache(dash)

	return dash, nil
}

func (fr *fileReader) saveDashboard(dashboardJson *DashboardJson) error {
	dash := dashboardJson.Dashboard

	if dash.Title == "" {
		return models.ErrDashboardTitleEmpty
	}

	validateAlertsCmd := alerting.ValidateDashboardAlertsCommand{
		OrgId:     dashboardJson.OrgId,
		Dashboard: dash,
	}

	if err := bus.Dispatch(&validateAlertsCmd); err != nil {
		return models.ErrDashboardContainsInvalidAlertData
	}

	cmd := models.SaveDashboardCommand{
		Dashboard: dash.Data,
		Message:   "Dashboard created from file.",
		OrgId:     dashboardJson.OrgId,
		Overwrite: true,
		UpdatedAt: dashboardJson.ModTime,
	}

	err := bus.Dispatch(&cmd)
	if err != nil {
		return err
	}

	alertCmd := alerting.UpdateDashboardAlertsCommand{
		OrgId:     dashboardJson.OrgId,
		Dashboard: cmd.Result,
	}

	if err := bus.Dispatch(&alertCmd); err != nil {
		return err
	}

	return nil
}
