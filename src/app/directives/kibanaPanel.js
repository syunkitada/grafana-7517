define([
  'angular'
],
function (angular) {
  'use strict';

  angular
    .module('kibana.directives')
    .directive('kibanaPanel', function($compile) {

      var container = '<div class="panel-container" ng-style="{\'min-height\':row.height}""></div>';
      var content = '<div class="panel-content"></div>';

      var panelHeader =
      '<div class="panel-header">'+
        '<div class="row-fluid">' +
          '<div class="span12 alert-error panel-error" ng-hide="!panel.error">' +
            '<a class="close" ng-click="panel.error=false">&times;</a>' +
            '<i class="icon-exclamation-sign"></i> <strong>Oops!</strong> {{panel.error}}' +
          '</div>' +
        '</div>\n' +

        '<div class="row-fluid panel-extra">' +
          '<div class="panel-extra-container">' +

            '<span class="panel-loading" ng-show="panelMeta.loading == true">' +
              '<i class="icon-spinner icon-spin icon-large"></i>' +
            '</span>' +

            '<span ng-if="panelMeta.menuItems" class="dropdown" ng-show="panel.title">' +
              '<span class="panel-text panel-title pointer" bs-dropdown="panelMeta.menuItems" tabindex="1" ' +
              'data-drag=true data-jqyoui-options="{revert: \'invalid\',helper:\'clone\'}"'+
              ' jqyoui-draggable="'+
              '{'+
                'animate:false,'+
                'mutate:false,'+
                'index:{{$index}},'+
                'onStart:\'panelMoveStart\','+
                'onStop:\'panelMoveStop\''+
                '}"  ng-model="row.panels" ' +
                '>' +
                '{{panel.title}}' +
              '</span>' +
            '</span>'+

            '<span ng-if="!panelMeta.menuItems" config-modal class="panel-text panel-title pointer" ng-show="panel.title">' +
              '{{panel.title}}' +
            '</span>'+

          '</div>'+
        '</div>\n'+
      '</div>';

      return {
        restrict: 'E',
        link: function($scope, elem, attr) {
          // once we have the template, scan it for controllers and
          // load the module.js if we have any
          var newScope = $scope.$new();

          // compile the module and uncloack. We're done
          function loadModule($module) {
            $module.appendTo(elem);
            elem.wrap(container);
            /* jshint indent:false */
            $compile(elem.contents())(newScope);
            elem.removeClass("ng-cloak");
          }

          newScope.$on('$destroy',function(){
            elem.unbind();
            elem.remove();
          });

          $scope.$watch(attr.type, function (name) {
            elem.addClass("ng-cloak");
            // load the panels module file, then render it in the dom.
            var nameAsPath = name.replace(".", "/");
            $scope.require([
              'jquery',
              'text!panels/'+nameAsPath+'/module.html',
              'text!panels/'+nameAsPath+'/editor.html'
            ], function ($, moduleTemplate) {
              var $module = $(moduleTemplate);
              // top level controllers
              var $controllers = $module.filter('ngcontroller, [ng-controller], .ng-controller');
              // add child controllers
              $controllers = $controllers.add($module.find('ngcontroller, [ng-controller], .ng-controller'));

              if ($controllers.length) {
                $controllers.first().prepend(panelHeader);
                $controllers.first().find('.panel-header').nextAll().wrapAll(content);

                $scope.require([
                  'panels/'+nameAsPath+'/module'
                ], function() {
                  loadModule($module);
                });
              } else {
                loadModule($module);
              }
            });
          });
        }
      };
    });

});