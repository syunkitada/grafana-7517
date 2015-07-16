package login

import (
	"github.com/BurntSushi/toml"
	"github.com/grafana/grafana/pkg/log"
	m "github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/setting"
)

type LdapConfig struct {
	Servers        []*LdapServerConf `toml:"servers"`
	VerboseLogging bool              `toml:"verbose_logging"`
}

type LdapServerConf struct {
	Host           string           `toml:"host"`
	Port           int              `toml:"port"`
	UseSSL         bool             `toml:"use_ssl"`
	SkipVerifySSL  bool             `toml:"ssl_skip_verify"`
	CertServerName string           `toml:"ssl_server_name"`
	BindDN         string           `toml:"bind_dn"`
	BindPassword   string           `toml:"bind_password"`
	Attr           LdapAttributeMap `toml:"attributes"`

	SearchFilter  string   `toml:"search_filter"`
	SearchBaseDNs []string `toml:"search_base_dns"`

	LdapGroups []*LdapGroupToOrgRole `toml:"group_mappings"`
}

type LdapAttributeMap struct {
	Username string `toml:"username"`
	Name     string `toml:"name"`
	Surname  string `toml:"surname"`
	Email    string `toml:"email"`
	MemberOf string `toml:"member_of"`
}

type LdapGroupToOrgRole struct {
	GroupDN string     `toml:"group_dn"`
	OrgId   int64      `toml:"org_id"`
	OrgRole m.RoleType `toml:"org_role"`
}

var ldapCfg LdapConfig

func loadLdapConfig() {
	if !setting.LdapEnabled {
		return
	}

	log.Info("Login: Ldap enabled, reading config file: %s", setting.LdapConfigFile)

	_, err := toml.DecodeFile(setting.LdapConfigFile, &ldapCfg)
	if err != nil {
		log.Fatal(3, "Failed to load ldap config file: %s", err)
	}

	// set default org id
	for _, server := range ldapCfg.Servers {
		for _, groupMap := range server.LdapGroups {
			if groupMap.OrgId == 0 {
				groupMap.OrgId = 1
			}
		}
	}
}
