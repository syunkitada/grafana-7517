package auth

import (
	"testing"

	"github.com/grafana/grafana/pkg/bus"
	m "github.com/grafana/grafana/pkg/models"
	. "github.com/smartystreets/goconvey/convey"
)

func TestLdapAuther(t *testing.T) {

	Convey("When translating ldap user to grafana user", t, func() {

		Convey("Given no ldap group map match", func() {
			ldapAuther := NewLdapAuthenticator(&LdapServerConf{
				LdapGroups: []*LdapGroupToOrgRole{{}},
			})
			_, err := ldapAuther.getGrafanaUserFor(&ldapUserInfo{})

			So(err, ShouldEqual, ErrInvalidCredentials)
		})

		var user1 = &m.User{}

		ldapAutherScenario("Given wildcard group match", func(sc *scenarioContext) {
			ldapAuther := NewLdapAuthenticator(&LdapServerConf{
				LdapGroups: []*LdapGroupToOrgRole{
					{GroupDN: "*", OrgRole: "Admin"},
				},
			})

			sc.userQueryReturns(user1)

			result, err := ldapAuther.getGrafanaUserFor(&ldapUserInfo{})
			So(err, ShouldBeNil)
			So(result, ShouldEqual, user1)
		})

		ldapAutherScenario("Given exact group match", func(sc *scenarioContext) {
			ldapAuther := NewLdapAuthenticator(&LdapServerConf{
				LdapGroups: []*LdapGroupToOrgRole{
					{GroupDN: "cn=users", OrgRole: "Admin"},
				},
			})

			sc.userQueryReturns(user1)

			result, err := ldapAuther.getGrafanaUserFor(&ldapUserInfo{MemberOf: []string{"cn=users"}})
			So(err, ShouldBeNil)
			So(result, ShouldEqual, user1)
		})

		ldapAutherScenario("Given no existing grafana user", func(sc *scenarioContext) {
			ldapAuther := NewLdapAuthenticator(&LdapServerConf{
				LdapGroups: []*LdapGroupToOrgRole{
					{GroupDN: "cn=users", OrgRole: "Admin"},
				},
			})

			sc.userQueryReturns(nil)

			result, err := ldapAuther.getGrafanaUserFor(&ldapUserInfo{
				Username: "torkelo",
				Email:    "my@email.com",
				MemberOf: []string{"cn=users"},
			})

			So(err, ShouldBeNil)

			Convey("Should create new user", func() {
				So(sc.createUserCmd.Login, ShouldEqual, "torkelo")
				So(sc.createUserCmd.Email, ShouldEqual, "my@email.com")
			})

			Convey("Should return new user", func() {
				So(result.Login, ShouldEqual, "torkelo")
			})

		})

	})

	Convey("When syncing ldap groups to grafana org roles", t, func() {

		ldapAutherScenario("given no current user orgs", func(sc *scenarioContext) {
			ldapAuther := NewLdapAuthenticator(&LdapServerConf{
				LdapGroups: []*LdapGroupToOrgRole{
					{GroupDN: "cn=users", OrgRole: "Admin"},
				},
			})

			sc.userOrgsQueryReturns([]*m.UserOrgDTO{})
			err := ldapAuther.syncOrgRoles(&m.User{}, &ldapUserInfo{
				MemberOf: []string{"cn=users"},
			})

			Convey("Should create new org user", func() {
				So(err, ShouldBeNil)
				So(sc.addOrgUserCommand, ShouldNotBeNil)
				So(sc.addOrgUserCommand.Role, ShouldEqual, m.ROLE_ADMIN)
			})
		})
	})
}

func ldapAutherScenario(desc string, fn scenarioFunc) {
	Convey(desc, func() {
		defer bus.ClearBusHandlers()

		sc := &scenarioContext{}

		bus.AddHandler("test", func(cmd *m.CreateUserCommand) error {
			sc.createUserCmd = cmd
			sc.createUserCmd.Result = m.User{Login: cmd.Login}
			return nil
		})

		bus.AddHandler("test", func(cmd *m.AddOrgUserCommand) error {
			sc.addOrgUserCommand = cmd
			return nil
		})

		fn(sc)
	})
}

type scenarioContext struct {
	createUserCmd     *m.CreateUserCommand
	addOrgUserCommand *m.AddOrgUserCommand
}

func (sc *scenarioContext) userQueryReturns(user *m.User) {
	bus.AddHandler("test", func(query *m.GetUserByLoginQuery) error {
		if user == nil {
			return m.ErrUserNotFound
		} else {
			query.Result = user
			return nil
		}
	})
}

func (sc *scenarioContext) userOrgsQueryReturns(orgs []*m.UserOrgDTO) {
	bus.AddHandler("test", func(query *m.GetUserOrgListQuery) error {
		query.Result = orgs
		return nil
	})
}

type scenarioFunc func(c *scenarioContext)
