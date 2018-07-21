import _ from 'lodash';
import ResponseParser from './response_parser';

export class PostgresDatasource {
  id: any;
  name: any;
  responseParser: ResponseParser;

  /** @ngInject **/
  constructor(instanceSettings, private backendSrv, private $q, private templateSrv) {
    this.name = instanceSettings.name;
    this.id = instanceSettings.id;
    this.responseParser = new ResponseParser(this.$q);
  }

  interpolateVariable(value, variable) {
    if (typeof value === 'string') {
      if (variable.multi || variable.includeAll) {
        return "'" + value.replace(/'/g, `''`) + "'";
      } else {
        return value;
      }
    }

    if (typeof value === 'number') {
      return value;
    }

    var quotedValues = _.map(value, function(val) {
      return "'" + val.replace(/'/g, `''`) + "'";
    });
    return quotedValues.join(',');
  }

  query(options) {
    var queries = _.filter(options.targets, item => {
      return item.hide !== true;
    }).map(item => {
      return {
        refId: item.refId,
        intervalMs: options.intervalMs,
        maxDataPoints: options.maxDataPoints,
        datasourceId: this.id,
        rawSql: this.templateSrv.replace(item.rawSql, options.scopedVars, this.interpolateVariable),
        format: item.format,
      };
    });

    if (queries.length === 0) {
      return this.$q.when({ data: [] });
    }

    return this.backendSrv
      .datasourceRequest({
        url: '/api/tsdb/query',
        method: 'POST',
        data: {
          from: options.range.from.valueOf().toString(),
          to: options.range.to.valueOf().toString(),
          queries: queries,
        },
      })
      .then(this.responseParser.processQueryResult);
  }

  annotationQuery(options) {
    if (!options.annotation.rawQuery) {
      return this.$q.reject({
        message: 'Query missing in annotation definition',
      });
    }

    const query = {
      refId: options.annotation.name,
      datasourceId: this.id,
      rawSql: this.templateSrv.replace(options.annotation.rawQuery, options.scopedVars, this.interpolateVariable),
      format: 'table',
    };

    return this.backendSrv
      .datasourceRequest({
        url: '/api/tsdb/query',
        method: 'POST',
        data: {
          from: options.range.from.valueOf().toString(),
          to: options.range.to.valueOf().toString(),
          queries: [query],
        },
      })
      .then(data => this.responseParser.transformAnnotationResponse(options, data));
  }

  metricFindQuery(query, optionalOptions) {
    let refId = 'tempvar';
    if (optionalOptions && optionalOptions.variable && optionalOptions.variable.name) {
      refId = optionalOptions.variable.name;
    }

    const interpolatedQuery = {
      refId: refId,
      datasourceId: this.id,
      rawSql: this.templateSrv.replace(query, {}, this.interpolateVariable),
      format: 'table',
    };

    var data = {
      queries: [interpolatedQuery],
    };

    if (optionalOptions && optionalOptions.range && optionalOptions.range.from) {
      data['from'] = optionalOptions.range.from.valueOf().toString();
    }
    if (optionalOptions && optionalOptions.range && optionalOptions.range.to) {
      data['to'] = optionalOptions.range.to.valueOf().toString();
    }

    return this.backendSrv
      .datasourceRequest({
        url: '/api/tsdb/query',
        method: 'POST',
        data: data,
      })
      .then(data => this.responseParser.parseMetricFindQueryResult(refId, data));
  }

  testDatasource(control) {
    return this.metricFindQuery('SELECT 1', {})
      .then(res => {
        if (control.current.jsonData.timescaledb === 'auto') {
          return this.metricFindQuery("SELECT 1 FROM pg_extension WHERE extname='timescaledb'", {})
            .then(res => {
              if (res.length === 1) {
                control.current.jsonData.timescaledb = 'enabled';
                return this.backendSrv.put('/api/datasources/' + this.id, control.current).then(settings => {
                  control.current = settings.datasource;
                  control.updateFrontendSettings();
                  return { status: 'success', message: 'Database Connection OK, TimescaleDB found' };
                });
              }
              throw new Error('timescaledb not found');
            })
            .catch(err => {
              // query errored out or empty so timescaledb is not available
              return { status: 'success', message: 'Database Connection OK' };
            });
        }
        return { status: 'success', message: 'Database Connection OK' };
      })
      .catch(err => {
        console.log(err);
        if (err.data && err.data.message) {
          return { status: 'error', message: err.data.message };
        } else {
          return { status: 'error', message: err.status };
        }
      });
  }
}
