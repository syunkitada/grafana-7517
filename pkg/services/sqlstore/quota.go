package sqlstore

import (
	"fmt"
	"github.com/grafana/grafana/pkg/bus"
	m "github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/setting"
)

func init() {
	bus.AddHandler("sql", GetQuotaByTarget)
	bus.AddHandler("sql", GetQuotas)
	bus.AddHandler("sql", UpdateQuota)
}

type targetCount struct {
	Count int64
}

func GetQuotaByTarget(query *m.GetQuotaByTargetQuery) error {
	quota := m.Quota{
		Target: query.Target,
		OrgId:  query.OrgId,
	}
	has, err := x.Get(quota)
	if err != nil {
		return err
	} else if has == false {
		quota.Limit = setting.Quota.Default[string(query.Target)]
	}

	//get quota used.
	rawSql := fmt.Sprintf("SELECT COUNT(*) as count from %s where org_id=?", dialect.Quote(string(query.Target)))
	resp := make([]*targetCount, 0)
	if err := x.Sql(rawSql, query.OrgId).Find(&resp); err != nil {
		return err
	}

	query.Result = &m.QuotaDTO{
		Target: query.Target,
		Limit:  quota.Limit,
		OrgId:  query.OrgId,
		Used:   resp[0].Count,
	}

	return nil
}

func GetQuotas(query *m.GetQuotasQuery) error {
	quotas := make([]*m.Quota, 0)
	sess := x.Table("quota")
	if err := sess.Where("org_id=?", query.OrgId).Find(&quotas); err != nil {
		return err
	}

	seenTargets := make(map[m.QuotaTarget]bool)
	for _, q := range quotas {
		seenTargets[q.Target] = true
	}

	for t, v := range setting.Quota.Default {
		if _, ok := seenTargets[m.QuotaTarget(t)]; !ok {
			quotas = append(quotas, &m.Quota{
				OrgId:  query.OrgId,
				Target: m.QuotaTarget(t),
				Limit:  v,
			})
		}
	}
	result := make([]*m.QuotaDTO, len(quotas))
	for i, q := range quotas {
		//get quota used.
		rawSql := fmt.Sprintf("SELECT COUNT(*) as count from %s where org_id=?", dialect.Quote(string(q.Target)))
		resp := make([]*targetCount, 0)
		if err := x.Sql(rawSql, q.OrgId).Find(&resp); err != nil {
			return err
		}
		result[i] = &m.QuotaDTO{
			Target: q.Target,
			Limit:  q.Limit,
			OrgId:  q.OrgId,
			Used:   resp[0].Count,
		}
	}
	query.Result = result
	return nil
}

func UpdateQuota(cmd *m.UpdateQuotaCmd) error {
	return inTransaction2(func(sess *session) error {
		//Check if quota is already defined in the DB
		quota := m.Quota{
			Target: cmd.Target,
			OrgId:  cmd.OrgId,
		}
		has, err := sess.Get(quota)
		if err != nil {
			return err
		}
		quota.Limit = cmd.Limit
		if has == false {
			//No quota in the DB for this target, so create a new one.
			if _, err := sess.Insert(&quota); err != nil {
				return err
			}
		} else {
			//update existing quota entry in the DB.
			if _, err := sess.Id(quota.Id).Update(&quota); err != nil {
				return err
			}
		}

		return nil
	})
}
