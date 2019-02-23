// Libraries
import React, { PureComponent } from 'react';

// Services & Utils
import { processSingleStatPanelData } from '@grafana/ui';
import { config } from 'app/core/config';

// Components
import { BarGauge, VizRepeater } from '@grafana/ui';

// Types
import { BarGaugeOptions } from './types';
import { PanelProps } from '@grafana/ui/src/types';

interface Props extends PanelProps<BarGaugeOptions> {}

export class BarGaugePanel extends PureComponent<Props> {
  renderBarGauge(value, width, height) {
    const { onInterpolate, options } = this.props;
    const { valueOptions } = options;
    const prefix = onInterpolate(valueOptions.prefix);
    const suffix = onInterpolate(valueOptions.suffix);

    return (
      <BarGauge
        value={value}
        width={width}
        height={height}
        prefix={prefix}
        suffix={suffix}
        orientation={options.orientation}
        unit={valueOptions.unit}
        decimals={valueOptions.decimals}
        thresholds={options.thresholds}
        valueMappings={options.valueMappings}
        theme={config.theme}
      />
    );
  }

  render() {
    const { panelData, options, width, height } = this.props;

    const values = processSingleStatPanelData({
      panelData: panelData,
      stat: options.valueOptions.stat,
    });

    return (
      <VizRepeater height={height} width={width} values={values} orientation={options.orientation}>
        {({ vizHeight, vizWidth, valueInfo }) => this.renderBarGauge(valueInfo.value, vizWidth, vizHeight)}
      </VizRepeater>
    );
  }
}
