define([
  'angular',
  'jquery',
  'config',
  'lodash',
  'services/all',
],
function (angular, $, config, _) {
  "use strict";

  var module = angular.module('grafana.controllers');

  module.controller('DashCtrl', function(
      $scope, $rootScope, dashboardKeybindings,
      filterSrv, dashboardSrv, dashboardViewStateSrv,
      panelMoveSrv, timer) {

    $scope.editor = { index: 0 };
    $scope.panelNames = config.panels;

    $scope.init = function() {
      $scope.availablePanels = config.panels;
      $scope.onAppEvent('setup-dashboard', $scope.setupDashboard);
    };

    $scope.setupDashboard = function(event, dashboardData) {
      timer.cancel_all();

      $scope.dashboard = dashboardSrv.create(dashboardData);
      $scope.dashboardViewState = dashboardViewStateSrv.create($scope);

      $scope.grafana.style = $scope.dashboard.style;

      $scope.filter = filterSrv;
      $scope.filter.init($scope.dashboard);

      var panelMove = panelMoveSrv.create($scope.dashboard);

      $scope.panelMoveDrop = panelMove.onDrop;
      $scope.panelMoveStart = panelMove.onStart;
      $scope.panelMoveStop = panelMove.onStop;
      $scope.panelMoveOver = panelMove.onOver;
      $scope.panelMoveOut = panelMove.onOut;

      window.document.title = 'Grafana - ' + $scope.dashboard.title;

      // start auto refresh
      if($scope.dashboard.refresh) {
        $scope.dashboard.set_interval($scope.dashboard.refresh);
      }

      dashboardKeybindings.shortcuts($scope);

      $scope.emitAppEvent("dashboard-loaded", $scope.dashboard);
    };

    $scope.isPanel = function(obj) {
      if(!_.isNull(obj) && !_.isUndefined(obj) && !_.isUndefined(obj.type)) {
        return true;
      } else {
        return false;
      }
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

    $scope.row_style = function(row) {
      return { 'min-height': row.collapse ? '5px' : row.height };
    };

    $scope.panel_path =function(type) {
      if(type) {
        return 'app/panels/'+type.replace(".","/");
      } else {
        return false;
      }
    };

    $scope.edit_path = function(type) {
      var p = $scope.panel_path(type);
      if(p) {
        return p+'/editor.html';
      } else {
        return false;
      }
    };

    $scope.setEditorTabs = function(panelMeta) {
      $scope.editorTabs = ['General','Panel'];
      if(!_.isUndefined(panelMeta.editorTabs)) {
        $scope.editorTabs =  _.union($scope.editorTabs,_.pluck(panelMeta.editorTabs,'title'));
      }
      return $scope.editorTabs;
    };

    $scope.init();
  });
});
