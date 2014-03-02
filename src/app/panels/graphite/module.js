/** @scratch /panels/5
 * include::panels/histogram.asciidoc[]
 */

/** @scratch /panels/histogram/0
 * == Histogram
 * Status: *Stable*
 *
 * The histogram panel allow for the display of time charts. It includes several modes and tranformations
 * to display event counts, mean, min, max and total of numeric fields, and derivatives of counter
 * fields.
 *
 */
define([
  'angular',
  'app',
  'jquery',
  'underscore',
  'kbn',
  'moment',
  './timeSeries',
  'jquery.flot',
  'jquery.flot.events',
  'jquery.flot.selection',
  'jquery.flot.time',
  'jquery.flot.byte',
  'jquery.flot.stack',
  'jquery.flot.stackpercent'
],
function (angular, app, $, _, kbn, moment, timeSeries) {

  'use strict';

  var module = angular.module('kibana.panels.graphite', []);
  app.useModule(module);

  module.controller('graphite', function($scope, $rootScope, filterSrv, datasourceSrv, $timeout, annotationsSrv) {

    $scope.panelMeta = {
      modals : [],
      editorTabs: [],
      fullEditorTabs : [
        {
          title: 'General',
          src:'app/partials/panelgeneral.html'
        },
        {
          title: 'Metrics',
          src:'app/partials/metrics.html'
        },
        {
          title:'Axes & Grid',
          src:'app/panels/graphite/axisEditor.html'
        },
        {
          title:'Display Styles',
          src:'app/panels/graphite/styleEditor.html'
        }
      ],
      fullscreenEdit: true,
      fullscreenView: true,
      description : "Graphing"
    };

    // Set and populate defaults
    var _d = {

      datasource: null,

      /** @scratch /panels/histogram/3
       * renderer:: sets client side (flot) or native graphite png renderer (png)
       */
      renderer: 'flot',
      /** @scratch /panels/histogram/3
       * x-axis:: Show the x-axis
       */
      'x-axis'      : true,
      /** @scratch /panels/histogram/3
       * y-axis:: Show the y-axis
       */
      'y-axis'      : true,
      /** @scratch /panels/histogram/3
       * scale:: Scale the y-axis by this factor
       */
      scale         : 1,
      /** @scratch /panels/histogram/3
       * y_formats :: 'none','bytes','short', 'ms'
       */
      y_formats    : ['short', 'short'],
      /** @scratch /panels/histogram/5
       * grid object:: Min and max y-axis values
       * grid.min::: Minimum y-axis value
       * grid.ma1::: Maximum y-axis value
       */
      grid          : {
        max: null,
        min: 0,
        threshold1: null,
        threshold2: null,
        threshold1Color: 'rgba(216, 200, 27, 0.27)',
        threshold2Color: 'rgba(234, 112, 112, 0.22)'
      },

      annotate      : {
        enable      : false,
      },

      /** @scratch /panels/histogram/3
       * resolution:: If auto_int is true, shoot for this many bars.
       */
      resolution    : 100,

      /** @scratch /panels/histogram/3
       * ==== Drawing options
       * lines:: Show line chart
       */
      lines         : true,
      /** @scratch /panels/histogram/3
       * fill:: Area fill factor for line charts, 1-10
       */
      fill          : 0,
      /** @scratch /panels/histogram/3
       * linewidth:: Weight of lines in pixels
       */
      linewidth     : 1,
      /** @scratch /panels/histogram/3
       * points:: Show points on chart
       */
      points        : false,
      /** @scratch /panels/histogram/3
       * pointradius:: Size of points in pixels
       */
      pointradius   : 5,
      /** @scratch /panels/histogram/3
       * bars:: Show bars on chart
       */
      bars          : false,
      /** @scratch /panels/histogram/3
       * stack:: Stack multiple series
       */
      stack         : false,
      /** @scratch /panels/histogram/3
       * legend:: Display the legond
       */
      legend: {
        show: true, // disable/enable legend
        values: false, // disable/enable legend values
        min: false,
        max: false,
        current: false,
        total: false,
        avg: false
      },
      /** @scratch /panels/histogram/3
       * ==== Transformations
      /** @scratch /panels/histogram/3
       * percentage:: Show the y-axis as a percentage of the axis total. Only makes sense for multiple
       * queries
       */
      percentage    : false,
      /** @scratch /panels/histogram/3
       * zerofill:: Improves the accuracy of line charts at a small performance cost.
       */
      zerofill      : true,

      nullPointMode : 'connected',

      steppedLine: false,

      tooltip       : {
        value_type: 'cumulative',
        query_as_alias: true
      },

      targets: [],

      aliasColors: {},
      aliasYAxis: {},
    };

    _.defaults($scope.panel,_d);
    _.defaults($scope.panel.tooltip, _d.tooltip);
    _.defaults($scope.panel.annotate, _d.annotate);
    _.defaults($scope.panel.grid, _d.grid);

    // backward compatible stuff
    if (_.isBoolean($scope.panel.legend)) {
      $scope.panel.legend = { show: $scope.panel.legend };
      _.defaults($scope.panel.legend, _d.legend);
    }

    if ($scope.panel.y_format) {
      $scope.panel.y_formats[0] = $scope.panel.y_format;
      delete $scope.panel.y_format;
    }
    if ($scope.panel.y2_format) {
      $scope.panel.y_formats[1] = $scope.panel.y2_format;
      delete $scope.panel.y2_format;
    }

    $scope.init = function() {
      $scope.initPanel($scope);

      $scope.fullscreen = false;
      $scope.editor = { index: 1 };
      $scope.editorTabs = _.pluck($scope.panelMeta.fullEditorTabs,'title');
      $scope.hiddenSeries = {};

      $scope.datasources = datasourceSrv.listOptions();
      $scope.setDatasource($scope.panel.datasource);
    };

    $scope.setDatasource = function(datasource) {
      $scope.panel.datasource = datasource;
      $scope.datasource = datasourceSrv.get(datasource);

      if (!$scope.datasource) {
        $scope.panel.error = "Cannot find datasource " + datasource;
        return;
      }

      $scope.get_data();
    };

    $scope.removeTarget = function (target) {
      $scope.panel.targets = _.without($scope.panel.targets, target);
      $scope.get_data();
    };

    $scope.updateTimeRange = function () {
      $scope.range = filterSrv.timeRange();
      $scope.rangeUnparsed = filterSrv.timeRange(false);
      $scope.resolution = ($(window).width() / ($scope.panel.span / 12)) / 2;

      $scope.interval = '10m';

      if ($scope.range) {
        $scope.interval = kbn.secondsToHms(
          kbn.calculate_interval($scope.range.from, $scope.range.to, $scope.resolution, 0) / 1000
        );
      }
    };

    $scope.get_data = function() {
      delete $scope.panel.error;

      $scope.panelMeta.loading = true;

      $scope.updateTimeRange();

      var graphiteQuery = {
        range: $scope.rangeUnparsed,
        interval: $scope.interval,
        targets: $scope.panel.targets,
        format: $scope.panel.renderer === 'png' ? 'png' : 'json',
        maxDataPoints: $scope.resolution,
        datasource: $scope.panel.datasource
      };

      $scope.annotationsPromise = annotationsSrv.getAnnotations($scope.rangeUnparsed);

      return $scope.datasource.query(graphiteQuery)
        .then($scope.dataHandler)
        .then(null, function(err) {
          $scope.panel.error = err.message || "Graphite HTTP Request Error";
        });
    };

    $scope.dataHandler = function(results) {
      $scope.panelMeta.loading = false;
      $scope.legend = [];

      // png renderer returns just a url
      if (_.isString(results)) {
        $scope.render(results);
        return;
      }

      $scope.datapointsWarning = false;
      $scope.datapointsCount = 0;
      $scope.datapointsOutside = false;

      var data = _.map(results.data, $scope.seriesHandler);

      $scope.datapointsWarning = $scope.datapointsCount || !$scope.datapointsOutside;

      $scope.annotationsPromise
        .then(function(annotations) {
          data.annotations = annotations;
          $scope.render(data);
        }, function() {
          $scope.render(data);
        });
    };

    $scope.seriesHandler = function(seriesData, index) {
      var datapoints = seriesData.datapoints;
      var alias = seriesData.target;
      var color = $scope.panel.aliasColors[alias] || $scope.colors[index];
      var yaxis = $scope.panel.aliasYAxis[alias] || 1;

      var seriesInfo = {
        alias: alias,
        color:  color,
        enable: true,
        yaxis: yaxis
      };

      $scope.legend.push(seriesInfo);

      var series = new timeSeries.ZeroFilled({
        datapoints: datapoints,
        info: seriesInfo,
      });

      if (datapoints && datapoints.length > 0) {
        var last = moment.utc(datapoints[datapoints.length - 1][1] * 1000);
        var from = moment.utc($scope.range.from);
        if (last - from < -10000) {
          $scope.datapointsOutside = true;
        }
      }

      $scope.datapointsCount += datapoints.length;

      return series;
    };

    $scope.add_target = function() {
      $scope.panel.targets.push({target: ''});
    };

    $scope.otherPanelInFullscreenMode = function() {
      return $rootScope.fullscreen && !$scope.fullscreen;
    };

    $scope.render = function(data) {
      $scope.$emit('render', data);
    };

    $scope.changeSeriesColor = function(series, color) {
      series.color = color;
      $scope.panel.aliasColors[series.alias] = series.color;
      $scope.render();
    };

    $scope.toggleSeries = function(info) {
      if ($scope.hiddenSeries[info.alias]) {
        delete $scope.hiddenSeries[info.alias];
      }
      else {
        $scope.hiddenSeries[info.alias] = true;
      }

      $scope.$emit('toggleLegend', info.alias);
    };

    $scope.toggleYAxis = function(info) {
      info.yaxis = info.yaxis === 2 ? 1 : 2;
      $scope.panel.aliasYAxis[info.alias] = info.yaxis;
      $scope.render();
    };

    $scope.toggleGridMinMax = function(key) {
      $scope.panel.grid[key] = _.toggle($scope.panel.grid[key], null, 0);
      $scope.render();
    };

  });


});

