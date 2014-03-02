define([
  'angular',
  'underscore',
  'jquery',
  'config',
  'kbn',
  'moment'
],
function (angular, _, $, config, kbn, moment) {
  'use strict';

  var module = angular.module('kibana.services');

  module.factory('GraphiteDatasource', function(dashboard, $q, filterSrv, $http) {

    function GraphiteDatasource(datasource) {
      this.type = 'graphite';
      this.basicAuth = datasource.basicAuth;
      this.url = datasource.url;
      this.editorSrc = 'app/partials/graphite/editor.html';
      this.name = datasource.name;
    }

    GraphiteDatasource.prototype.query = function(options) {
      try {
        var graphOptions = {
          from: this.translateTime(options.range.from),
          until: this.translateTime(options.range.to),
          targets: options.targets,
          format: options.format,
          maxDataPoints: options.maxDataPoints,
        };

        var params = this.buildGraphiteParams(graphOptions);

        if (options.format === 'png') {
          return $q.when(this.url + '/render' + '?' + params.join('&'));
        }

        return this.doGraphiteRequest({
          method: 'POST',
          url: '/render',
          data: params.join('&'),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        });
      }
      catch(err) {
        return $q.reject(err);
      }
    };

    GraphiteDatasource.prototype.events = function(options) {
      try {
        var tags = '';
        if (options.tags) {
          tags = '&tags=' + options.tags;
        }

        return this.doGraphiteRequest({
          method: 'GET',
          url: '/events/get_data?from=' + this.translateTime(options.range.from) + '&until=' + this.translateTime(options.range.to) + tags,
        });
      }
      catch(err) {
        return $q.reject(err);
      }
    };

    GraphiteDatasource.prototype.translateTime = function(date) {
      if (_.isString(date)) {
        if (date === 'now') {
          return 'now';
        }
        else if (date.indexOf('now') >= 0) {
          date = date.substring(3);
          date = date.replace('m', 'min');
          date = date.replace('M', 'mon');
          return date;
        }

        date = kbn.parseDate(date);
      }

      date = moment.utc(date);

      if (dashboard.current.timezone === 'browser') {
        date = date.local();
      }

      if (config.timezoneOffset) {
        date = date.zone(config.timezoneOffset);
      }

      return date.format('HH:mm_YYYYMMDD');
    };

    GraphiteDatasource.prototype.metricFindQuery = function(query) {
      var interpolated;
      try {
        interpolated = filterSrv.applyFilterToTarget(query);
      }
      catch(err) {
        return $q.reject(err);
      }

      return this.doGraphiteRequest({method: 'GET', url: '/metrics/find/?query=' + interpolated })
        .then(function(results) {
          return _.map(results.data, function(metric) {
            return {
              text: metric.text,
              expandable: metric.expandable ? true : false
            };
          });
        });
    };

    GraphiteDatasource.prototype.listDashboards = function(query) {
      return this.doGraphiteRequest({ method: 'GET',  url: '/dashboard/find/', params: {query: query || ''} })
        .then(function(results) {
          return results.data.dashboards;
        });
    };

    GraphiteDatasource.prototype.loadDashboard = function(dashName) {
      return this.doGraphiteRequest({method: 'GET', url: '/dashboard/load/' + encodeURIComponent(dashName) });
    };

    GraphiteDatasource.prototype.doGraphiteRequest = function(options) {
      if (this.basicAuth) {
        options.withCredentials = true;
        options.headers = options.headers || {};
        options.headers.Authorization = 'Basic ' + this.basicAuth;
      }

      options.url = this.url + options.url;

      return $http(options);
    };

    GraphiteDatasource.prototype.buildGraphiteParams = function(options) {
      var clean_options = [];
      var graphite_options = ['target', 'targets', 'from', 'until', 'rawData', 'format', 'maxDataPoints'];

      if (options.format !== 'png') {
        options['format'] = 'json';
      }

      _.each(options, function (value, key) {
        if ($.inArray(key, graphite_options) === -1) {
          return;
        }

        if (key === "targets") {
          _.each(value, function (value) {
            if (!value.hide) {
              var targetValue = filterSrv.applyFilterToTarget(value.target);
              clean_options.push("target=" + encodeURIComponent(targetValue));
            }
          }, this);
        }
        else if (value !== null) {
          clean_options.push(key + "=" + encodeURIComponent(value));
        }
      }, this);
      return clean_options;
    };


    return GraphiteDatasource;

  });

});
