import '../query_ctrl';
import 'app/core/services/segment_srv';
// import { describe, beforeEach, it, sinon, expect, angularMocks } from 'test/lib/common';
// import helpers from 'test/specs/helpers';
import { InfluxQueryCtrl } from '../query_ctrl';

describe('InfluxDBQueryCtrl', function() {
  let uiSegmentSrv = {
    newPlusButton: () => {},
  };

  let ctx = <any>{
    dataSource: {
      metricFindQuery: jest.fn(() => Promise.resolve([])),
    },
  };

  InfluxQueryCtrl.prototype.panelCtrl = {
    target: { target: {} },
    panel: {
      targets: [this.target],
    },
  };

  //   beforeEach(angularMocks.module('grafana.core'));
  //   beforeEach(angularMocks.module('grafana.controllers'));
  //   beforeEach(angularMocks.module('grafana.services'));
  //   beforeEach(
  //     angularMocks.module(function($compileProvider) {
  //       $compileProvider.preAssignBindingsEnabled(true);
  //     })
  //   );
  //   beforeEach(ctx.providePhase());

  //   beforeEach(
  //     angularMocks.inject(($rootScope, $controller, $q) => {
  //       ctx.$q = $q;
  //       ctx.scope = $rootScope.$new();
  //       ctx.datasource.metricFindQuery = sinon.stub().returns(ctx.$q.when([]));
  //       ctx.target = { target: {} };
  //       ctx.panelCtrl = {
  //         panel: {
  //           targets: [ctx.target],
  //         },
  //       };
  //       ctx.panelCtrl.refresh = sinon.spy();
  //       ctx.ctrl = $controller(
  //         InfluxQueryCtrl,
  //         { $scope: ctx.scope },
  //         {
  //           panelCtrl: ctx.panelCtrl,
  //           target: ctx.target,
  //           datasource: ctx.datasource,
  //         }
  //       );
  //     })
  //   );

  beforeEach(() => {
    ctx.ctrl = new InfluxQueryCtrl({}, {}, {}, {}, uiSegmentSrv);
  });

  describe('init', function() {
    it('should init tagSegments', function() {
      expect(ctx.ctrl.tagSegments.length).toBe(1);
    });

    it('should init measurementSegment', function() {
      expect(ctx.ctrl.measurementSegment.value).toBe('select measurement');
    });
  });

  describe('when first tag segment is updated', function() {
    beforeEach(function() {
      ctx.ctrl.tagSegmentUpdated({ value: 'asd', type: 'plus-button' }, 0);
    });

    it('should update tag key', function() {
      expect(ctx.ctrl.target.tags[0].key).toBe('asd');
      expect(ctx.ctrl.tagSegments[0].type).toBe('key');
    });

    it('should add tagSegments', function() {
      expect(ctx.ctrl.tagSegments.length).toBe(3);
    });
  });

  describe('when last tag value segment is updated', function() {
    beforeEach(function() {
      ctx.ctrl.tagSegmentUpdated({ value: 'asd', type: 'plus-button' }, 0);
      ctx.ctrl.tagSegmentUpdated({ value: 'server1', type: 'value' }, 2);
    });

    it('should update tag value', function() {
      expect(ctx.ctrl.target.tags[0].value).toBe('server1');
    });

    it('should set tag operator', function() {
      expect(ctx.ctrl.target.tags[0].operator).toBe('=');
    });

    it('should add plus button for another filter', function() {
      expect(ctx.ctrl.tagSegments[3].fake).toBe(true);
    });
  });

  describe('when last tag value segment is updated to regex', function() {
    beforeEach(function() {
      ctx.ctrl.tagSegmentUpdated({ value: 'asd', type: 'plus-button' }, 0);
      ctx.ctrl.tagSegmentUpdated({ value: '/server.*/', type: 'value' }, 2);
    });

    it('should update operator', function() {
      expect(ctx.ctrl.tagSegments[1].value).toBe('=~');
      expect(ctx.ctrl.target.tags[0].operator).toBe('=~');
    });
  });

  describe('when second tag key is added', function() {
    beforeEach(function() {
      ctx.ctrl.tagSegmentUpdated({ value: 'asd', type: 'plus-button' }, 0);
      ctx.ctrl.tagSegmentUpdated({ value: 'server1', type: 'value' }, 2);
      ctx.ctrl.tagSegmentUpdated({ value: 'key2', type: 'plus-button' }, 3);
    });

    it('should update tag key', function() {
      expect(ctx.ctrl.target.tags[1].key).toBe('key2');
    });

    it('should add AND segment', function() {
      expect(ctx.ctrl.tagSegments[3].value).toBe('AND');
    });
  });

  describe('when condition is changed', function() {
    beforeEach(function() {
      ctx.ctrl.tagSegmentUpdated({ value: 'asd', type: 'plus-button' }, 0);
      ctx.ctrl.tagSegmentUpdated({ value: 'server1', type: 'value' }, 2);
      ctx.ctrl.tagSegmentUpdated({ value: 'key2', type: 'plus-button' }, 3);
      ctx.ctrl.tagSegmentUpdated({ value: 'OR', type: 'condition' }, 3);
    });

    it('should update tag condition', function() {
      expect(ctx.ctrl.target.tags[1].condition).toBe('OR');
    });

    it('should update AND segment', function() {
      expect(ctx.ctrl.tagSegments[3].value).toBe('OR');
      expect(ctx.ctrl.tagSegments.length).toBe(7);
    });
  });

  describe('when deleting first tag filter after value is selected', function() {
    beforeEach(function() {
      ctx.ctrl.tagSegmentUpdated({ value: 'asd', type: 'plus-button' }, 0);
      ctx.ctrl.tagSegmentUpdated({ value: 'server1', type: 'value' }, 2);
      ctx.ctrl.tagSegmentUpdated(ctx.ctrl.removeTagFilterSegment, 0);
    });

    it('should remove tags', function() {
      expect(ctx.ctrl.target.tags.length).toBe(0);
    });

    it('should remove all segment after 2 and replace with plus button', function() {
      expect(ctx.ctrl.tagSegments.length).toBe(1);
      expect(ctx.ctrl.tagSegments[0].type).toBe('plus-button');
    });
  });

  describe('when deleting second tag value before second tag value is complete', function() {
    beforeEach(function() {
      ctx.ctrl.tagSegmentUpdated({ value: 'asd', type: 'plus-button' }, 0);
      ctx.ctrl.tagSegmentUpdated({ value: 'server1', type: 'value' }, 2);
      ctx.ctrl.tagSegmentUpdated({ value: 'key2', type: 'plus-button' }, 3);
      ctx.ctrl.tagSegmentUpdated(ctx.ctrl.removeTagFilterSegment, 4);
    });

    it('should remove all segment after 2 and replace with plus button', function() {
      expect(ctx.ctrl.tagSegments.length).toBe(4);
      expect(ctx.ctrl.tagSegments[3].type).toBe('plus-button');
    });
  });

  describe('when deleting second tag value before second tag value is complete', function() {
    beforeEach(function() {
      ctx.ctrl.tagSegmentUpdated({ value: 'asd', type: 'plus-button' }, 0);
      ctx.ctrl.tagSegmentUpdated({ value: 'server1', type: 'value' }, 2);
      ctx.ctrl.tagSegmentUpdated({ value: 'key2', type: 'plus-button' }, 3);
      ctx.ctrl.tagSegmentUpdated(ctx.ctrl.removeTagFilterSegment, 4);
    });

    it('should remove all segment after 2 and replace with plus button', function() {
      expect(ctx.ctrl.tagSegments.length).toBe(4);
      expect(ctx.ctrl.tagSegments[3].type).toBe('plus-button');
    });
  });

  describe('when deleting second tag value after second tag filter is complete', function() {
    beforeEach(function() {
      ctx.ctrl.tagSegmentUpdated({ value: 'asd', type: 'plus-button' }, 0);
      ctx.ctrl.tagSegmentUpdated({ value: 'server1', type: 'value' }, 2);
      ctx.ctrl.tagSegmentUpdated({ value: 'key2', type: 'plus-button' }, 3);
      ctx.ctrl.tagSegmentUpdated({ value: 'value', type: 'value' }, 6);
      ctx.ctrl.tagSegmentUpdated(ctx.ctrl.removeTagFilterSegment, 4);
    });

    it('should remove all segment after 2 and replace with plus button', function() {
      expect(ctx.ctrl.tagSegments.length).toBe(4);
      expect(ctx.ctrl.tagSegments[3].type).toBe('plus-button');
    });
  });
});
