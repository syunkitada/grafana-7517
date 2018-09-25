/** @ngInject */
export default class StackdriverDatasource {
  id: number;
  url: string;
  baseUrl: string;
  projectName: string;

  constructor(instanceSettings, private backendSrv, private templateSrv, private timeSrv) {
    this.baseUrl = `/stackdriver/`;
    this.url = instanceSettings.url;
    this.doRequest = this.doRequest;
    this.id = instanceSettings.id;
    this.projectName = instanceSettings.jsonData.defaultProject || '';
  }

  async getTimeSeries(options) {
    const queries = options.targets
      .filter(target => {
        return !target.hide && target.metricType;
      })
      .map(t => {
        if (!t.hasOwnProperty('aggregation')) {
          t.aggregation = {
            crossSeriesReducer: 'REDUCE_MEAN',
            groupBys: [],
          };
        }
        return {
          refId: t.refId,
          datasourceId: this.id,
          metricType: this.templateSrv.replace(t.metricType, options.scopedVars || {}),
          primaryAggregation: this.templateSrv.replace(t.aggregation.crossSeriesReducer, options.scopedVars || {}),
          perSeriesAligner: this.templateSrv.replace(t.aggregation.perSeriesAligner, options.scopedVars || {}),
          alignmentPeriod: this.templateSrv.replace(t.aggregation.alignmentPeriod, options.scopedVars || {}),
          groupBys: this.interpolateGroupBys(t.aggregation.groupBys, options.scopedVars),
          view: t.view || 'FULL',
          filters: (t.filters || []).map(f => {
            return this.templateSrv.replace(f, options.scopedVars || {});
          }),
          aliasBy: this.templateSrv.replace(t.aliasBy, options.scopedVars || {}),
          type: 'timeSeriesQuery',
        };
      });

    const { data } = await this.backendSrv.datasourceRequest({
      url: '/api/tsdb/query',
      method: 'POST',
      data: {
        from: options.range.from.valueOf().toString(),
        to: options.range.to.valueOf().toString(),
        queries,
      },
    });
    return data;
  }

  async getLabels(metricType, refId) {
    return await this.getTimeSeries({
      targets: [
        {
          refId: refId,
          datasourceId: this.id,
          metricType: this.templateSrv.replace(metricType),
          aggregation: {
            crossSeriesReducer: 'REDUCE_NONE',
          },
          view: 'HEADERS',
        },
      ],
      range: this.timeSrv.timeRange(),
    });
  }

  interpolateGroupBys(groupBys: string[], scopedVars): string[] {
    let interpolatedGroupBys = [];
    (groupBys || []).forEach(gb => {
      const interpolated = this.templateSrv.replace(gb, scopedVars || {}, 'csv').split(',');
      if (Array.isArray(interpolated)) {
        interpolatedGroupBys = interpolatedGroupBys.concat(interpolated);
      } else {
        interpolatedGroupBys.push(interpolated);
      }
    });
    return interpolatedGroupBys;
  }

  async query(options) {
    const result = [];
    const data = await this.getTimeSeries(options);
    if (data.results) {
      Object['values'](data.results).forEach(queryRes => {
        if (!queryRes.series) {
          return;
        }
        queryRes.series.forEach(series => {
          result.push({
            target: series.name,
            datapoints: series.points,
            refId: queryRes.refId,
            meta: queryRes.meta,
          });
        });
      });
    }

    return { data: result };
  }

  testDatasource() {
    const path = `v3/projects/${this.projectName}/metricDescriptors`;
    return this.doRequest(`${this.baseUrl}${path}`)
      .then(response => {
        if (response.status === 200) {
          return {
            status: 'success',
            message: 'Successfully queried the Stackdriver API.',
            title: 'Success',
          };
        }

        return {
          status: 'error',
          message: 'Returned http status code ' + response.status,
        };
      })
      .catch(error => {
        let message = 'Stackdriver: ';
        message += error.statusText ? error.statusText + ': ' : '';

        if (error.data && error.data.error && error.data.error.code) {
          // 400, 401
          message += error.data.error.code + '. ' + error.data.error.message;
        } else {
          message += 'Cannot connect to Stackdriver API';
        }
        return {
          status: 'error',
          message: message,
        };
      });
  }

  async getProjects() {
    const response = await this.doRequest(`/cloudresourcemanager/v1/projects`);
    return response.data.projects.map(p => ({ id: p.projectId, name: p.name }));
  }

  async getDefaultProject() {
    const projects = await this.getProjects();
    if (projects && projects.length > 0) {
      const test = projects.filter(p => p.id === this.projectName)[0];
      return test;
    } else {
      throw new Error('No projects found');
    }
  }

  async getMetricTypes(projectId: string) {
    try {
      const metricsApiPath = `v3/projects/${projectId}/metricDescriptors`;
      const { data } = await this.doRequest(`${this.baseUrl}${metricsApiPath}`);
      return data.metricDescriptors.map(m => ({ id: m.type, name: m.displayName }));
    } catch (error) {
      console.log(error);
    }
  }

  async doRequest(url, maxRetries = 1) {
    return this.backendSrv
      .datasourceRequest({
        url: this.url + url,
        method: 'GET',
      })
      .catch(error => {
        if (maxRetries > 0) {
          return this.doRequest(url, maxRetries - 1);
        }

        throw error;
      });
  }
}
