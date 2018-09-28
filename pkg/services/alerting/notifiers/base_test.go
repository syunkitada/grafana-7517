package notifiers

import (
	"context"
	"testing"
	"time"

	"github.com/grafana/grafana/pkg/components/simplejson"
	m "github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/services/alerting"
	. "github.com/smartystreets/goconvey/convey"
)

func TestShouldSendAlertNotification(t *testing.T) {
	tnow := time.Now()

	tcs := []struct {
		name         string
		prevState    m.AlertStateType
		newState     m.AlertStateType
		sendReminder bool
		frequency    time.Duration
		journals     *m.AlertNotificationState

		expect bool
	}{
		{
			name:         "pending -> ok should not trigger an notification",
			newState:     m.AlertStatePending,
			prevState:    m.AlertStateOK,
			sendReminder: false,
			journals:     &m.AlertNotificationState{},

			expect: false,
		},
		{
			name:         "ok -> alerting should trigger an notification",
			newState:     m.AlertStateOK,
			prevState:    m.AlertStateAlerting,
			sendReminder: false,
			journals:     &m.AlertNotificationState{},

			expect: true,
		},
		{
			name:         "ok -> pending should not trigger an notification",
			newState:     m.AlertStateOK,
			prevState:    m.AlertStatePending,
			sendReminder: false,
			journals:     &m.AlertNotificationState{},

			expect: false,
		},
		{
			name:         "ok -> ok should not trigger an notification",
			newState:     m.AlertStateOK,
			prevState:    m.AlertStateOK,
			sendReminder: false,
			journals:     &m.AlertNotificationState{},

			expect: false,
		},
		{
			name:         "ok -> alerting should trigger an notification",
			newState:     m.AlertStateOK,
			prevState:    m.AlertStateAlerting,
			sendReminder: true,
			journals:     &m.AlertNotificationState{},

			expect: true,
		},
		{
			name:         "ok -> ok with reminder should not trigger an notification",
			newState:     m.AlertStateOK,
			prevState:    m.AlertStateOK,
			sendReminder: true,
			journals:     &m.AlertNotificationState{},

			expect: false,
		},
		{
			name:         "alerting -> alerting with reminder and no journaling should trigger",
			newState:     m.AlertStateAlerting,
			prevState:    m.AlertStateAlerting,
			frequency:    time.Minute * 10,
			sendReminder: true,
			journals:     &m.AlertNotificationState{},

			expect: true,
		},
		{
			name:         "alerting -> alerting with reminder and successful recent journal event should not trigger",
			newState:     m.AlertStateAlerting,
			prevState:    m.AlertStateAlerting,
			frequency:    time.Minute * 10,
			sendReminder: true,
			journals:     &m.AlertNotificationState{SentAt: tnow.Add(-time.Minute).Unix()},

			expect: false,
		},
		{
			name:         "alerting -> alerting with reminder and failed recent journal event should trigger",
			newState:     m.AlertStateAlerting,
			prevState:    m.AlertStateAlerting,
			frequency:    time.Minute * 10,
			sendReminder: true,
			expect:       true,
			journals:     &m.AlertNotificationState{SentAt: tnow.Add(-time.Hour).Unix()},
		},
	}

	for _, tc := range tcs {
		evalContext := alerting.NewEvalContext(context.TODO(), &alerting.Rule{
			State: tc.newState,
		})

		evalContext.Rule.State = tc.prevState
		if defaultShouldNotify(evalContext, true, tc.frequency, tc.journals) != tc.expect {
			t.Errorf("failed test %s.\n expected \n%+v \nto return: %v", tc.name, tc, tc.expect)
		}
	}
}

func TestBaseNotifier(t *testing.T) {
	Convey("default constructor for notifiers", t, func() {
		bJson := simplejson.New()

		model := &m.AlertNotification{
			Id:       1,
			Name:     "name",
			Type:     "email",
			Settings: bJson,
		}

		Convey("can parse false value", func() {
			bJson.Set("uploadImage", false)

			base := NewNotifierBase(model)
			So(base.UploadImage, ShouldBeFalse)
		})

		Convey("can parse true value", func() {
			bJson.Set("uploadImage", true)

			base := NewNotifierBase(model)
			So(base.UploadImage, ShouldBeTrue)
		})

		Convey("default value should be true for backwards compatibility", func() {
			base := NewNotifierBase(model)
			So(base.UploadImage, ShouldBeTrue)
		})
	})
}
