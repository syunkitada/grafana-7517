package search

import (
	"testing"

	"github.com/grafana/grafana/pkg/bus"
	m "github.com/grafana/grafana/pkg/models"
	. "github.com/smartystreets/goconvey/convey"
)

func TestSearch(t *testing.T) {

	Convey("Given search query", t, func() {
		jsonDashIndex = NewJsonDashIndex("../../../public/dashboards/")
		query := Query{Limit: 2000}

		bus.AddHandler("test", func(query *FindPersistedDashboardsQuery) error {
			query.Result = HitList{
				&Hit{Id: 16, Title: "CCAA", Type: "dash-db", Tags: []string{"BB", "AA"}},
				&Hit{Id: 10, Title: "AABB", Type: "dash-db", Tags: []string{"CC", "AA"}},
				&Hit{Id: 15, Title: "BBAA", Type: "dash-db", Tags: []string{"EE", "AA", "BB"}},
				&Hit{Id: 25, Title: "bbAAa", Type: "dash-db", Tags: []string{"EE", "AA", "BB"}},
				&Hit{Id: 17, Title: "FOLDER", Type: "dash-folder", Dashboards: []Hit{
					{Id: 18, Title: "ZZAA", Tags: []string{"ZZ"}},
				}},
			}
			return nil
		})

		bus.AddHandler("test", func(query *m.GetUserStarsQuery) error {
			query.Result = map[int64]bool{10: true, 12: true}
			return nil
		})

		Convey("That is empty", func() {
			err := searchHandler(&query)
			So(err, ShouldBeNil)

			Convey("should return sorted results", func() {
				So(query.Result[0].Title, ShouldEqual, "FOLDER")
				So(query.Result[1].Title, ShouldEqual, "AABB")
				So(query.Result[2].Title, ShouldEqual, "BBAA")
				So(query.Result[3].Title, ShouldEqual, "bbAAa")
				So(query.Result[4].Title, ShouldEqual, "CCAA")
			})

			Convey("should return sorted tags", func() {
				So(query.Result[3].Tags[0], ShouldEqual, "AA")
				So(query.Result[3].Tags[1], ShouldEqual, "BB")
				So(query.Result[3].Tags[2], ShouldEqual, "EE")
			})
		})

		Convey("That filters by tag", func() {
			query.Tags = []string{"BB", "AA"}
			err := searchHandler(&query)
			So(err, ShouldBeNil)

			Convey("should return correct results", func() {
				So(len(query.Result), ShouldEqual, 3)
				So(query.Result[0].Title, ShouldEqual, "BBAA")
				So(query.Result[2].Title, ShouldEqual, "CCAA")
			})

		})

		Convey("That returns result in browse mode", func() {
			query.BrowseMode = true
			err := searchHandler(&query)
			So(err, ShouldBeNil)

			Convey("should return correct results", func() {
				So(query.Result[0].Title, ShouldEqual, "FOLDER")
				So(len(query.Result[0].Dashboards), ShouldEqual, 1)
			})

		})
	})
}
