///<reference path="../../headers/common.d.ts" />

import angular from 'angular';
import coreModule from '../core_module';

class DynamicDirectiveSrv {

  /** @ngInject */
  constructor(private $compile, private $parse, private $rootScope) {}

  addDirective(element, name, scope) {
    var child = angular.element(document.createElement(name));
    this.$compile(child)(scope);

    element.empty();
    element.append(child);
  }

  link(scope, elem, attrs, options) {
    options.directive(scope).then(directiveInfo => {
      if (!directiveInfo || !directiveInfo.fn) {
        elem.empty();
        return;
      }

      if (!directiveInfo.fn.registered) {
        coreModule.directive(attrs.$normalize(directiveInfo.name), directiveInfo.fn);
        directiveInfo.fn.registered = true;
      }

      this.addDirective(elem, directiveInfo.name, scope);
    }).catch(err => {
      console.log('Plugin load:', err);
      this.$rootScope.appEvent('alert-error', ['Plugin error', err.toString()]);
    });
  }

  create(options) {
    let directiveDef = {
      restrict: 'E',
      scope: options.scope,
      link: (scope, elem, attrs) => {
        if (options.watch) {
          scope.$watch(options.watch,() => this.link(scope, elem, attrs, options));
        } else {
          this.link(scope, elem, attrs, options);
        }
      }
    };

    return directiveDef;
  }
}

coreModule.service('dynamicDirectiveSrv', DynamicDirectiveSrv);


