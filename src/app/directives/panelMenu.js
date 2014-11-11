define([
  'angular',
  'jquery',
  'lodash',
],
function (angular, $, _) {
  'use strict';

  angular
    .module('grafana.directives')
    .directive('panelMenu', function($compile, linkSrv) {
      var linkTemplate = '<span class="panel-title drag-handle pointer">{{panel.title | interpolateTemplateVars}}</span>';

      function createMenuTemplate($scope) {
        var template = '<div class="panel-menu small">';
        template += '<div class="panel-menu-inner">';
        template += '<div class="panel-menu-row">';
        template += '<a class="panel-menu-icon pull-left" ng-click="updateColumnSpan(-1)"><i class="icon-minus"></i></a>';
        template += '<a class="panel-menu-icon pull-left" ng-click="updateColumnSpan(1)"><i class="icon-plus"></i></a>';
        template += '<a class="panel-menu-icon pull-right" ng-click="remove_panel_from_row(row, panel)"><i class="icon-remove"></i></a>';
        template += '<div class="clearfix"></div>';
        template += '</div>';

        template += '<div class="panel-menu-row">';
        template += '<a class="panel-menu-link" bs-dropdown="extendedMenu"><i class="icon-th-list"></i></a>';

        _.each($scope.panelMeta.menu, function(item) {
          template += '<a class="panel-menu-link" ';
          if (item.click) { template += ' ng-click="' + item.click + '"'; }
          if (item.editorLink) { template += ' dash-editor-link="' + item.editorLink + '"'; }
          template += '>';
          template += item.text + '</a>';
        });

        template += '</div>';
        template += '</div>';
        template += '</div>';
        return template;
      }

      function getExtendedMenu($scope) {
        var menu =angular.copy($scope.panelMeta.extendedMenu);
        if (!$scope.panel.links) { return; }

        _.each($scope.panel.links, function(link) {
          var info = linkSrv.getPanelLinkAnchorInfo(link);
          menu.push({text: info.title, href: info.href, target: info.target });
        });
        return menu;
      }

      return {
        restrict: 'A',
        link: function($scope, elem) {
          var $link = $(linkTemplate);
          var $panelContainer = elem.parents(".panel-container");
          var menuWidth = $scope.panelMeta.menu.length === 4 ? 236 : 191;
          var menuScope = null;
          var timeout = null;
          var $menu = null;

          elem.append($link);

          function dismiss(time) {
            clearTimeout(timeout);
            timeout = null;

            if (time) {
              timeout = setTimeout(dismiss, time);
              return;
            }

            // if hovering or draging pospone close
            if ($menu.is(':hover') || $scope.dashboard.$$panelDragging) {
              dismiss(2500);
              return;
            }

            if (menuScope) {
              $menu.unbind();
              $menu.remove();
              menuScope.$destroy();
              menuScope = null;
              $menu = null;
              $panelContainer.removeClass('panel-highlight');
            }
          }

          var showMenu = function() {
            if ($menu) {
              dismiss();
              return;
            }

            var windowWidth = $(window).width();
            var panelLeftPos = $(elem).offset().left;
            var panelWidth = $(elem).width();
            var menuLeftPos = (panelWidth / 2) - (menuWidth/2);
            var stickingOut = panelLeftPos + menuLeftPos + menuWidth - windowWidth;
            if (stickingOut > 0) {
              menuLeftPos -= stickingOut + 10;
            }
            if (panelLeftPos + menuLeftPos < 0) {
              menuLeftPos = 0;
            }

            var menuTemplate = createMenuTemplate($scope);
            $menu = $(menuTemplate);
            $menu.css('left', menuLeftPos);
            $menu.mouseleave(function() {
              dismiss(1000);
            });

            menuScope = $scope.$new();
            menuScope.extendedMenu = getExtendedMenu($scope);

            $('.panel-menu').remove();
            elem.append($menu);
            $scope.$apply(function() {
              $compile($menu.contents())(menuScope);
            });

            $(".panel-container").removeClass('panel-highlight');
            $panelContainer.toggleClass('panel-highlight');

            dismiss(2500);
          };

          if ($scope.panelMeta.titlePos && $scope.panel.title) {
            elem.css('text-align', 'left');
            $link.css('padding-left', '10px');
          }

          elem.click(showMenu);
          $compile(elem.contents())($scope);
        }
      };
    });
});
