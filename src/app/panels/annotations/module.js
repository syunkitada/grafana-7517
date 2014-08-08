/*

  ## annotations

*/
define([
  'angular',
  'app',
  'lodash',
  './editor'
],
function (angular, app, _) {
  'use strict';

  var module = angular.module('grafana.panels.annotations', []);
  app.useModule(module);

  module.controller('AnnotationsCtrl', function($scope, datasourceSrv, $rootScope) {

    $scope.panelMeta = {
      status  : "Stable",
      description : "Annotations"
    };

    // Set and populate defaults
    var _d = {
      annotations: []
    };

    _.defaults($scope.panel, _d);

    $scope.hide = function (annotation) {
      annotation.enable = !annotation.enable;
      $rootScope.$broadcast('refresh');
    };

  });

});
