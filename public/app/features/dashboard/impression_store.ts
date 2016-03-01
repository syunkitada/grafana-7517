///<reference path="../../headers/common.d.ts" />

import store from 'app/core/store';
import _ from 'lodash';

export class ImpressionsStore {
  constructor() {}

  addDashboardImpression(impression) {
    var impressions = [];
    if (store.exists("dashboard_impressions")) {
      impressions = JSON.parse(store.get("dashboard_impressions"));
      if (!_.isArray(impressions)) {
        impressions = [];
      }
    }

    impressions = impressions.filter((imp) => {
      return impression.slug !== imp.slug;
    });

    impressions.unshift({
      title: impression.title,
      slug: impression.slug,
      orgId: impression.orgId,
      type: impression.type
    });

    if (impressions.length > 20) {
      impressions.shift();
    }
    store.set("dashboard_impressions", JSON.stringify(impressions));
  }

  getDashboardOpened() {
    var impressions = store.get("dashboard_impressions");
    return JSON.parse(impressions || "[]");
  }
}

var impressions = new ImpressionsStore();

export {
  impressions
};
