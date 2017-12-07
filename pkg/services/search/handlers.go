package search

import (
	"sort"

	"github.com/grafana/grafana/pkg/bus"
	m "github.com/grafana/grafana/pkg/models"
)

func Init() {
	bus.AddHandler("search", searchHandler)
}

func searchHandler(query *Query) error {
	hits := make(HitList, 0)

	dashQuery := FindPersistedDashboardsQuery{
		Title:        query.Title,
		UserId:       query.UserId,
		IsStarred:    query.IsStarred,
		OrgId:        query.OrgId,
		DashboardIds: query.DashboardIds,
	}

	if err := bus.Dispatch(&dashQuery); err != nil {
		return err
	}

	hits = append(hits, dashQuery.Result...)

	// filter out results with tag filter
	if len(query.Tags) > 0 {
		filtered := HitList{}
		for _, hit := range hits {
			if hasRequiredTags(query.Tags, hit.Tags) {
				filtered = append(filtered, hit)
			}
		}
		hits = filtered
	}

	// sort main result array
	sort.Sort(hits)

	if len(hits) > query.Limit {
		hits = hits[0:query.Limit]
	}

	// sort tags
	for _, hit := range hits {
		sort.Strings(hit.Tags)
	}

	// add isStarred info
	if err := setIsStarredFlagOnSearchResults(query.UserId, hits); err != nil {
		return err
	}

	query.Result = hits
	return nil
}

func stringInSlice(a string, list []string) bool {
	for _, b := range list {
		if b == a {
			return true
		}
	}
	return false
}

func hasRequiredTags(queryTags, hitTags []string) bool {
	for _, queryTag := range queryTags {
		if !stringInSlice(queryTag, hitTags) {
			return false
		}
	}

	return true
}

func setIsStarredFlagOnSearchResults(userId int64, hits []*Hit) error {
	query := m.GetUserStarsQuery{UserId: userId}
	if err := bus.Dispatch(&query); err != nil {
		return err
	}

	for _, dash := range hits {
		if _, exists := query.Result[dash.Id]; exists {
			dash.IsStarred = true
		}
	}

	return nil
}
