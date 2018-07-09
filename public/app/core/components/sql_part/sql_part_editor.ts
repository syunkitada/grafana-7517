import _ from 'lodash';
import $ from 'jquery';
import coreModule from 'app/core/core_module';

var template = `
<div class="dropdown cascade-open">
<a ng-click="showActionsMenu()" class="query-part-name pointer dropdown-toggle" data-toggle="dropdown">{{part.label}}</a>
<span>{{part.def.wrapOpen}}</span><span class="query-part-parameters"></span><span>{{part.def.wrapClose}}</span>
<ul class="dropdown-menu">
  <li ng-repeat="action in partActions">
    <a ng-click="triggerPartAction(action)">{{action.text}}</a>
  </li>
</ul>
`;

/** @ngInject */
export function sqlPartEditorDirective($compile, templateSrv) {
  var paramTemplate = '<input type="text" class="hide input-mini"></input>';

  return {
    restrict: 'E',
    template: template,
    scope: {
      part: '=',
      handleEvent: '&',
      debounce: '@',
    },
    link: function postLink($scope, elem) {
      var part = $scope.part;
      var partDef = part.def;
      var $paramsContainer = elem.find('.query-part-parameters');
      var debounceLookup = $scope.debounce;

      $scope.partActions = [];

      function clickFuncParam(paramIndex) {
        /*jshint validthis:true */
        var $link = $(this);
        var $input = $link.next();

        $input.val(part.params[paramIndex]);
        $input.css('width', $link.width() + 16 + 'px');

        $link.hide();
        $input.show();
        $input.focus();
        $input.select();

        var typeahead = $input.data('typeahead');
        if (typeahead) {
          $input.val('');
          typeahead.lookup();
        }
      }

      function inputBlur(paramIndex) {
        /*jshint validthis:true */
        var $input = $(this);
        var $link = $input.prev();
        var newValue = $input.val();

        if (newValue !== '' || part.def.params[paramIndex].optional) {
          $link.html(templateSrv.highlightVariablesAsHtml(newValue));

          part.updateParam($input.val(), paramIndex);
          $scope.$apply(() => {
            $scope.handleEvent({ $event: { name: 'part-param-changed' } });
          });
        }

        $input.hide();
        $link.show();
      }

      function inputKeyPress(paramIndex, e) {
        /*jshint validthis:true */
        if (e.which === 13) {
          inputBlur.call(this, paramIndex);
        }
      }

      function inputKeyDown() {
        /*jshint validthis:true */
        this.style.width = (3 + this.value.length) * 8 + 'px';
      }

      function addTypeahead($input, param, paramIndex) {
        if (!param.options && !param.dynamicLookup) {
          return;
        }

        var typeaheadSource = function(query, callback) {
          if (param.options) {
            var options = param.options;
            if (param.type === 'int') {
              options = _.map(options, function(val) {
                return val.toString();
              });
            }
            return options;
          }

          $scope.$apply(function() {
            $scope.handleEvent({ $event: { name: 'get-param-options', param: param } }).then(function(result) {
              var dynamicOptions = _.map(result, function(op) {
                return op.value;
              });

              // add current value to dropdown if its not in dynamicOptions
              if (_.indexOf(dynamicOptions, part.params[paramIndex]) === -1) {
                dynamicOptions.unshift(part.params[paramIndex]);
              }

              callback(dynamicOptions);
            });
          });
        };

        $input.attr('data-provide', 'typeahead');

        $input.typeahead({
          source: typeaheadSource,
          minLength: 0,
          items: 1000,
          updater: function(value) {
            setTimeout(function() {
              inputBlur.call($input[0], paramIndex);
            }, 0);
            return value;
          },
        });

        var typeahead = $input.data('typeahead');
        typeahead.lookup = function() {
          this.query = this.$element.val() || '';
          var items = this.source(this.query, $.proxy(this.process, this));
          return items ? this.process(items) : items;
        };

        if (debounceLookup) {
          typeahead.lookup = _.debounce(typeahead.lookup, 500, { leading: true });
        }
      }

      $scope.showActionsMenu = function() {
        $scope.handleEvent({ $event: { name: 'get-part-actions' } }).then(res => {
          $scope.partActions = res;
        });
      };

      $scope.triggerPartAction = function(action) {
        $scope.handleEvent({ $event: { name: 'action', action: action } });
      };

      function addElementsAndCompile() {
        _.each(partDef.params, function(param, index) {
          if (param.optional && part.params.length <= index) {
            return;
          }

          if (index > 0) {
            $('<span>' + partDef.separator + '</span>').appendTo($paramsContainer);
          }

          var paramValue = templateSrv.highlightVariablesAsHtml(part.params[index]);
          var $paramLink = $('<a class="graphite-func-param-link pointer">' + paramValue + '</a>');
          var $input = $(paramTemplate);

          $paramLink.appendTo($paramsContainer);
          $input.appendTo($paramsContainer);

          $input.blur(_.partial(inputBlur, index));
          $input.keyup(inputKeyDown);
          $input.keypress(_.partial(inputKeyPress, index));
          $paramLink.click(_.partial(clickFuncParam, index));

          addTypeahead($input, param, index);
        });
      }

      function relink() {
        $paramsContainer.empty();
        addElementsAndCompile();
      }

      relink();
    },
  };
}

coreModule.directive('sqlPartEditor', sqlPartEditorDirective);
