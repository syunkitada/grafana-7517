define([
  'angular',
  'lodash',
  'kbn',
],
function (angular, _, kbn) {
  'use strict';

  var module = angular.module('grafana.services');

  module.factory('GrafanaDatasource', function($q, backendSrv) {

    function GrafanaDatasource() {
    }

    GrafanaDatasource.prototype.getDashboard = function(slug, isTemp) {
      var url = '/dashboards/' + slug;

      if (isTemp) {
        url = '/temp/' + slug;
      }

      return backendSrv.get('/api/dashboards/db/' + slug);
    };

    GrafanaDatasource.prototype.query = function(options) {
      // get from & to in seconds
      var from = kbn.parseDate(options.range.from).getTime();
      var to = kbn.parseDate(options.range.to).getTime();

      return backendSrv.get('/api/metrics/test', { from: from, to: to, maxDataPoints: options.maxDataPoints });
    };

    GrafanaDatasource.prototype.metricFindQuery = function() {
      return $q.when([]);
    };

    GrafanaDatasource.prototype.starDashboard = function(dashId) {
      return backendSrv.post('/api/user/stars/dashboard/' + dashId);
    };

    GrafanaDatasource.prototype.unstarDashboard = function(dashId) {
      return backendSrv.delete('/api/user/stars/dashboard/' + dashId);
    };

    GrafanaDatasource.prototype.saveDashboard = function(dashboard) {
      return backendSrv.post('/api/dashboards/db/', { dashboard: dashboard })
        .then(function(data) {
          return { title: dashboard.title, url: '/dashboard/db/' + data.slug };
        }, function(err) {
          err.isHandled = true;
          err.data = err.data || {};
          throw err.data.message || "Unknown error";
        });
    };

    GrafanaDatasource.prototype.deleteDashboard = function(id) {
      return backendSrv.delete('/api/dashboards/db/' + id);
    };

    GrafanaDatasource.prototype.searchDashboards = function(query) {
      return backendSrv.get('/api/search/', query)
        .then(function(data) {
          return data;
        });
    };

    return GrafanaDatasource;

  });

});
