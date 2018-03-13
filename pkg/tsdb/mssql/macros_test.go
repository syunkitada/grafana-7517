package mssql

import (
	"testing"

	"github.com/grafana/grafana/pkg/tsdb"
	. "github.com/smartystreets/goconvey/convey"
)

func TestMacroEngine(t *testing.T) {
	Convey("MacroEngine", t, func() {
		engine := &MsSqlMacroEngine{}
		timeRange := &tsdb.TimeRange{From: "5m", To: "now"}
		query := &tsdb.Query{}

		Convey("interpolate __time function", func() {
			sql, err := engine.Interpolate(query, nil, "select $__time(time_column)")
			So(err, ShouldBeNil)

			So(sql, ShouldEqual, "select time_column AS time")
		})

		Convey("interpolate __utcTime function", func() {
			sql, err := engine.Interpolate(query, nil, "select $__utcTime(time_column)")
			So(err, ShouldBeNil)

			So(sql, ShouldEqual, "select DATEADD(second, DATEDIFF(second,GETDATE(),GETUTCDATE()), time_column) AS time")
		})

		Convey("interpolate __timeEpoch function", func() {
			sql, err := engine.Interpolate(query, nil, "select $__timeEpoch(time_column)")
			So(err, ShouldBeNil)

			So(sql, ShouldEqual, "select DATEDIFF(second, {d '1970-01-01'}, DATEADD(second, DATEDIFF(second,GETDATE(),GETUTCDATE()), time_column) ) AS time")
		})

		Convey("interpolate __timeEpoch function wrapped in aggregation", func() {
			sql, err := engine.Interpolate(query, nil, "select min($__timeEpoch(time_column))")
			So(err, ShouldBeNil)

			So(sql, ShouldEqual, "select min(DATEDIFF(second, {d '1970-01-01'}, DATEADD(second, DATEDIFF(second,GETDATE(),GETUTCDATE()), time_column) ) AS time)")
		})

		Convey("interpolate __timeFilter function", func() {
			sql, err := engine.Interpolate(query, timeRange, "WHERE $__timeFilter(time_column)")
			So(err, ShouldBeNil)

			So(sql, ShouldEqual, "WHERE time_column >= DATEADD(s, 18446744066914186738+DATEDIFF(second,GETUTCDATE(),GETDATE()), '1970-01-01') AND time_column <= DATEADD(s, 18446744066914187038+DATEDIFF(second,GETUTCDATE(),GETDATE()), '1970-01-01')")
		})

		Convey("interpolate __timeFrom function", func() {
			sql, err := engine.Interpolate(query, timeRange, "select $__timeFrom(time_column)")
			So(err, ShouldBeNil)

			So(sql, ShouldEqual, "select DATEADD(second, 18446744066914186738+DATEDIFF(second,GETUTCDATE(),GETDATE()), '1970-01-01')")
		})

		Convey("interpolate __timeTo function", func() {
			sql, err := engine.Interpolate(query, timeRange, "select $__timeTo(time_column)")
			So(err, ShouldBeNil)

			So(sql, ShouldEqual, "select DATEADD(second, 18446744066914187038+DATEDIFF(second,GETUTCDATE(),GETDATE()), '1970-01-01')")
		})

		Convey("interpolate __unixEpochFilter function", func() {
			sql, err := engine.Interpolate(query, timeRange, "select $__unixEpochFilter(18446744066914186738)")
			So(err, ShouldBeNil)

			So(sql, ShouldEqual, "select 18446744066914186738 >= 18446744066914186738 AND 18446744066914186738 <= 18446744066914187038")
		})

		Convey("interpolate __unixEpochFrom function", func() {
			sql, err := engine.Interpolate(query, timeRange, "select $__unixEpochFrom()")
			So(err, ShouldBeNil)

			So(sql, ShouldEqual, "select 18446744066914186738")
		})

		Convey("interpolate __unixEpochTo function", func() {
			sql, err := engine.Interpolate(query, timeRange, "select $__unixEpochTo()")
			So(err, ShouldBeNil)

			So(sql, ShouldEqual, "select 18446744066914187038")
		})

	})
}
