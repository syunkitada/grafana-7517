// Libraries
import React, { Component } from 'react';

// Services & Utils
import { processTimeSeries, ThemeContext } from '@grafana/ui';

// Components
import { Gauge } from '@grafana/ui';

// Types
import { GaugeOptions } from './types';
import { PanelProps, NullValueMode, BasicGaugeColor, DisplayValue, getDisplayProcessor } from '@grafana/ui';

interface Props extends PanelProps<GaugeOptions> {}
interface State {
  value: DisplayValue;
}

export class GaugePanel extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    if (props.options.valueOptions) {
      console.warn('TODO!! how do we best migration options?');
    }

    this.state = {
      value: this.findDisplayValue(props),
    };
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.panelData !== prevProps.panelData) {
      this.setState({ value: this.findDisplayValue(this.props) });
    }
  }

  findDisplayValue(props: Props): DisplayValue {
    const { replaceVariables, options } = this.props;
    const { display } = options;

    const prefix = replaceVariables(display.prefix);
    const suffix = replaceVariables(display.suffix);
    return getDisplayProcessor({
      color: BasicGaugeColor.Red, // The default color
      ...display,
      prefix,
      suffix,
      // ??? theme:getTheme(GrafanaThemeType.Dark), !! how do I get it here???
    })(this.findValue(props));
  }

  findValue(props: Props): number | null {
    const { panelData, options } = props;

    if (panelData.timeSeries) {
      const vmSeries = processTimeSeries({
        timeSeries: panelData.timeSeries,
        nullValueMode: NullValueMode.Null,
      });

      if (vmSeries[0]) {
        return vmSeries[0].stats[options.stat];
      }
    } else if (panelData.tableData) {
      return panelData.tableData.rows[0].find(prop => prop > 0);
    }
    return null;
  }

  render() {
    const { width, height, options } = this.props;
    const { value } = this.state;
    const { display } = options;

    return (
      <ThemeContext.Consumer>
        {theme => (
          <Gauge
            value={value}
            width={width}
            height={height}
            thresholds={display.thresholds}
            showThresholdLabels={options.showThresholdLabels}
            showThresholdMarkers={options.showThresholdMarkers}
            minValue={options.minValue}
            maxValue={options.maxValue}
            theme={theme}
          />
        )}
      </ThemeContext.Consumer>
    );
  }
}
