define([
    'panels/overview/module'
], function() {
  'use strict';

  describe('OverviewCtrl', function() {
    var _controller;
    var _scope;
    var _datasource;

    beforeEach(module('grafana.services'));
    beforeEach(module('grafana.panels.overview'));

    beforeEach(module(function($provide){
      $provide.value('datasourceSrv',{
        getMetricSources: function() {
        },
        get: function() {
          return _datasource;
        }
      });
    }));

    beforeEach(inject(function($controller, $rootScope, $q) {
      _scope = $rootScope.$new();
      _scope.panel = { targets: [] };
      _scope.filter = {
        timeRange: function() { }
      };
      _scope.datasource = {
        query: function() {
          return $q.resolve('hej');
        }
      };
      _controller = $controller('OverviewCtrl', {
        $scope: _scope
      });
    }));

    describe('init', function() {
      beforeEach(function() {
      });

      it('description', function() {

      });
    });
  });
});
