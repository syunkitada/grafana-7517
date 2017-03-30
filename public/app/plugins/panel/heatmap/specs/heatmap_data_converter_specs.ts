///<reference path="../../../../headers/common.d.ts" />

import _ from 'lodash';
import { describe, beforeEach, it, sinon, expect, angularMocks } from '../../../../../test/lib/common';
import TimeSeries from 'app/core/time_series2';
import { convertToHeatMap, elasticHistogramToHeatmap, isHeatmapDataEqual } from '../heatmap_data_converter';

describe('isHeatmapDataEqual', () => {
  let ctx: any = {};

  beforeEach(() => {
    ctx.heatmapA = {
      '1422774000000': {
        x: 1422774000000,
        buckets: {
          '1': { y: 1, values: [1, 1.5] },
          '2': { y: 2, values: [1] }
        }
      }
    };

    ctx.heatmapB = {
      '1422774000000': {
        x: 1422774000000,
        buckets: {
          '1': { y: 1, values: [1.5, 1] },
          '2': { y: 2, values: [1] }
        }
      }
    };
  });

  it('should proper compare objects', () => {
    let heatmapC = _.cloneDeep(ctx.heatmapA);
    heatmapC['1422774000000'].buckets['1'].values = [1, 1.5];

    let heatmapD = _.cloneDeep(ctx.heatmapA);
    heatmapD['1422774000000'].buckets['1'].values = [1.5, 1, 1.6];

    let heatmapE = _.cloneDeep(ctx.heatmapA);
    heatmapE['1422774000000'].buckets['1'].values = [1, 1.6];

    let empty = {};
    let emptyValues = _.cloneDeep(ctx.heatmapA);
    emptyValues['1422774000000'].buckets['1'].values = [];

    expect(isHeatmapDataEqual(ctx.heatmapA, ctx.heatmapB)).to.be(true);
    expect(isHeatmapDataEqual(ctx.heatmapB, ctx.heatmapA)).to.be(true);

    expect(isHeatmapDataEqual(ctx.heatmapA, heatmapC)).to.be(true);
    expect(isHeatmapDataEqual(heatmapC, ctx.heatmapA)).to.be(true);

    expect(isHeatmapDataEqual(ctx.heatmapA, heatmapD)).to.be(false);
    expect(isHeatmapDataEqual(heatmapD, ctx.heatmapA)).to.be(false);

    expect(isHeatmapDataEqual(ctx.heatmapA, heatmapE)).to.be(false);
    expect(isHeatmapDataEqual(heatmapE, ctx.heatmapA)).to.be(false);

    expect(isHeatmapDataEqual(empty, ctx.heatmapA)).to.be(false);
    expect(isHeatmapDataEqual(ctx.heatmapA, empty)).to.be(false);

    expect(isHeatmapDataEqual(emptyValues, ctx.heatmapA)).to.be(false);
    expect(isHeatmapDataEqual(ctx.heatmapA, emptyValues)).to.be(false);
  });
});

describe('HeatmapDataConverter', () => {
  let ctx: any = {};

  beforeEach(() => {
    ctx.series = [];
    ctx.series.push(new TimeSeries({
      datapoints: [[1, 1422774000000], [2, 1422774060000]],
      alias: 'series1'
    }));
    ctx.series.push(new TimeSeries({
      datapoints: [[2, 1422774000000], [3, 1422774060000]],
      alias: 'series2'
    }));

    ctx.xBucketSize = 60000; // 60s
    ctx.yBucketSize = 1;
    ctx.logBase = 1;
  });

  describe('when logBase is 1 (linear scale)', () => {

    beforeEach(() => {
      ctx.logBase = 1;
    });

    it('should build proper heatmap data', () => {
      let expectedHeatmap = {
        '1422774000000': {
          x: 1422774000000,
          buckets: {
            '1': { y: 1, values: [1] },
            '2': { y: 2, values: [2] }
          }
        },
        '1422774060000': {
          x: 1422774060000,
          buckets: {
            '2': { y: 2, values: [2] },
            '3': { y: 3, values: [3] }
          }
        },
      };

      let heatmap = convertToHeatMap(ctx.series, ctx.yBucketSize, ctx.xBucketSize, ctx.logBase);
      expect(isHeatmapDataEqual(heatmap, expectedHeatmap)).to.be(true);
    });
  });

  describe('when logBase is 2', () => {

    beforeEach(() => {
      ctx.logBase = 2;
    });

    it('should build proper heatmap data', () => {
      let expectedHeatmap = {
        '1422774000000': {
          x: 1422774000000,
          buckets: {
            '1': { y: 1, values: [1] },
            '2': { y: 2, values: [2] }
          }
        },
        '1422774060000': {
          x: 1422774060000,
          buckets: {
            '2': { y: 2, values: [2, 3] }
          }
        },
      };

      let heatmap = convertToHeatMap(ctx.series, ctx.yBucketSize, ctx.xBucketSize, ctx.logBase);
      expect(isHeatmapDataEqual(heatmap, expectedHeatmap)).to.be(true);
    });
  });
});

describe('ES Histogram converter', () => {
  let ctx: any = {};

  beforeEach(() => {
    ctx.series = [];
    ctx.series.push(new TimeSeries({
      datapoints: [[1, 1422774000000], [0, 1422774060000]],
      alias: '1', label: '1'
    }));
    ctx.series.push(new TimeSeries({
      datapoints: [[1, 1422774000000], [3, 1422774060000]],
      alias: '2', label: '2'
    }));
    ctx.series.push(new TimeSeries({
      datapoints: [[0, 1422774000000], [1, 1422774060000]],
      alias: '3', label: '3'
    }));
  });

  describe('when converting ES histogram', () => {

    beforeEach(() => {
    });

    it('should build proper heatmap data', () => {
      let expectedHeatmap = {
        '1422774000000': {
          x: 1422774000000,
          buckets: {
            '1': { y: 1, values: [1] },
            '2': { y: 2, values: [2] }
          }
        },
        '1422774060000': {
          x: 1422774060000,
          buckets: {
            '2': { y: 2, values: [2, 2, 2] },
            '3': { y: 3, values: [3] }
          }
        },
      };

      let heatmap = elasticHistogramToHeatmap(ctx.series);
      console.log(heatmap);
      expect(isHeatmapDataEqual(heatmap, expectedHeatmap)).to.be(true);
    });
  });
});

