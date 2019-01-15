package auth

import (
	"testing"
	"time"

	"github.com/grafana/grafana/pkg/log"
	"github.com/grafana/grafana/pkg/services/sqlstore"
	. "github.com/smartystreets/goconvey/convey"
)

func TestUserAuthToken(t *testing.T) {
	Convey("Test user auth token", t, func() {
		ctx := createTestContext(t)
		userAuthTokenService := ctx.tokenService
		userID := int64(10)

		t := time.Date(2018, 12, 13, 13, 45, 0, 0, time.UTC)
		now = func() time.Time {
			return t
		}

		Convey("When creating token", func() {
			token, err := userAuthTokenService.CreateToken(userID, "192.168.10.11:1234", "some user agent")
			So(err, ShouldBeNil)
			So(token, ShouldNotBeNil)
			So(token.AuthTokenSeen, ShouldBeFalse)

			Convey("When lookup unhashed token should return user auth token", func() {
				lookupToken, err := userAuthTokenService.lookupToken(token.unhashedToken)
				So(err, ShouldBeNil)
				So(lookupToken, ShouldNotBeNil)
				So(lookupToken.UserId, ShouldEqual, userID)
				So(lookupToken.AuthTokenSeen, ShouldBeTrue)

				storedAuthToken, err := ctx.getAuthTokenByID(lookupToken.Id)
				So(err, ShouldBeNil)
				So(storedAuthToken, ShouldNotBeNil)
				So(storedAuthToken.AuthTokenSeen, ShouldBeTrue)
			})

			Convey("When lookup hashed token should return user auth token not found error", func() {
				lookupToken, err := userAuthTokenService.lookupToken(token.AuthToken)
				So(err, ShouldEqual, ErrAuthTokenNotFound)
				So(lookupToken, ShouldBeNil)
			})
		})

		Convey("expires correctly", func() {
			token, err := userAuthTokenService.CreateToken(userID, "192.168.10.11:1234", "some user agent")
			So(err, ShouldBeNil)
			So(token, ShouldNotBeNil)

			_, err = userAuthTokenService.lookupToken(token.unhashedToken)
			So(err, ShouldBeNil)

			token, err = ctx.getAuthTokenByID(token.Id)
			So(err, ShouldBeNil)

			// set now (now - 23 hours)
			_, err = userAuthTokenService.refreshToken(token, "192.168.10.11:1234", "some user agent")
			So(err, ShouldBeNil)

			_, err = userAuthTokenService.lookupToken(token.unhashedToken)
			So(err, ShouldBeNil)

			stillGood, err := userAuthTokenService.lookupToken(token.unhashedToken)
			So(err, ShouldBeNil)
			So(stillGood, ShouldNotBeNil)

			// set now (new - 2 hours)
			notGood, err := userAuthTokenService.lookupToken(token.unhashedToken)
			So(err, ShouldEqual, ErrAuthTokenNotFound)
			So(notGood, ShouldBeNil)
		})

		Convey("can properly rotate tokens", func() {
			token, err := userAuthTokenService.CreateToken(userID, "192.168.10.11:1234", "some user agent")
			So(err, ShouldBeNil)
			So(token, ShouldNotBeNil)

			prevToken := token.AuthToken
			unhashedPrev := token.unhashedToken

			refreshed, err := userAuthTokenService.refreshToken(token, "192.168.10.12:1234", "a new user agent")
			So(err, ShouldBeNil)
			So(refreshed, ShouldBeFalse)

			ctx.markAuthTokenAsSeen(token.Id)
			token, err = ctx.getAuthTokenByID(token.Id)
			So(err, ShouldBeNil)

			// ability to auth using an old token
			now = func() time.Time {
				return t
			}

			refreshed, err = userAuthTokenService.refreshToken(token, "192.168.10.12:1234", "a new user agent")
			So(err, ShouldBeNil)
			So(refreshed, ShouldBeTrue)

			unhashedToken := token.unhashedToken

			token, err = ctx.getAuthTokenByID(token.Id)
			So(err, ShouldBeNil)
			token.unhashedToken = unhashedToken

			So(token.RotatedAt, ShouldEqual, t.Unix())
			So(token.ClientIp, ShouldEqual, "192.168.10.12")
			So(token.UserAgent, ShouldEqual, "a new user agent")
			So(token.AuthTokenSeen, ShouldBeFalse)
			So(token.SeenAt, ShouldEqual, 0)
			So(token.PrevAuthToken, ShouldEqual, prevToken)

			lookedUp, err := userAuthTokenService.lookupToken(token.unhashedToken)
			So(err, ShouldBeNil)
			So(lookedUp, ShouldNotBeNil)
			So(lookedUp.AuthTokenSeen, ShouldBeTrue)
			So(lookedUp.SeenAt, ShouldEqual, t.Unix())

			lookedUp, err = userAuthTokenService.lookupToken(unhashedPrev)
			So(err, ShouldBeNil)
			So(lookedUp, ShouldNotBeNil)
			So(lookedUp.Id, ShouldEqual, token.Id)

			now = func() time.Time {
				return t.Add(2 * time.Minute)
			}

			lookedUp, err = userAuthTokenService.lookupToken(unhashedPrev)
			So(err, ShouldBeNil)
			So(lookedUp, ShouldNotBeNil)

			lookedUp, err = ctx.getAuthTokenByID(lookedUp.Id)
			So(err, ShouldBeNil)
			So(lookedUp, ShouldNotBeNil)
			So(lookedUp.AuthTokenSeen, ShouldBeFalse)

			refreshed, err = userAuthTokenService.refreshToken(token, "192.168.10.12:1234", "a new user agent")
			So(err, ShouldBeNil)
			So(refreshed, ShouldBeTrue)

			token, err = ctx.getAuthTokenByID(token.Id)
			So(err, ShouldBeNil)
			So(token, ShouldNotBeNil)
			So(token.SeenAt, ShouldEqual, 0)
		})

		Convey("keeps prev token valid for 1 minute after it is confirmed", func() {

		})

		Convey("will not mark token unseen when prev and current are the same", func() {

		})

		Reset(func() {
			now = time.Now
		})
	})
}

func createTestContext(t *testing.T) *testContext {
	t.Helper()

	sqlstore := sqlstore.InitTestDB(t)
	tokenService := &UserAuthTokenService{
		SQLStore: sqlstore,
		log:      log.New("test-logger"),
	}

	return &testContext{
		sqlstore:     sqlstore,
		tokenService: tokenService,
	}
}

type testContext struct {
	sqlstore     *sqlstore.SqlStore
	tokenService *UserAuthTokenService
}

func (c *testContext) getAuthTokenByID(id int64) (*userAuthToken, error) {
	sess := c.sqlstore.NewSession()
	var t userAuthToken
	found, err := sess.ID(id).Get(&t)
	if err != nil || !found {
		return nil, err
	}

	return &t, nil
}

func (c *testContext) markAuthTokenAsSeen(id int64) (bool, error) {
	sess := c.sqlstore.NewSession()
	res, err := sess.Exec("UPDATE user_auth_token SET auth_token_seen = ? WHERE id = ?", c.sqlstore.Dialect.BooleanStr(true), id)
	if err != nil {
		return false, err
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return false, err
	}
	return rowsAffected == 1, nil
}
