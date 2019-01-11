import React, { PureComponent } from 'react';
import { BasicGaugeColor, GaugeOptions, PanelOptionsProps, ThresholdsEditor } from '@grafana/ui';

import ValueOptions from 'app/plugins/panel/gauge/ValueOptions';
import ValueMappings from 'app/plugins/panel/gauge/ValueMappings';
import GaugeOptionsEditor from './GaugeOptionsEditor';

export const defaultProps = {
  options: {
    baseColor: BasicGaugeColor.Green,
    minValue: 0,
    maxValue: 100,
    prefix: '',
    showThresholdMarkers: true,
    showThresholdLabels: false,
    suffix: '',
    decimals: 0,
    stat: 'avg',
    unit: 'none',
    mappings: [],
    thresholds: [],
  },
};

export default class GaugePanelOptions extends PureComponent<PanelOptionsProps<GaugeOptions>> {
  static defaultProps = defaultProps;

  render() {
    const { onChange, options } = this.props;
    return (
      <>
        <div className="form-section">
          <ValueOptions onChange={onChange} options={options} />
          <GaugeOptionsEditor onChange={onChange} options={options} />
          <ThresholdsEditor onChange={onChange} options={options} />
        </div>

        <div className="form-section">
          <ValueMappings onChange={onChange} options={options} />
        </div>
      </>
    );
  }
}
