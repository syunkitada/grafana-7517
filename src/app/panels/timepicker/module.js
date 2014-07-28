/*

  ## Timepicker2

  ### Parameters
  * mode :: The default mode of the panel. Options: 'relative', 'absolute' 'since' Default: 'relative'
  * time_options :: An array of possible time options. Default: ['5m','15m','1h','6h','12h','24h','2d','7d','30d']
  * timespan :: The default options selected for the relative view. Default: '15m'
  * timefield :: The field in which time is stored in the document.
  * refresh: Object containing refresh parameters
    * enable :: true/false, enable auto refresh by default. Default: false
    * interval :: Seconds between auto refresh. Default: 30
    * min :: The lowest interval a user may set
*/
define([
  'angular',
  'app',
  'underscore',
  'moment',
  'kbn'
],
function (angular, app, _, moment, kbn) {
  'use strict';

  var module = angular.module('grafana.panels.timepicker', []);
  app.useModule(module);

  module.controller('timepicker', function($scope, $modal, $q) {
    $scope.panelMeta = {
      status  : "Stable",
      description : "A panel for controlling the time range filters. If you have time based data, "+
        " or if you're using time stamped indices, you need one of these"
    };

    // Set and populate defaults
    var _d = {
      status        : "Stable",
      time_options  : ['5m','15m','1h','6h','12h','24h','2d','7d','30d'],
      refresh_intervals : ['5s','10s','30s','1m','5m','15m','30m','1h','2h','1d'],
    };

    var customTimeModal = null;

    _.defaults($scope.panel,_d);

    // ng-pattern regexs
    $scope.patterns = {
      date: /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/,
      hour: /^([01]?[0-9]|2[0-3])$/,
      minute: /^[0-5][0-9]$/,
      second: /^[0-5][0-9]$/,
      millisecond: /^[0-9]*$/
    };

    $scope.$on('refresh', function() {
      $scope.init();
    });

    $scope.init = function() {
      var time = this.filter.timeRange(true);
      if(time) {
        $scope.panel.now = this.filter.timeRange(false).to === "now" ? true : false;
        $scope.time = getScopeTimeObj(time.from,time.to);
      }
    };

    $scope.customTime = function() {
      if (!customTimeModal) {
        customTimeModal = $modal({
          template: './app/panels/timepicker/custom.html',
          persist: true,
          show: false,
          scope: $scope,
          keyboard: false
        });
      }

      // Assume the form is valid since we're setting it to something valid
      $scope.input.$setValidity("dummy", true);
      $scope.temptime = cloneTime($scope.time);

      // Date picker needs the date to be at the start of the day
      $scope.temptime.from.date.setHours(1,0,0,0);
      $scope.temptime.to.date.setHours(1,0,0,0);

      $q.when(customTimeModal).then(function(modalEl) {
        modalEl.modal('show');
      });
    };

    // Constantly validate the input of the fields. This function does not change any date variables
    // outside of its own scope
    $scope.validate = function(time) {
      // Assume the form is valid. There is a hidden dummy input for invalidating it programatically.
      $scope.input.$setValidity("dummy", true);

      var _from = datepickerToLocal(time.from.date),
        _to = datepickerToLocal(time.to.date),
        _t = time;

      if($scope.input.$valid) {

        _from.setHours(_t.from.hour,_t.from.minute,_t.from.second,_t.from.millisecond);
        _to.setHours(_t.to.hour,_t.to.minute,_t.to.second,_t.to.millisecond);

        // Check that the objects are valid and to is after from
        if(isNaN(_from.getTime()) || isNaN(_to.getTime()) || _from.getTime() >= _to.getTime()) {
          $scope.input.$setValidity("dummy", false);
          return false;
        }
      } else {
        return false;
      }

      return {from:_from,to:_to};
    };

    $scope.setNow = function() {
      $scope.time.to = getTimeObj(new Date());
    };

    /*
      time : {
        from: Date
        to: Date
      }
    */
    $scope.setAbsoluteTimeFilter = function (time) {
      // Create filter object
      var _filter = _.clone(time);

      if($scope.panel.now) {
        _filter.to = "now";
      }

      // Set the filter
      $scope.panel.filter_id = $scope.filter.setTime(_filter);

      // Update our representation
      $scope.time = getScopeTimeObj(time.from,time.to);
    };

    $scope.setRelativeFilter = function(timespan) {
      $scope.panel.now = true;

      var _filter = {
        from : "now-"+timespan,
        to: "now"
      };

      this.filter.setTime(_filter);

      $scope.time = getScopeTimeObj(kbn.parseDate(_filter.from),new Date());
    };

    var pad = function(n, width, z) {
      z = z || '0';
      n = n.toString();
      return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    };

    var cloneTime = function(time) {
      var _n = {
        from: _.clone(time.from),
        to: _.clone(time.to)
      };
      // Create new dates as _.clone is shallow.
      _n.from.date = new Date(_n.from.date);
      _n.to.date = new Date(_n.to.date);
      return _n;
    };

    var getScopeTimeObj = function(from,to) {
      return {
        from: getTimeObj(from),
        to: getTimeObj(to)
      };
    };

    var getTimeObj = function(date) {
      return {
        date: new Date(date),
        hour: pad(date.getHours(),2),
        minute: pad(date.getMinutes(),2),
        second: pad(date.getSeconds(),2),
        millisecond: pad(date.getMilliseconds(),3)
      };
    };

    // Do not use the results of this function unless you plan to use setHour/Minutes/etc on the result
    var datepickerToLocal = function(date) {
      date = moment(date).clone().toDate();
      return moment(new Date(date.getTime() + date.getTimezoneOffset() * 60000)).toDate();
    };

  });
});
