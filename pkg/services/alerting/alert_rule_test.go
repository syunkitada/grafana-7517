package alerting

import (
	"testing"

	"github.com/grafana/grafana/pkg/components/simplejson"
	"github.com/grafana/grafana/pkg/models"
	. "github.com/smartystreets/goconvey/convey"
)

func TestAlertRuleModel(t *testing.T) {
	Convey("Testing alert rule", t, func() {

		Convey("Can parse seconds", func() {
			seconds := getTimeDurationStringToSeconds("10s")
			So(seconds, ShouldEqual, 10)
		})

		Convey("Can parse minutes", func() {
			seconds := getTimeDurationStringToSeconds("10m")
			So(seconds, ShouldEqual, 600)
		})

		Convey("Can parse hours", func() {
			seconds := getTimeDurationStringToSeconds("1h")
			So(seconds, ShouldEqual, 3600)
		})

		Convey("defaults to seconds", func() {
			seconds := getTimeDurationStringToSeconds("1o")
			So(seconds, ShouldEqual, 1)
		})

		Convey("can construct alert rule model", func() {
			json := `
			{
				"name": "name2",
				"description": "desc2",
				"handler": 0,
				"enabled": true,
				"frequency": "60s",
        "conditions": [
          {
            "type": "query",
            "query":  {
              "params": ["A", "5m", "now"],
              "datasourceId": 1,
              "model": {"target": "aliasByNode(statsd.fakesite.counters.session_start.mobile.count, 4)"}
            },
            "reducer": {"type": "avg", "params": []},
            "evaluator": {"type": ">", "params": [100]}
					}
        ],
        "notifications": [
					{"id": 1134},
					{"id": 22}
				]
			}
			`

			alertJSON, jsonErr := simplejson.NewJson([]byte(json))
			So(jsonErr, ShouldBeNil)

			alert := &models.Alert{
				Id:          1,
				OrgId:       1,
				DashboardId: 1,
				PanelId:     1,

				Settings: alertJSON,
			}

			alertRule, err := NewAlertRuleFromDBModel(alert)
			So(err, ShouldBeNil)

			So(alertRule.Conditions, ShouldHaveLength, 1)

			Convey("Can read query condition from json model", func() {
				queryCondition, ok := alertRule.Conditions[0].(*QueryCondition)
				So(ok, ShouldBeTrue)

				So(queryCondition.Query.From, ShouldEqual, "5m")
				So(queryCondition.Query.To, ShouldEqual, "now")
				So(queryCondition.Query.DatasourceId, ShouldEqual, 1)

				Convey("Can read query reducer", func() {
					reducer, ok := queryCondition.Reducer.(*SimpleReducer)
					So(ok, ShouldBeTrue)
					So(reducer.Type, ShouldEqual, "avg")
				})

				Convey("Can read evaluator", func() {
					evaluator, ok := queryCondition.Evaluator.(*DefaultAlertEvaluator)
					So(ok, ShouldBeTrue)
					So(evaluator.Type, ShouldEqual, ">")
				})
			})

			Convey("Can read notifications", func() {
				So(len(alertRule.Notifications), ShouldEqual, 2)
			})
		})
	})
}
