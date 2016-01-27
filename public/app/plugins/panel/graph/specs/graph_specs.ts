///<reference path="../../../../headers/common.d.ts" />

import {describe, beforeEach, it, sinon, expect, angularMocks} from '../../../../../test/lib/common';

import '../module';
import angular from 'angular';
import $ from 'jquery';
import helpers from '../../../../../test/specs/helpers';
import TimeSeries from '../../../../core/time_series2';

describe('grafanaGraph', function() {

  beforeEach(angularMocks.module('grafana.directives'));

  function graphScenario(desc, func)  {
    describe(desc, function() {
      var ctx: any = {};

      ctx.setup = function(setupFunc) {

        beforeEach(angularMocks.module(function($provide) {
          $provide.value("timeSrv", new helpers.TimeSrvStub());
        }));

        beforeEach(angularMocks.inject(function($rootScope, $compile) {
          var ctrl: any = {};
          var scope = $rootScope.$new();
          scope.ctrl = ctrl;
          var element = angular.element("<div style='width:500px' grafana-graph><div>");

          ctrl.height = '200px';
          ctrl.panel = {
            legend: {},
            grid: { },
            y_formats: [],
            seriesOverrides: [],
            tooltip: {
              shared: true
            }
          };

          $rootScope.onAppEvent = sinon.spy();
          ctrl.otherPanelInFullscreenMode = sinon.spy();
          ctrl.renderingCompleted = sinon.spy();
          ctrl.hiddenSeries = {};
          ctrl.dashboard = { timezone: 'browser' };
          ctrl.range = {
            from: new Date('2014-08-09 10:00:00'),
            to: new Date('2014-09-09 13:00:00')
          };
          ctx.data = [];
          ctx.data.push(new TimeSeries({
            datapoints: [[1,1],[2,2]],
            alias: 'series1'
          }));
          ctx.data.push(new TimeSeries({
            datapoints: [[1,1],[2,2]],
            alias: 'series2'
          }));

          setupFunc(ctrl, ctx.data);

          $compile(element)(scope);
          scope.$digest();
          $.plot = ctx.plotSpy = sinon.spy();

          scope.$emit('render', ctx.data);
          ctx.plotData = ctx.plotSpy.getCall(0).args[1];
          ctx.plotOptions = ctx.plotSpy.getCall(0).args[2];
        }));
      };

      func(ctx);
    });
  }

  graphScenario('simple lines options', function(ctx) {
    ctx.setup(function(ctrl) {
      ctrl.panel.lines = true;
      ctrl.panel.fill = 5;
      ctrl.panel.linewidth = 3;
      ctrl.panel.steppedLine = true;
    });

    it('should configure plot with correct options', function() {
      expect(ctx.plotOptions.series.lines.show).to.be(true);
      expect(ctx.plotOptions.series.lines.fill).to.be(0.5);
      expect(ctx.plotOptions.series.lines.lineWidth).to.be(3);
      expect(ctx.plotOptions.series.lines.steps).to.be(true);
    });
  });

  graphScenario('grid thresholds 100, 200', function(ctx) {
    ctx.setup(function(ctrl) {
      ctrl.panel.grid = {
        threshold1: 100,
        threshold1Color: "#111",
        threshold2: 200,
        threshold2Color: "#222",
      };
    });

    it('should add grid markings', function() {
      var markings = ctx.plotOptions.grid.markings;
      expect(markings[0].yaxis.from).to.be(100);
      expect(markings[0].yaxis.to).to.be(200);
      expect(markings[0].color).to.be('#111');
      expect(markings[1].yaxis.from).to.be(200);
      expect(markings[1].yaxis.to).to.be(Infinity);
    });
  });

  graphScenario('inverted grid thresholds 200, 100', function(ctx) {
    ctx.setup(function(ctrl) {
      ctrl.panel.grid = {
        threshold1: 200,
        threshold1Color: "#111",
        threshold2: 100,
        threshold2Color: "#222",
      };
    });

    it('should add grid markings', function() {
      var markings = ctx.plotOptions.grid.markings;
      expect(markings[0].yaxis.from).to.be(200);
      expect(markings[0].yaxis.to).to.be(100);
      expect(markings[0].color).to.be('#111');
      expect(markings[1].yaxis.from).to.be(100);
      expect(markings[1].yaxis.to).to.be(-Infinity);
    });
  });

  graphScenario('grid thresholds from zero', function(ctx) {
    ctx.setup(function(ctrl) {
      ctrl.panel.grid = {
        threshold1: 0,
        threshold1Color: "#111",
      };
    });

    it('should add grid markings', function() {
      var markings = ctx.plotOptions.grid.markings;
      expect(markings[0].yaxis.from).to.be(0);
    });
  });

  graphScenario('when logBase is log 10', function(ctx) {
    ctx.setup(function(ctrl) {
      ctrl.panel.grid = {
        leftMax: null,
        rightMax: null,
        leftMin: null,
        rightMin: null,
        leftLogBase: 10,
      };
    });

    it('should apply axis transform and ticks', function() {
      var axis = ctx.plotOptions.yaxes[0];
      expect(axis.transform(100)).to.be(Math.log(100+0.1));
      expect(axis.ticks[0]).to.be(0);
      expect(axis.ticks[1]).to.be(1);
    });
  });

  graphScenario('should use timeStep for barWidth', function(ctx) {
    ctx.setup(function(ctrl, data) {
      ctrl.panel.bars = true;
      data[0] = new TimeSeries({
        datapoints: [[1,10],[2,20]],
        alias: 'series1',
      });
    });

    it('should set barWidth', function() {
      expect(ctx.plotOptions.series.bars.barWidth).to.be(10/1.5);
    });
  });

  graphScenario('series option overrides, fill & points', function(ctx) {
    ctx.setup(function(ctrl, data) {
      ctrl.panel.lines = true;
      ctrl.panel.fill = 5;
      ctrl.panel.seriesOverrides = [
        { alias: 'test', fill: 0, points: true }
      ];

      data[1].alias = 'test';
    });

    it('should match second series and fill zero, and enable points', function() {
      expect(ctx.plotOptions.series.lines.fill).to.be(0.5);
      expect(ctx.plotData[1].lines.fill).to.be(0.001);
      expect(ctx.plotData[1].points.show).to.be(true);
    });
  });

  graphScenario('should order series order according to zindex', function(ctx) {
    ctx.setup(function(ctrl) {
      ctrl.panel.seriesOverrides = [{ alias: 'series1', zindex: 2 }];
    });

    it('should move zindex 2 last', function() {
      expect(ctx.plotData[0].alias).to.be('series2');
      expect(ctx.plotData[1].alias).to.be('series1');
    });
  });

  graphScenario('when series is hidden', function(ctx) {
    ctx.setup(function(ctrl) {
      ctrl.hiddenSeries = {'series2': true};
    });

    it('should remove datapoints and disable stack', function() {
      expect(ctx.plotData[0].alias).to.be('series1');
      expect(ctx.plotData[1].data.length).to.be(0);
      expect(ctx.plotData[1].stack).to.be(false);
    });
  });

  graphScenario('when stack and percent', function(ctx) {
    ctx.setup(function(ctrl) {
      ctrl.panel.percentage = true;
      ctrl.panel.stack = true;
    });

    it('should show percentage', function() {
      var axis = ctx.plotOptions.yaxes[0];
      expect(axis.tickFormatter(100, axis)).to.be("100%");
    });
  });
});
