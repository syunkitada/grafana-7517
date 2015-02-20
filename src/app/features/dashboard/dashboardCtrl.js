define([
  'angular',
  'jquery',
  'config',
  'lodash',
],
function (angular, $, config) {
  "use strict";

  var module = angular.module('grafana.controllers');

  module.controller('DashboardCtrl', function(
      $scope,
      $rootScope,
      dashboardKeybindings,
      timeSrv,
      templateValuesSrv,
      dashboardSrv,
      dashboardViewStateSrv,
      $timeout) {

    $scope.editor = { index: 0 };
    $scope.panels = config.panels;

    var resizeEventTimeout;

    this.init = function(dashboard) {
      $scope.reset_row();
      $scope.registerWindowResizeEvent();
      $scope.onAppEvent('show-json-editor', $scope.showJsonEditor);
      $scope.setupDashboard(dashboard);
    };

    $scope.registerWindowResizeEvent = function() {
      angular.element(window).bind('resize', function() {
        $timeout.cancel(resizeEventTimeout);
        resizeEventTimeout = $timeout(function() { $scope.$broadcast('render'); }, 200);
      });
    };

    $scope.setupDashboard = function(dashboard) {
      $rootScope.performance.dashboardLoadStart = new Date().getTime();
      $rootScope.performance.panelsInitialized = 0;
      $rootScope.performance.panelsRendered = 0;

      $scope.dashboard = dashboardSrv.create(dashboard.model);
      $scope.dashboardViewState = dashboardViewStateSrv.create($scope);
      $scope.dashboardMeta = dashboard.meta;

      // init services
      timeSrv.init($scope.dashboard);
      templateValuesSrv.init($scope.dashboard, $scope.dashboardViewState);

      dashboardKeybindings.shortcuts($scope);

      $scope.updateSubmenuVisibility();
      $scope.setWindowTitleAndTheme();

      $scope.appEvent("dashboard-loaded", $scope.dashboard);
    };

    $scope.updateSubmenuVisibility = function() {
      $scope.submenuEnabled = $scope.dashboard.hasTemplateVarsOrAnnotations();
    };

    $scope.setWindowTitleAndTheme = function() {
      window.document.title = config.window_title_prefix + $scope.dashboard.title;
      $scope.contextSrv.lightTheme = $scope.dashboard.style === 'light';
    };

    $scope.styleUpdated = function() {
      $scope.contextSrv.lightTheme = $scope.dashboard.style === 'light';
    };

    $scope.add_row = function(dash, row) {
      dash.rows.push(row);
    };

    $scope.add_row_default = function() {
      $scope.reset_row();
      $scope.row.title = 'New row';
      $scope.add_row($scope.dashboard, $scope.row);
    };

    $scope.reset_row = function() {
      $scope.row = {
        title: '',
        height: '250px',
        editable: true,
      };
    };

    $scope.panelEditorPath = function(type) {
      return 'app/' + config.panels[type].path + '/editor.html';
    };

    $scope.pulldownEditorPath = function(type) {
      return 'app/panels/'+type+'/editor.html';
    };

    $scope.showJsonEditor = function(evt, options) {
      var editScope = $rootScope.$new();
      editScope.object = options.object;
      editScope.updateHandler = options.updateHandler;
      $scope.appEvent('show-dash-editor', { src: 'app/partials/edit_json.html', scope: editScope });
    };

    $scope.onDrop = function(panelId, row, dropTarget) {
      var info = $scope.dashboard.getPanelInfoById(panelId);
      if (dropTarget) {
        var dropInfo = $scope.dashboard.getPanelInfoById(dropTarget.id);
        dropInfo.row.panels[dropInfo.index] = info.panel;
        info.row.panels[info.index] = dropTarget;
        var dragSpan = info.panel.span;
        info.panel.span = dropTarget.span;
        dropTarget.span = dragSpan;
      }
      else {
        info.row.panels.splice(info.index, 1);
        info.panel.span = 12 - $scope.dashboard.rowSpan(row);
        row.panels.push(info.panel);
      }

      $rootScope.$broadcast('render');
    };

  });
});
