define([
  'angular',
  'lodash',
  'moment',
  'kbn',
  './queryBuilder',
  './indexPattern',
  './queryCtrl',
  './directives'
],
function (angular, _, moment, kbn, ElasticQueryBuilder, IndexPattern) {
  'use strict';

  var module = angular.module('grafana.services');

  module.factory('ElasticDatasource', function($q, backendSrv, templateSrv) {

    function ElasticDatasource(datasource) {
      this.type = 'elasticsearch';
      this.basicAuth = datasource.basicAuth;
      this.url = datasource.url;
      this.name = datasource.name;
      this.index = datasource.index;
      this.timeField = datasource.jsonData.timeField;
      this.indexPattern = new IndexPattern(datasource.index, datasource.jsonData.interval);
      this.queryBuilder = new ElasticQueryBuilder({
        timeField: this.timeField
      });
    }

    ElasticDatasource.prototype._request = function(method, url, data) {
      var options = {
        url: this.url + "/" + url,
        method: method,
        data: data
      };

      if (this.basicAuth) {
        options.withCredentials = true;
        options.headers = {
          "Authorization": this.basicAuth
        };
      }

      return backendSrv.datasourceRequest(options);
    };

    ElasticDatasource.prototype._get = function(url) {
      return this._request('GET', this.indexPattern.getIndexForToday() + url)
        .then(function(results) {
          return results.data;
        });
    };

    ElasticDatasource.prototype._post = function(url, data) {
      return this._request('POST', url, data)
        .then(function(results) {
          return results.data;
        });
    };

    ElasticDatasource.prototype.annotationQuery = function(annotation, rangeUnparsed) {
      var range = {};
      var timeField = annotation.timeField || '@timestamp';
      var queryString = annotation.query || '*';
      var tagsField = annotation.tagsField || 'tags';
      var titleField = annotation.titleField || 'desc';
      var textField = annotation.textField || null;

      range[timeField]= {
        from: rangeUnparsed.from,
        to: rangeUnparsed.to,
      };

      var queryInterpolated = templateSrv.replace(queryString);
      var filter = { "bool": { "must": [{ "range": range }] } };
      var query = { "bool": { "should": [{ "query_string": { "query": queryInterpolated } }] } };
      var data = {
        "fields": [timeField, "_source"],
        "query" : { "filtered": { "query" : query, "filter": filter } },
        "size": 10000
      };

      return this._request('POST', annotation.index + '/_search', data).then(function(results) {
        var list = [];
        var hits = results.data.hits.hits;

        var getFieldFromSource = function(source, fieldName) {
          if (!fieldName) { return; }

          var fieldNames = fieldName.split('.');
          var fieldValue = source;

          for (var i = 0; i < fieldNames.length; i++) {
            fieldValue = fieldValue[fieldNames[i]];
            if (!fieldValue) {
              console.log('could not find field in annotatation: ', fieldName);
              return '';
            }
          }

          if (_.isArray(fieldValue)) {
            fieldValue = fieldValue.join(', ');
          }
          return fieldValue;
        };

        for (var i = 0; i < hits.length; i++) {
          var source = hits[i]._source;
          var fields = hits[i].fields;
          var time = source[timeField];

          if (_.isString(fields[timeField]) || _.isNumber(fields[timeField])) {
            time = fields[timeField];
          }

          var event = {
            annotation: annotation,
            time: moment.utc(time).valueOf(),
            title: getFieldFromSource(source, titleField),
            tags: getFieldFromSource(source, tagsField),
            text: getFieldFromSource(source, textField)
          };

          list.push(event);
        }
        return list;
      });
    };

    ElasticDatasource.prototype.testDatasource = function() {
      return this._get('/_stats').then(function() {
        return { status: "success", message: "Data source is working", title: "Success" };
      }, function(err) {
        if (err.data && err.data.error) {
          return { status: "error", message: err.data.error, title: "Error" };
        } else {
          return { status: "error", message: err.status, title: "Error" };
        }
      });
    };

    ElasticDatasource.prototype.getQueryHeader = function(timeRange) {
      var header = {search_type: "count", "ignore_unavailable": true};
      var from = kbn.parseDate(timeRange.from);
      var to = kbn.parseDate(timeRange.to);
      header.index = this.indexPattern.getIndexList(from, to);
      return angular.toJson(header);
    };

    ElasticDatasource.prototype.query = function(options) {
      var payload = "";
      var target;
      var sentTargets = [];

      var header = this.getQueryHeader(options.range);
      var timeFrom = this.translateTime(options.range.from);
      var timeTo = this.translateTime(options.range.to);

      for (var i = 0; i < options.targets.length; i++) {
        target = options.targets[i];
        if (target.hide) {return;}

        var esQuery = this.queryBuilder.build(target, timeFrom, timeTo);
        payload += header + '\n';
        payload += angular.toJson(esQuery) + '\n';

        sentTargets.push(target);
      }

      payload = payload.replace(/\$interval/g, options.interval);
      payload = payload.replace(/\$timeFrom/g, this.translateTime(options.range.from));
      payload = payload.replace(/\$timeTo/g, this.translateTime(options.range.to));
      payload = payload.replace(/\$maxDataPoints/g, options.maxDataPoints);
      payload = templateSrv.replace(payload, options.scopedVars);

      var processTimeSeries = _.bind(this._processTimeSeries, this, sentTargets);
      return this._post('/_msearch?search_type=count', payload).then(processTimeSeries);
    };

    ElasticDatasource.prototype.translateTime = function(date) {
      if (_.isString(date)) {
        return date;
      }

      return date.getTime();
    };

    // This is quite complex
    // neeed to recurise down the nested buckets to build series
    ElasticDatasource.prototype._processBuckets = function(aggs, target, series, level, parentName) {
      var seriesName, value, metric, i, y, bucket, aggDef, esAgg;

      function addMetricPoint(seriesName, value, time) {
        var current = series[seriesName];
        if (!current) {
          current = series[seriesName] = {target: seriesName, datapoints: []};
        }
        current.datapoints.push([value, time]);
      }

      aggDef = target.bucketAggs[level];
      esAgg = aggs[aggDef.id];

      for (i = 0; i < esAgg.buckets.length; i++) {
        bucket = esAgg.buckets[i];

        // if last agg collect series
        if (level === target.bucketAggs.length - 1) {
          for (y = 0; y < target.metrics.length; y++) {
            metric = target.metrics[y];
            seriesName = parentName;

            switch(metric.type) {
              case 'count': {
                seriesName += ' count';
                value = bucket.doc_count;
                addMetricPoint(seriesName, value, bucket.key);
                break;
              }
              case 'percentiles': {
                var values = bucket[metric.id].values;
                for (var prop in values) {
                  addMetricPoint(seriesName + ' ' + prop, values[prop], bucket.key);
                }
                break;
              }
              case 'extended_stats': {
                var stats = bucket[metric.id];

                for (var statIndex in metric.stats) {
                  var statName = metric.stats[statIndex];
                  addMetricPoint(seriesName + ' ' + statName, stats[statName], bucket.key);
                }
                break;
              }
              default: {
                seriesName += ' ' + metric.field + ' ' + metric.type;
                value = bucket[metric.id].value;
                addMetricPoint(seriesName, value, bucket.key);
                break;
              }
            }
          }
        }
        else {
          this._processBuckets(bucket, target, series, level+1, parentName + ' ' + bucket.key);
        }
      }
    };

    ElasticDatasource.prototype._processTimeSeries = function(targets, results) {
      var series = [];

      for (var i = 0; i < results.responses.length; i++) {
        var response = results.responses[i];
        if (response.error) {
          throw { message: response.error };
        }

        var aggregations = response.aggregations;
        var target = targets[i];
        var querySeries = {};

        this._processBuckets(aggregations, target, querySeries, 0, target.refId);

        for (var prop in querySeries) {
          if (querySeries.hasOwnProperty(prop)) {
            series.push(querySeries[prop]);
          }
        }
      }

      return { data: series };
    };

    ElasticDatasource.prototype.metricFindQuery = function() {
      return this._get('/_mapping').then(function(res) {
        var fields = {};

        for (var indexName in res) {
          var index = res[indexName];
          var mappings = index.mappings;
          if (!mappings) { continue; }
          for (var typeName in mappings) {
            var properties = mappings[typeName].properties;
            for (var field in properties) {
              var prop = properties[field];
              if (prop.type && field[0] !== '_') {
                fields[field] = prop;
              }
            }
          }
        }

        fields = _.map(_.keys(fields), function(field) {
          return {text: field};
        });

        return fields;
      });
    };

    return ElasticDatasource;
  });
});
