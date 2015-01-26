define([
  'angular',
],
function (angular) {
  'use strict';

  var module = angular.module('grafana.controllers');

  module.controller('ApiKeysCtrl', function($scope, $http, backendSrv) {

    $scope.roleTypes = ['Viewer', 'Editor', 'Admin'];
    $scope.token = { role: 'Viewer' };

    $scope.init = function() {
      $scope.getTokens();
    };

    $scope.getTokens = function() {
      backendSrv.get('/api/tokens').then(function(tokens) {
        $scope.tokens = tokens;
      });
    };

    $scope.removeToken = function(id) {
      backendSrv.delete('/api/tokens/'+id).then($scope.getTokens);
    };

    $scope.addToken = function() {
      backendSrv.post('/api/tokens', $scope.token).then($scope.getTokens);
    };

    $scope.init();

  });
});
