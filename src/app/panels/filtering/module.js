/*

  ## filtering

*/
define([
  'angular',
  'app',
  'underscore'
],
function (angular, app, _) {
  'use strict';

  var module = angular.module('kibana.panels.filtering', []);
  app.useModule(module);

  module.controller('filtering', function($scope, filterSrv, datasourceSrv, $rootScope, dashboard) {

    $scope.panelMeta = {
      status  : "Stable",
      description : "graphite target filters"
    };

    // Set and populate defaults
    var _d = {
    };
    _.defaults($scope.panel,_d);

    $scope.init = function() {
      $scope.filterSrv = filterSrv;
    };

    $scope.remove = function(filter) {
      filterSrv.remove(filter);
    };

    $scope.applyFilter = function(filter) {
      datasourceSrv.default.metricFindQuery(filter.query)
        .then(function (results) {
          filter.editing=undefined;
          filter.options = _.map(results, function(node) {
            return { text: node.text, value: node.text };
          });

          if (filter.includeAll) {
            if(endsWithWildcard(filter.query)) {
              filter.options.unshift({text: 'All', value: '*'});
            }
            else {
              var allExpr = '{';
              _.each(filter.options, function(option) {
                allExpr += option.text + ',';
              });
              allExpr = allExpr.substring(0, allExpr.length - 1) + '}';
              filter.options.unshift({text: 'All', value: allExpr});
            }
          }

          filterSrv.filterOptionSelected(filter, filter.options[0]);
        });
    };

    $scope.add = function() {
      filterSrv.add({
        type      : 'filter',
        name      : 'filter name',
        editing   : true,
        query     : 'metric.path.query.*',
      });
    };

    $scope.refresh = function() {
      dashboard.refresh();
    };

    $scope.render = function() {
      $rootScope.$broadcast('render');
    };

    function endsWithWildcard(query) {
      if (query.length === 0) {
        return false;
      }

      return query[query.length - 1] === '*';
    }

  });
});