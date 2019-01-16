import React, { PureComponent } from 'react';
import { PanelOptionsProps, PanelOptionsGroup, Label, Select } from '@grafana/ui';

import UnitPicker from 'app/core/components/Select/UnitPicker';
import { GaugeOptions } from './types';

const statOptions = [
  { value: 'min', label: 'Min' },
  { value: 'max', label: 'Max' },
  { value: 'avg', label: 'Average' },
  { value: 'current', label: 'Current' },
  { value: 'total', label: 'Total' },
  { value: 'name', label: 'Name' },
  { value: 'first', label: 'First' },
  { value: 'delta', label: 'Delta' },
  { value: 'diff', label: 'Difference' },
  { value: 'range', label: 'Range' },
  { value: 'last_time', label: 'Time of last point' },
];

const labelWidth = 6;

export default class ValueOptions extends PureComponent<PanelOptionsProps<GaugeOptions>> {
  onUnitChange = unit => this.props.onChange({ ...this.props.options, unit: unit.value });

  onStatChange = stat => this.props.onChange({ ...this.props.options, stat: stat.value });

  onDecimalChange = event => {
    if (!isNaN(event.target.value)) {
      this.props.onChange({ ...this.props.options, decimals: event.target.value });
    }
  };

  onPrefixChange = event => this.props.onChange({ ...this.props.options, prefix: event.target.value });

  onSuffixChange = event => this.props.onChange({ ...this.props.options, suffix: event.target.value });

  render() {
    const { stat, unit, decimals, prefix, suffix } = this.props.options;

    return (
      <PanelOptionsGroup title="Value">
        <div className="gf-form">
          <Label width={labelWidth}>Stat</Label>
          <Select
            width={12}
            options={statOptions}
            onChange={this.onStatChange}
            value={statOptions.find(option => option.value === stat)}
          />
        </div>
        <div className="gf-form">
          <Label width={labelWidth}>Unit</Label>
          <UnitPicker defaultValue={unit} onChange={this.onUnitChange} />
        </div>
        <div className="gf-form">
          <Label width={labelWidth}>Decimals</Label>
          <input
            className="gf-form-input width-12"
            type="number"
            placeholder="auto"
            value={decimals || ''}
            onChange={this.onDecimalChange}
          />
        </div>
        <div className="gf-form">
          <Label width={labelWidth}>Prefix</Label>
          <input className="gf-form-input width-12" type="text" value={prefix || ''} onChange={this.onPrefixChange} />
        </div>
        <div className="gf-form">
          <Label width={labelWidth}>Suffix</Label>
          <input className="gf-form-input width-12" type="text" value={suffix || ''} onChange={this.onSuffixChange} />
        </div>
      </PanelOptionsGroup>
    );
  }
}
