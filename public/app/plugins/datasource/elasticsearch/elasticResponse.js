define([
  "lodash",
  "./queryDef"
],
function (_, queryDef) {
  'use strict';

  function ElasticResponse(targets, response) {
    this.targets = targets;
    this.response = response;
  }

  // This is quite complex
  // neeed to recurise down the nested buckets to build series
  ElasticResponse.prototype.processBuckets = function(aggs, target, seriesList, level, props) {
    var value, metric, i, y, bucket, aggDef, esAgg, newSeries;

    aggDef = target.bucketAggs[level];
    esAgg = aggs[aggDef.id];

    if (level < target.bucketAggs.length - 1) {
      for (i = 0; i < esAgg.buckets.length; i++) {
        bucket = esAgg.buckets[i];
        props = _.clone(props);
        props[aggDef.field] = bucket.key;
        this.processBuckets(bucket, target, seriesList, level+1, props);
      }
      return;
    }

    for (y = 0; y < target.metrics.length; y++) {
      metric = target.metrics[y];

      switch(metric.type) {
        case 'count': {
          newSeries = { datapoints: [], metric: 'count', props: props};
          for (i = 0; i < esAgg.buckets.length; i++) {
            bucket = esAgg.buckets[i];
            value = bucket.doc_count;
            newSeries.datapoints.push([value, bucket.key]);
          }
          seriesList.push(newSeries);
          break;
        }
        case 'percentiles': {
          if (esAgg.buckets.length === 0) {
            break;
          }

          var firstBucket = esAgg.buckets[0];
          var percentiles = firstBucket[metric.id].values;

          for (var percentileName in percentiles) {
            newSeries = {datapoints: [], metric: 'p' + percentileName, props: props};

            for (i = 0; i < esAgg.buckets.length; i++) {
              bucket = esAgg.buckets[i];
              var values = bucket[metric.id].values;
              newSeries.datapoints.push([values[percentileName], bucket.key]);
            }
            seriesList.push(newSeries);
          }

          break;
        }
        case 'extended_stats': {
          for (var statName in metric.meta) {
            if (!metric.meta[statName]) {
              continue;
            }

            newSeries = {datapoints: [], metric: statName, props: props};

            for (i = 0; i < esAgg.buckets.length; i++) {
              bucket = esAgg.buckets[i];
              var stats = bucket[metric.id];

              // add stats that are in nested obj to top level obj
              stats.std_deviation_bounds_upper = stats.std_deviation_bounds.upper;
              stats.std_deviation_bounds_lower = stats.std_deviation_bounds.lower;

              newSeries.datapoints.push([stats[statName], bucket.key]);
            }

            seriesList.push(newSeries);
          }

          break;
        }
        default: {
          newSeries = { datapoints: [], metric: metric.type, field: metric.field, props: props};
          for (i = 0; i < esAgg.buckets.length; i++) {
            bucket = esAgg.buckets[i];
            value = bucket[metric.id].value;
            newSeries.datapoints.push([value, bucket.key]);
          }
          seriesList.push(newSeries);
          break;
        }
      }
    }
  };

  ElasticResponse.prototype._getMetricName = function(metric) {
    var metricDef = _.findWhere(queryDef.metricAggTypes, {value: metric});
    if (!metricDef)  {
      metricDef = _.findWhere(queryDef.extendedStats, {value: metric});
    }

    return metricDef ? metricDef.text : metric;
  };

  ElasticResponse.prototype._getSeriesName = function(series, target, metricTypeCount) {
    var metricName = this._getMetricName(series.metric);

    if (target.alias) {
      var regex = /\{\{([\s\S]+?)\}\}/g;

      return target.alias.replace(regex, function(match, g1, g2) {
        var group = g1 || g2;

        if (group.indexOf('term ') === 0) { return series.props[group.substring(5)]; }
        if (series.props[group]) { return series.props[group]; }
        if (group === 'metric') { return metricName; }
        if (group === 'field') { return series.field; }

        return match;
      });
    }

    if (series.field) {
      metricName += ' ' + series.field;
    }

    var propKeys = _.keys(series.props);
    if (propKeys.length === 0) {
      return metricName;
    }

    var name = '';
    for (var propName in series.props) {
      name += series.props[propName] + ' ';
    }

    if (metricTypeCount === 1) {
      return name.trim();
    }

    return name.trim() + ' ' + metricName;
  };

  ElasticResponse.prototype.nameSeries = function(seriesList, target) {
    var metricTypeCount = _.uniq(_.pluck(seriesList, 'metric')).length;
    var fieldNameCount = _.uniq(_.pluck(seriesList, 'field')).length;

    for (var i = 0; i < seriesList.length; i++) {
      var series = seriesList[i];
      series.target = this._getSeriesName(series, target, metricTypeCount, fieldNameCount);
    }
  };

  ElasticResponse.prototype.getTimeSeries = function() {
    var seriesList = [];

    for (var i = 0; i < this.response.responses.length; i++) {
      var response = this.response.responses[i];
      if (response.error) {
        throw { message: response.error };
      }

      var aggregations = response.aggregations;
      var target = this.targets[i];
      var tmpSeriesList = [];

      this.processBuckets(aggregations, target, tmpSeriesList, 0, {});
      this.nameSeries(tmpSeriesList, target);

      for (var y = 0; y < tmpSeriesList.length; y++) {
        seriesList.push(tmpSeriesList[y]);
      }
    }

    return { data: seriesList };
  };

  return ElasticResponse;
});
