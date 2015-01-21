define([
  'angular',
  './dashboard',
], function(angular) {
  "use strict";

  var module = angular.module('grafana.routes');

  module.config(function($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    $routeProvider
      .when('/', {
        templateUrl: 'app/partials/dashboard.html',
        controller : 'DashFromDBProvider',
        reloadOnSearch: false,
      })
      .when('/dashboard/db/:id', {
        templateUrl: 'app/partials/dashboard.html',
        controller : 'DashFromDBProvider',
        reloadOnSearch: false,
      })
      .when('/dashboard/temp/:id', {
        templateUrl: 'app/partials/dashboard.html',
        controller : 'DashFromDBProvider',
        reloadOnSearch: false,
      })
      .when('/dashboard/import/:id', {
        templateUrl: 'app/partials/dashboard.html',
        controller : 'DashFromImportCtrl',
        reloadOnSearch: false,
      })
      .when('/account', {
        templateUrl: 'app/features/account/partials/account.html',
      })
      .when('/account/datasources', {
        templateUrl: 'app/features/account/partials/datasources.html',
        controller : 'DataSourcesCtrl',
      })
      .when('/account/users', {
        templateUrl: 'app/features/account/partials/users.html',
        controller : 'AccountUsersCtrl',
      })
      .when('/account/apikeys', {
        templateUrl: 'app/features/account/partials/apikeys.html',
        controller : 'ApiKeysCtrl',
      })
      .when('/account/import', {
        templateUrl: 'app/features/account/partials/import.html',
        controller : 'ImportCtrl',
      })
      .when('/profile', {
        templateUrl: 'app/features/profile/partials/profile.html',
        controller : 'ProfileCtrl',
      })
      .when('/admin/users', {
        templateUrl: 'app/features/admin/partials/users.html',
        controller : 'AdminUsersCtrl',
      })
      .when('/login', {
        templateUrl: 'app/partials/login.html',
        controller : 'LoginCtrl',
      })
      .when('/dashboard/solo/:id/', {
        templateUrl: 'app/partials/solo-panel.html',
        controller : 'SoloPanelCtrl',
      })
      .otherwise({
        templateUrl: 'app/partials/error.html',
        controller: 'ErrorCtrl'
      });
  });

});
