define([
  'angular',
  'lodash',
  'jquery',
],
function (angular, _, $) {
  'use strict';

  var module = angular.module('grafana.directives');

    module.controller('ElasticMetricAggCtrl', function($scope, uiSegmentSrv, $q) {
      var metricAggs = $scope.target.metrics;

      $scope.metricAggTypes = [
        {text: "Count",           value: 'count' },
        {text: "Average of",  value: 'avg' },
        {text: "Sum of",  value: 'sum' },
        {text: "Max of",  value: 'max' },
        {text: "Min of",  value: 'min' },
        {text: "Standard Deviations",  value: 'std_dev' },
      ];

      $scope.init = function() {
        $scope.agg = metricAggs[$scope.index];
        if (!$scope.agg.field) {
          $scope.agg.field = 'select field';
        }
      }

      $scope.$watchCollection("target.metrics", function() {
        $scope.isFirst = $scope.index === 0;
        $scope.isLast = $scope.index === metricAggs.length - 1;
        $scope.isSingle = metricAggs.length === 1;
      });

      $scope.toggleOptions = function() {
        $scope.showOptions = !$scope.showOptions;
      }

      $scope.addMetricAgg = function() {
        var addIndex = metricAggs.length;

        var id = _.reduce($scope.target.bucketAggs.concat($scope.target.metrics), function(max, val) {
          return parseInt(val.id) > max ? parseInt(val.id) : max;
        }, 0);

        metricAggs.splice(addIndex, 0, {type: "count", field: "select field", id: (id+1).toString()});
      };

      $scope.removeMetricAgg = function() {
        metricAggs.splice($scope.index, 1);
        $scope.onChange();
      };

      $scope.init();

    });

    module.directive('elasticMetricAgg', function() {
      return {
        templateUrl: 'app/plugins/datasource/elasticsearch/partials/metricAgg.html',
        controller: 'ElasticMetricAggCtrl',
        restrict: 'E',
        scope: {
          target: "=",
          index: "=",
          onChange: "&",
          getFields: "&",
        },
        link: function postLink($scope, elem) {
        }
      };
    });
});
