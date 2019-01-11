import React from 'react';
import { shallow } from 'enzyme';
import { BasicGaugeColor, TimeSeriesVMs } from '@grafana/ui';

import { Gauge, Props } from './Gauge';

jest.mock('jquery', () => ({
  plot: jest.fn(),
}));

const setup = (propOverrides?: object) => {
  const props: Props = {
    baseColor: BasicGaugeColor.Green,
    maxValue: 100,
    mappings: [],
    minValue: 0,
    prefix: '',
    showThresholdMarkers: true,
    showThresholdLabels: false,
    suffix: '',
    thresholds: [],
    unit: 'none',
    stat: 'avg',
    height: 300,
    width: 300,
    timeSeries: {} as TimeSeriesVMs,
    decimals: 0,
  };

  Object.assign(props, propOverrides);

  const wrapper = shallow(<Gauge {...props} />);
  const instance = wrapper.instance() as Gauge;

  return {
    instance,
    wrapper,
  };
};

describe('Get font color', () => {
  it('should get base color if no threshold', () => {
    const { instance } = setup();

    expect(instance.getFontColor(40)).toEqual(BasicGaugeColor.Green);
  });

  it('should be f2f2f2', () => {
    const { instance } = setup({
      thresholds: [{ value: 59, color: '#f2f2f2' }],
    });

    expect(instance.getFontColor(58)).toEqual('#f2f2f2');
  });
});
