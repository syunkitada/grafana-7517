package influxdb

import (
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

func TestInfluxdbQueryPart(t *testing.T) {
	Convey("Influxdb query parts", t, func() {

		Convey("render field ", func() {
			part, err := NewQueryPart("field", []string{"value"})
			So(err, ShouldBeNil)

			res := part.Render("value")
			So(res, ShouldEqual, `"value"`)
		})

		Convey("render nested part", func() {
			part, err := NewQueryPart("derivative", []string{"10s"})
			So(err, ShouldBeNil)

			res := part.Render("mean(value)")
			So(res, ShouldEqual, "derivative(mean(value), 10s)")
		})

		Convey("render bottom", func() {
			part, err := NewQueryPart("bottom", []string{"3"})
			So(err, ShouldBeNil)

			res := part.Render("value")
			So(res, ShouldEqual, "bottom(value, 3)")
		})

		Convey("render time", func() {
			part, err := NewQueryPart("time", []string{"$interval"})
			So(err, ShouldBeNil)

			res := part.Render("")
			So(res, ShouldEqual, "time(10s)")
		})

		Convey("render spread", func() {
			part, err := NewQueryPart("spread", []string{})
			So(err, ShouldBeNil)

			res := part.Render("value")
			So(res, ShouldEqual, `spread(value)`)
		})

		Convey("render suffix", func() {
			part, err := NewQueryPart("math", []string{"/ 100"})
			So(err, ShouldBeNil)

			res := part.Render("mean(value)")
			So(res, ShouldEqual, "mean(value) / 100")
		})

		Convey("render alias", func() {
			part, err := NewQueryPart("alias", []string{"test"})
			So(err, ShouldBeNil)

			res := part.Render("mean(value)")
			So(res, ShouldEqual, `mean(value) AS "test"`)
		})
	})
}
