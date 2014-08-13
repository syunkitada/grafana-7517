define([
  'angular',
  'lodash',
  'jquery',
],
function (angular, _, $) {
  'use strict';

  var module = angular.module('grafana.services');
  module.service('panelSrv', function($rootScope, $timeout, datasourceSrv) {

    this.init = function($scope) {
      if (!$scope.panel.span) {
        $scope.panel.span = 12;
      }

      var menu = [
        {
          text: 'Edit',
          configModal: "app/partials/paneleditor.html",
          condition: !$scope.panelMeta.fullscreenEdit
        },
        {
          text: 'Edit',
          click: "toggleFullscreenEdit()",
          condition: $scope.panelMeta.fullscreenEdit
        },
        {
          text: "Fullscreen",
          click: 'toggleFullscreen()',
          condition: $scope.panelMeta.fullscreenView
        },
        {
          text: 'Duplicate',
          click: 'duplicatePanel(panel)',
          condition: true
        },
        {
          text: 'Span',
          submenu: [
            { text: '1', click: 'updateColumnSpan(1)' },
            { text: '2', click: 'updateColumnSpan(2)' },
            { text: '3', click: 'updateColumnSpan(3)' },
            { text: '4', click: 'updateColumnSpan(4)' },
            { text: '5', click: 'updateColumnSpan(5)' },
            { text: '6', click: 'updateColumnSpan(6)' },
            { text: '7', click: 'updateColumnSpan(7)' },
            { text: '8', click: 'updateColumnSpan(8)' },
            { text: '9', click: 'updateColumnSpan(9)' },
            { text: '10', click: 'updateColumnSpan(10)' },
            { text: '11', click: 'updateColumnSpan(11)' },
            { text: '12', click: 'updateColumnSpan(12)' },
          ],
          condition: true
        },
        {
          text: 'Remove',
          click: 'remove_panel_from_row(row, panel)',
          condition: true
        }
      ];

      $scope.inspector = {};
      $scope.panelMeta.menu = _.where(menu, { condition: true });

      $scope.updateColumnSpan = function(span) {
        $scope.panel.span = span;

        $timeout(function() {
          $scope.$emit('render');
        });
      };

      $scope.enterFullscreenMode = function(options) {
        var docHeight = $(window).height();
        var editHeight = Math.floor(docHeight * 0.3);
        var fullscreenHeight = Math.floor(docHeight * 0.7);
        var oldTimeRange = $scope.range;

        $scope.height = options.edit ? editHeight : fullscreenHeight;
        $scope.editMode = options.edit;

        if (!$scope.fullscreen) {
          var closeEditMode = $rootScope.$on('panel-fullscreen-exit', function() {
            $scope.editMode = false;
            $scope.fullscreen = false;
            delete $scope.height;

            closeEditMode();

            $timeout(function() {
              if (oldTimeRange !== $scope.range) {
                $scope.dashboard.emit_refresh();
              }
              else {
                $scope.$emit('render');
              }
            });
          });
        }

        $(window).scrollTop(0);

        $scope.dashboardViewState.update({ fullscreen: true, edit: $scope.editMode, panelId: $scope.panel.id });

        $scope.fullscreen = true;

        $timeout(function() {
          $scope.$emit('render');
        });

      };

      $scope.addDataQuery = function() {
        $scope.panel.targets.push({target: ''});
      };

      $scope.removeDataQuery = function (query) {
        $scope.panel.targets = _.without($scope.panel.targets, query);
        $scope.get_data();
      };

      $scope.setDatasource = function(datasource) {
        $scope.panel.datasource = datasource;
        $scope.datasource = datasourceSrv.get(datasource);

        if (!$scope.datasource) {
          $scope.panel.error = "Cannot find datasource " + datasource;
          return;
        }
      };

      $scope.changeDatasource = function(datasource) {
        $scope.setDatasource(datasource);
        $scope.get_data();
      };

      $scope.toggleFullscreenEdit = function() {
        if ($scope.editMode) {
          $rootScope.$emit('panel-fullscreen-exit');
          return;
        }

        $scope.enterFullscreenMode({edit: true});
      };

      $scope.toggleFullscreen = function() {
        if ($scope.fullscreen && !$scope.editMode) {
          $rootScope.$emit('panel-fullscreen-exit');
          return;
        }

        $scope.enterFullscreenMode({ edit: false });
      };

      $scope.otherPanelInFullscreenMode = function() {
        return $scope.dashboardViewState.fullscreen && !$scope.fullscreen;
      };

      // Post init phase
      $scope.fullscreen = false;
      $scope.editor = { index: 1 };
      if ($scope.panelMeta.fullEditorTabs) {
        $scope.editorTabs = _.pluck($scope.panelMeta.fullEditorTabs, 'title');
      }

      $scope.datasources = datasourceSrv.getMetricSources();
      $scope.setDatasource($scope.panel.datasource);

      if ($scope.dashboardViewState.panelId === $scope.panel.id) {
        $scope.enterFullscreenMode({edit: $scope.dashboardViewState.edit});
      }

      if ($scope.get_data) {
        var panel_get_data = $scope.get_data;
        $scope.get_data = function() {
          if ($scope.otherPanelInFullscreenMode()) { return; }

          delete $scope.panel.error;
          $scope.panelMeta.loading = true;

          panel_get_data();
        };
        if (!$scope.skipDataOnInit) {
          $scope.get_data();
        }
      }
    };
  });

});
