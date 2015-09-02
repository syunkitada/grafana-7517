define([
  'angular',
  'lodash',
],
function (angular, _) {
  'use strict';

  var module = angular.module('grafana.controllers');

  module.controller('CloudWatchQueryCtrl', function($scope, templateSrv, uiSegmentSrv) {

    $scope.init = function() {
      $scope.target.namespace = $scope.target.namespace || '';
      $scope.target.metricName = $scope.target.metricName || '';
      $scope.target.dimensions = $scope.target.dimensions || {};
      $scope.target.escapedDimensions = this.escapeDimensions($scope.target.dimensions);
      $scope.target.statistics = $scope.target.statistics || {};
      $scope.target.period = $scope.target.period || 60;
      $scope.target.region = $scope.target.region || $scope.datasource.getDefaultRegion();
      $scope.target.errors = validateTarget();

      $scope.regionSegment = $scope.getSegmentForValue($scope.target.region, 'select region');
      $scope.namespaceSegment = $scope.getSegmentForValue($scope.target.namespace, 'select namespace');
      $scope.metricSegment = $scope.getSegmentForValue($scope.target.metricName, 'select metric');
    };

    $scope.getSegmentForValue = function(value, fallbackText) {
      if (value) {
        return uiSegmentSrv.newSegment(value);
      } else {
        return uiSegmentSrv.newSegment({value: fallbackText, fake: true});
      }
    };

    $scope.getRegions = function() {
      return $scope.datasource.metricFindQuery('region()')
        .then($scope.transformToSegments(true));
    };

    $scope.getNamespaces = function() {
      return $scope.datasource.metricFindQuery('namespace()')
        .then($scope.transformToSegments(true));
    };

    $scope.getMetrics = function() {
      return $scope.datasource.metricFindQuery('metrics(' + $scope.target.namespace + ')')
        .then($scope.transformToSegments(true));
    };

    $scope.regionChanged = function() {
      $scope.target.region = $scope.regionSegment.value;
      $scope.get_data();
    };

    $scope.namespaceChanged = function() {
      $scope.target.namespace = $scope.namespaceSegment.value;
      $scope.get_data();
    };

    $scope.metricChanged = function() {
      $scope.target.metricName = $scope.metricSegment.value;
      $scope.get_data();
    };

    $scope.transformToSegments = function(addTemplateVars) {
      return function(results) {
        var segments = _.map(results, function(segment) {
          return uiSegmentSrv.newSegment({ value: segment.text, expandable: segment.expandable });
        });

        if (addTemplateVars) {
          _.each(templateSrv.variables, function(variable) {
            segments.unshift(uiSegmentSrv.newSegment({ type: 'template', value: '$' + variable.name, expandable: true }));
          });
        }

        return segments;
      };
    };

    $scope.refreshMetricData = function() {
      $scope.target.errors = validateTarget($scope.target);

      // this does not work so good
      if (!_.isEqual($scope.oldTarget, $scope.target) && _.isEmpty($scope.target.errors)) {
        $scope.oldTarget = angular.copy($scope.target);
        $scope.get_data();
      }
    };

    $scope.suggestDimensionKeys = function(query, callback) { // jshint unused:false
      return _.union($scope.datasource.performSuggestDimensionKeys($scope.target.namespace), $scope.datasource.getTemplateVariableNames());
    };

    $scope.suggestDimensionValues = function(query, callback) {
      if (!$scope.target.namespace || !$scope.target.metricName) {
        return callback([]);
      }

      $scope.datasource.performSuggestDimensionValues(
        $scope.target.region,
        $scope.target.namespace,
        $scope.target.metricName,
        $scope.target.dimensions
      )
      .then(function(result) {
        var suggestData = _.chain(result)
        .flatten(true)
        .filter(function(dimension) {
          return dimension.Name === templateSrv.replace($scope.target.currentDimensionKey);
        })
        .pluck('Value')
        .uniq()
        .value();

        suggestData = _.union(suggestData, $scope.datasource.getTemplateVariableNames());
        callback(suggestData);
      }, function() {
        callback([]);
      });
    };

    $scope.addDimension = function() {
      if (!$scope.addDimensionMode) {
        $scope.addDimensionMode = true;
        return;
      }

      if (!$scope.target.dimensions) {
        $scope.target.dimensions = {};
      }

      $scope.target.dimensions[$scope.target.currentDimensionKey] = $scope.target.currentDimensionValue;
      $scope.target.escapedDimensions = this.escapeDimensions($scope.target.dimensions);
      $scope.target.currentDimensionKey = '';
      $scope.target.currentDimensionValue = '';
      $scope.refreshMetricData();

      $scope.addDimensionMode = false;
    };

    $scope.removeDimension = function(key) {
      key = key.replace(/\\\$/g, '$');
      delete $scope.target.dimensions[key];
      $scope.target.escapedDimensions = this.escapeDimensions($scope.target.dimensions);
      $scope.refreshMetricData();
    };

    $scope.escapeDimensions = function(d) {
      var result = {};
      _.chain(d)
      .keys(d)
      .each(function(k) {
        var v = d[k];
        result[k.replace(/\$/g, '\uFF04')] = v.replace(/\$/g, '\$');
      });

      return result;
    };

    $scope.statisticsOptionChanged = function() {
      $scope.refreshMetricData();
    };

    // TODO: validate target
    function validateTarget() {
      var errs = {};

      if ($scope.target.period < 60 || ($scope.target.period % 60) !== 0) {
        errs.period = 'Period must be at least 60 seconds and must be a multiple of 60';
      }

      return errs;
    }

    $scope.init();

  });

});
