///<reference path="../../../../headers/common.d.ts" />

import {describe, beforeEach, it, sinon, expect, angularMocks} from '../../../../../test/lib/common';

import 'app/features/panel/panel_srv';
import 'app/features/panel/panel_helper';

import angular from 'angular';
import helpers from '../../../../../test/specs/helpers';
import {SingleStatCtrl} from '../controller';


angular.module('grafana.controllers').controller('SingleStatCtrl', SingleStatCtrl);

describe('SingleStatCtrl', function() {
  var ctx = new helpers.ControllerTestContext();

  function singleStatScenario(desc, func) {

    describe(desc, function() {

      ctx.setup = function (setupFunc) {

        beforeEach(angularMocks.module('grafana.services'));
        beforeEach(angularMocks.module('grafana.controllers'));

        beforeEach(ctx.providePhase());
        beforeEach(ctx.createControllerPhase('SingleStatCtrl'));

        beforeEach(function() {
          setupFunc();
          ctx.datasource.query = sinon.stub().returns(ctx.$q.when({
            data: [{target: 'test.cpu1', datapoints: ctx.datapoints}]
          }));

          ctx.scope.refreshData(ctx.datasource);
          ctx.scope.$digest();
          ctx.data = ctx.scope.data;
        });
      };

      func(ctx);
    });
  }

  singleStatScenario('with defaults', function(ctx) {
    ctx.setup(function() {
      ctx.datapoints = [[10,1], [20,2]];
    });

    it('Should use series avg as default main value', function() {
      expect(ctx.data.value).to.be(15);
      expect(ctx.data.valueRounded).to.be(15);
    });

    it('should set formated falue', function() {
      expect(ctx.data.valueFormated).to.be('15');
    });
  });

  singleStatScenario('MainValue should use same number for decimals as displayed when checking thresholds', function(ctx) {
    ctx.setup(function() {
      ctx.datapoints = [[99.999,1], [99.99999,2]];
    });

    it('Should be rounded', function() {
      expect(ctx.data.value).to.be(99.999495);
      expect(ctx.data.valueRounded).to.be(100);
    });

    it('should set formated falue', function() {
      expect(ctx.data.valueFormated).to.be('100');
    });
  });

  singleStatScenario('When value to text mapping is specified', function(ctx) {
    ctx.setup(function() {
      ctx.datapoints = [[10,1]];
      ctx.scope.panel.valueMaps = [{value: '10', text: 'OK'}];
    });

    it('Should replace value with text', function() {
      expect(ctx.data.value).to.be(10);
      expect(ctx.data.valueFormated).to.be('OK');
    });

  });
});
