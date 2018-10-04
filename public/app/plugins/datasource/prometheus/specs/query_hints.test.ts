import { getQueryHints } from '../query_hints';

describe('getQueryHints()', () => {
  it('returns no hints for no series', () => {
    expect(getQueryHints([])).toEqual([]);
  });

  it('returns no hints for empty series', () => {
    expect(getQueryHints([{ datapoints: [], query: '' }])).toEqual([null]);
  });

  it('returns no hint for a monotonously decreasing series', () => {
    const series = [{ datapoints: [[23, 1000], [22, 1001]], query: 'metric', responseIndex: 0 }];
    const hints = getQueryHints(series);
    expect(hints).toEqual([null]);
  });

  it('returns no hint for a flat series', () => {
    const series = [
      { datapoints: [[null, 1000], [23, 1001], [null, 1002], [23, 1003]], query: 'metric', responseIndex: 0 },
    ];
    const hints = getQueryHints(series);
    expect(hints).toEqual([null]);
  });

  it('returns a rate hint for a monotonously increasing series', () => {
    const series = [{ datapoints: [[23, 1000], [24, 1001]], query: 'metric', responseIndex: 0 }];
    const hints = getQueryHints(series);
    expect(hints.length).toBe(1);
    expect(hints[0]).toMatchObject({
      label: 'Time series is monotonously increasing.',
      index: 0,
      fix: {
        action: {
          type: 'ADD_RATE',
          query: 'metric',
        },
      },
    });
  });

  it('returns no rate hint for a monotonously increasing series that already has a rate', () => {
    const series = [{ datapoints: [[23, 1000], [24, 1001]], query: 'rate(metric[1m])', responseIndex: 0 }];
    const hints = getQueryHints(series);
    expect(hints).toEqual([null]);
  });

  it('returns a rate hint w/o action for a complex monotonously increasing series', () => {
    const series = [{ datapoints: [[23, 1000], [24, 1001]], query: 'sum(metric)', responseIndex: 0 }];
    const hints = getQueryHints(series);
    expect(hints.length).toBe(1);
    expect(hints[0].label).toContain('rate()');
    expect(hints[0].fix).toBeUndefined();
  });

  it('returns a rate hint for a monotonously increasing series with missing data', () => {
    const series = [{ datapoints: [[23, 1000], [null, 1001], [24, 1002]], query: 'metric', responseIndex: 0 }];
    const hints = getQueryHints(series);
    expect(hints.length).toBe(1);
    expect(hints[0]).toMatchObject({
      label: 'Time series is monotonously increasing.',
      index: 0,
      fix: {
        action: {
          type: 'ADD_RATE',
          query: 'metric',
        },
      },
    });
  });

  it('returns a histogram hint for a bucket series', () => {
    const series = [{ datapoints: [[23, 1000]], query: 'metric_bucket', responseIndex: 0 }];
    const hints = getQueryHints(series);
    expect(hints.length).toBe(1);
    expect(hints[0]).toMatchObject({
      label: 'Time series has buckets, you probably wanted a histogram.',
      index: 0,
      fix: {
        action: {
          type: 'ADD_HISTOGRAM_QUANTILE',
          query: 'metric_bucket',
        },
      },
    });
  });
});
