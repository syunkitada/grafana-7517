define([
  'angular',
  'app',
  'lodash',
  'jquery',
],
function (angular, app, _, $) {
  'use strict';

  angular
    .module('grafana.directives')
    .directive('templateParamSelector', function($compile) {
      var inputTemplate = '<input type="text" data-provide="typeahead" ' +
                            ' class="grafana-target-segment-input input-medium"' +
                            ' spellcheck="false" style="display:none"></input>';

      var buttonTemplate = '<a  class="grafana-target-segment tabindex="1">{{variable.current.text}}</a>';

      return {
        link: function($scope, elem) {
          var $input = $(inputTemplate);
          var $button = $(buttonTemplate);
          var variable = $scope.variable;
          var options = _.map(variable.options, function(option) {
            return option.text;
          });

          $input.appendTo(elem);
          $button.appendTo(elem);

          function updateVariableValue(value) {
            $scope.$apply(function() {
              var selected = _.findWhere(variable.options, { text: value });
              if (!selected) {
                selected = { text: value, value: value };
              }
              $scope.setVariableValue($scope.variable, selected);
            });
          }

          $input.attr('data-provide', 'typeahead');
          $input.typeahead({
            source: options,
            minLength: 0,
            items: 10,
            updater: function(value) {
              updateVariableValue(value);
              $input.trigger('blur');
              return '';
            }
          });

          var typeahead = $input.data('typeahead');
          typeahead.lookup = function () {
            this.query = this.$element.val() || '';
            return this.process(this.source);
          };

          $button.click(function() {
            $input.css('width', ($button.width() + 16) + 'px');

            $button.hide();
            $input.show();
            $input.focus();

            var typeahead = $input.data('typeahead');
            if (typeahead) {
              $input.val('');
              typeahead.lookup();
            }

          });

          $input.blur(function() {
            if ($input.val() !== '') { updateVariableValue($input.val()); }
            $input.hide();
            $button.show();
            $button.focus();
          });

          $compile(elem.contents())($scope);
        }
      };
    });
});
