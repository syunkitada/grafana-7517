define([
  'angular',
],
function (angular) {
  'use strict';

  var module = angular.module('grafana.controllers');

  module.controller('OrgUsersCtrl', function($scope, $http, backendSrv) {

    $scope.user = {
      loginOrEmail: '',
      role: 'Viewer',
    };

    $scope.users = [];
    $scope.pendingInvites = [];

    $scope.init = function() {
      $scope.get();
      $scope.editor = { index: 0 };
    };

    $scope.get = function() {
      backendSrv.get('/api/org/users').then(function(users) {
        $scope.users = users;
      });
      backendSrv.get('/api/org/invites').then(function(pendingInvites) {
        $scope.pendingInvites = pendingInvites;
      });
    };

    $scope.updateOrgUser = function(user) {
      backendSrv.patch('/api/org/users/' + user.userId, user);
    };

    $scope.removeUser = function(user) {
      backendSrv.delete('/api/org/users/' + user.userId).then($scope.get);
    };

    $scope.addUser = function() {
      if (!$scope.form.$valid) { return; }
      backendSrv.post('/api/org/users', $scope.user).then($scope.get);
    };

    $scope.openInviteModal = function() {
      var modalScope = $scope.$new();
      modalScope.invitesSent = function() {
        $scope.get();
      };

      $scope.appEvent('show-modal', {
        src: './app/features/org/partials/invite.html',
        modalClass: 'modal-no-header invite-modal',
        scope: modalScope
      });
    };

    $scope.init();

  });
});
