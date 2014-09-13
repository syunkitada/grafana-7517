package stores

import (
	"github.com/torkelo/grafana-pro/pkg/models"
)

type Store interface {
	GetDashboard(title string, accountId int) (*models.Dashboard, error)
	SaveDashboard(dash *models.Dashboard) error
	Query(query string) ([]*models.SearchResult, error)
	SaveUserAccount(acccount *models.UserAccount) error
	GetUserAccountLogin(emailOrName string) (*models.UserAccount, error)
	Close()
}

func New() Store {
	return NewRethinkStore(&RethinkCfg{DatabaseName: "grafana"})
}
