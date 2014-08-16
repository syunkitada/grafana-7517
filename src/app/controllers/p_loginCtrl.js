define([
  'angular',
],
function (angular) {
  'use strict';

  var module = angular.module('grafana.controllers');

  module.controller('LoginCtrl', function($scope, $http, $location, $routeParams, alertSrv) {
    $scope.loginModel = {};

    $scope.init = function() {
      if ($routeParams.logout) {
        $scope.logout();
      }
    };

    $scope.logout = function() {
      $http.post('/logout').then(function() {

        alertSrv.set('Logged out!', '', 'success', 3000);
        $scope.emitAppEvent('logged-out');

      }, function() {
        alertSrv.set('Logout failed:', 'Unexpected error', 'error', 3000);
      });
    };

    $scope.login = function() {
      delete $scope.loginError;

      if (!$scope.loginForm.$valid) {
        return;
      }

      $http.post('/login', $scope.loginModel).then(function() {
        $scope.emitAppEvent('logged-in');
        $location.path('/');
      }, function(err) {
        if (err.status === 401) {
          $scope.loginError = "Username or password is incorrect";
        }
        else {
          $scope.loginError = "Unexpected error";
        }
      });
    };

    $scope.init();

  });

});
