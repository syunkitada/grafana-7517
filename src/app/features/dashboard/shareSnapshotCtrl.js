define([
  'angular',
],
function (angular) {
  'use strict';

  var module = angular.module('grafana.controllers');

  module.controller('ShareSnapshotCtrl', function($scope, $rootScope, $location, backendSrv, $timeout) {

    $scope.snapshot = {
      name: $scope.dashboard.title
    };

    $scope.createSnapshot = function(makePublic) {
      $scope.dashboard.snapshot = true;
      $scope.loading = true;
      $rootScope.$broadcast('refresh');

      $timeout(function() {
        var dash = angular.copy($scope.dashboard);
        dash.title = $scope.snapshot.name;

        var apiUrl = '/api/snapshots';

        if (makePublic) {
          apiUrl = 'http://snapshots.raintank.io/api/snapshots';
        }

        backendSrv.post(apiUrl, {dashboard: dash}).then(function(results) {
          $scope.loading = false;

          var baseUrl = $location.absUrl().replace($location.url(), "");
          if (makePublic) {
            baseUrl = 'http://snapshots.raintank.io';
          }

          $scope.snapshotUrl = baseUrl + '/dashboard/snapshots/' + results.key;

        }, function() {
          $scope.loading = false;
        });

        $scope.dashboard.snapshot = false;
        $scope.appEvent('dashboard-snapshot-cleanup');
      }, 2000);
    };

  });

});
