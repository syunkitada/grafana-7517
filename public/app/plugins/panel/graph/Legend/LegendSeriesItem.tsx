import React from 'react';
import { TimeSeries } from 'app/core/core';
import { SeriesColorPicker } from 'app/core/components/colorpicker/SeriesColorPicker';

export const LEGEND_STATS = ['min', 'max', 'avg', 'current', 'total'];

export interface LegendLabelProps {
  series: TimeSeries;
  asTable?: boolean;
  hidden?: boolean;
  onLabelClick?: (series, event) => void;
  onColorChange?: (series, color: string) => void;
  onToggleAxis?: (series) => void;
}

export interface LegendValuesProps {
  values?: boolean;
  min?: boolean;
  max?: boolean;
  avg?: boolean;
  current?: boolean;
  total?: boolean;
}

type LegendItemProps = LegendLabelProps & LegendValuesProps;

interface LegendItemState {
  yaxis: number;
}

export class LegendItem extends React.PureComponent<LegendItemProps, LegendItemState> {
  static defaultProps = {
    asTable: false,
    hidden: false,
    onLabelClick: () => {},
    onColorChange: () => {},
    onToggleAxis: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      yaxis: this.props.series.yaxis,
    };
  }

  onLabelClick = e => this.props.onLabelClick(this.props.series, e);

  onToggleAxis = () => {
    const yaxis = this.state.yaxis === 2 ? 1 : 2;
    const info = { alias: this.props.series.alias, yaxis: yaxis };
    this.setState({ yaxis: yaxis });
    this.props.onToggleAxis(info);
  };

  onColorChange = color => {
    this.props.onColorChange(this.props.series, color);
    // Because of PureComponent nature it makes only shallow props comparison and changing of series.color doesn't run
    // component re-render. In this case we can't rely on color, selected by user, because it may be overwritten
    // by series overrides. So we need to use forceUpdate() to make sure we have proper series color.
    this.forceUpdate();
  };

  getOptionSeriesCSSClasses() {
    const { series, hidden } = this.props;
    const classes = [];
    if (series.yaxis === 2) {
      classes.push('graph-legend-series--right-y');
    }
    if (hidden) {
      classes.push('graph-legend-series-hidden');
    }
    return classes.join(' ');
  }

  renderLegendValues() {
    const { series, asTable } = this.props;
    const legendValueItems = [];
    for (const valueName of LEGEND_STATS) {
      if (this.props[valueName]) {
        const valueFormatted = series.formatValue(series.stats[valueName]);
        legendValueItems.push(
          <LegendValue key={valueName} valueName={valueName} value={valueFormatted} asTable={asTable} />
        );
      }
    }
    return legendValueItems;
  }

  render() {
    const { series, values, asTable } = this.props;
    const seriesOptionClasses = this.getOptionSeriesCSSClasses();
    const valueItems = values ? this.renderLegendValues() : [];
    const seriesLabel = (
      <LegendSeriesLabel
        label={series.aliasEscaped}
        color={series.color}
        yaxis={this.state.yaxis}
        onLabelClick={this.onLabelClick}
        onColorChange={this.onColorChange}
        onToggleAxis={this.onToggleAxis}
      />
    );

    if (asTable) {
      return (
        <tr className={`graph-legend-series ${seriesOptionClasses}`}>
          <td>{seriesLabel}</td>
          {valueItems}
        </tr>
      );
    } else {
      return (
        <div className={`graph-legend-series ${seriesOptionClasses}`}>
          {seriesLabel}
          {valueItems}
        </div>
      );
    }
  }
}

interface LegendSeriesLabelProps {
  label: string;
  color: string;
  yaxis?: number;
  onLabelClick?: (event) => void;
}

class LegendSeriesLabel extends React.PureComponent<LegendSeriesLabelProps & LegendSeriesIconProps> {
  static defaultProps = {
    yaxis: undefined,
    onLabelClick: () => {},
  };

  render() {
    const { label, color, yaxis } = this.props;
    const { onColorChange, onToggleAxis } = this.props;
    return [
      <LegendSeriesIcon
        key="icon"
        color={color}
        yaxis={yaxis}
        onColorChange={onColorChange}
        onToggleAxis={onToggleAxis}
      />,
      <a className="graph-legend-alias pointer" title={label} key="label" onClick={e => this.props.onLabelClick(e)}>
        {label}
      </a>,
    ];
  }
}

interface LegendSeriesIconProps {
  color: string;
  yaxis?: number;
  onColorChange?: (color: string) => void;
  onToggleAxis?: () => void;
}

interface LegendSeriesIconState {
  color: string;
}

function SeriesIcon(props) {
  return <i className="fa fa-minus pointer" style={{ color: props.color }} />;
}

class LegendSeriesIcon extends React.PureComponent<LegendSeriesIconProps, LegendSeriesIconState> {
  static defaultProps = {
    yaxis: undefined,
    onColorChange: () => {},
    onToggleAxis: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      color: this.props.color,
    };
  }

  onColorChange = color => {
    this.setState({ color: color });
    this.props.onColorChange(color);
  };

  render() {
    return (
      <SeriesColorPicker
        optionalClass="graph-legend-icon"
        yaxis={this.props.yaxis}
        color={this.state.color}
        onColorChange={this.onColorChange}
        onToggleAxis={this.props.onToggleAxis}
      >
        <SeriesIcon color={this.props.color} />
      </SeriesColorPicker>
    );
  }
}

interface LegendValueProps {
  value: string;
  valueName: string;
  asTable?: boolean;
}

function LegendValue(props: LegendValueProps) {
  const value = props.value;
  const valueName = props.valueName;
  if (props.asTable) {
    return <td className={`graph-legend-value ${valueName}`}>{value}</td>;
  }
  return <div className={`graph-legend-value ${valueName}`}>{value}</div>;
}
