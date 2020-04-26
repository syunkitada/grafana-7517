// Libraries
import React, { PureComponent, ChangeEvent, FocusEvent, ReactText } from 'react';

// Utils
import { rangeUtil, DataSourceSelectItem, PanelData } from '@grafana/data';

// Components
import {
  EventsWithValidation,
  LegacyInputStatus,
  LegacyForms,
  ValidationEvents,
  InlineFormLabel,
  stylesFactory,
} from '@grafana/ui';
import { DataSourceOption } from './DataSourceOption';
const { Input, Switch } = LegacyForms;

// Types
import { PanelModel } from '../state';
import { QueryOperationRow } from 'app/core/components/QueryOperationRow/QueryOperationRow';
import { config } from 'app/core/config';
import { css } from 'emotion';

const timeRangeValidationEvents: ValidationEvents = {
  [EventsWithValidation.onBlur]: [
    {
      rule: value => {
        if (!value) {
          return true;
        }
        return rangeUtil.isValidTimeSpan(value);
      },
      errorMessage: 'Not a valid timespan',
    },
  ],
};

const emptyToNull = (value: string) => {
  return value === '' ? null : value;
};

interface Props {
  panel: PanelModel;
  datasource: DataSourceSelectItem;
  data: PanelData;
}

interface State {
  relativeTime: string;
  timeShift: string;
  cacheTimeout: string;
  maxDataPoints: string | ReactText;
  interval: string;
  hideTimeOverride: boolean;
  isOpen: boolean;
}

export class QueryOptions extends PureComponent<Props, State> {
  allOptions: any = {
    cacheTimeout: {
      label: 'Cache timeout',
      placeholder: '60',
      name: 'cacheTimeout',
      tooltipInfo: (
        <>
          If your time series store has a query cache this option can override the default cache timeout. Specify a
          numeric value in seconds.
        </>
      ),
    },
    maxDataPoints: {
      label: 'Max data points',
      placeholder: 'auto',
      name: 'maxDataPoints',
      tooltipInfo: (
        <>
          The maximum data points the query should return. For graphs this is automatically set to one data point per
          pixel. For some data sources this can also be capped in the datasource settings page. With streaming data,
          this value is used for the rolling buffer.
        </>
      ),
    },
    minInterval: {
      label: 'Min time interval',
      placeholder: '0',
      name: 'minInterval',
      panelKey: 'interval',
      tooltipInfo: (
        <>
          A lower limit for the auto group by time interval. Recommended to be set to write frequency, for example{' '}
          <code>1m</code> if your data is written every minute. Access auto interval via variable{' '}
          <code>$__interval</code> for time range string and <code>$__interval_ms</code> for numeric variable that can
          be used in math expressions.
        </>
      ),
    },
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      relativeTime: props.panel.timeFrom || '',
      timeShift: props.panel.timeShift || '',
      cacheTimeout: props.panel.cacheTimeout || '',
      maxDataPoints: props.panel.maxDataPoints || '',
      interval: props.panel.interval || '',
      hideTimeOverride: props.panel.hideTimeOverride || false,
      isOpen: false,
    };
  }

  onRelativeTimeChange = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      relativeTime: event.target.value,
    });
  };

  onTimeShiftChange = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      timeShift: event.target.value,
    });
  };

  onOverrideTime = (event: FocusEvent<HTMLInputElement>, status: LegacyInputStatus) => {
    const { value } = event.target;
    const { panel } = this.props;
    const emptyToNullValue = emptyToNull(value);
    if (status === LegacyInputStatus.Valid && panel.timeFrom !== emptyToNullValue) {
      panel.timeFrom = emptyToNullValue;
      panel.refresh();
    }
  };

  onTimeShift = (event: FocusEvent<HTMLInputElement>, status: LegacyInputStatus) => {
    const { value } = event.target;
    const { panel } = this.props;
    const emptyToNullValue = emptyToNull(value);
    if (status === LegacyInputStatus.Valid && panel.timeShift !== emptyToNullValue) {
      panel.timeShift = emptyToNullValue;
      panel.refresh();
    }
  };

  onToggleTimeOverride = () => {
    const { panel } = this.props;
    this.setState({ hideTimeOverride: !this.state.hideTimeOverride }, () => {
      panel.hideTimeOverride = this.state.hideTimeOverride;
      panel.refresh();
    });
  };

  onDataSourceOptionBlur = (panelKey: string) => () => {
    const { panel } = this.props;

    // @ts-ignore
    panel[panelKey] = this.state[panelKey];
    panel.refresh();
  };

  onDataSourceOptionChange = (panelKey: string) => (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({ ...this.state, [panelKey]: event.target.value });
  };

  /**
   * Show options for any value that is set, or values that the
   * current datasource says it will use
   */
  renderOptions = () => {
    const { datasource } = this.props;
    const queryOptions: any = datasource.meta.queryOptions || {};

    return Object.keys(this.allOptions).map(key => {
      const options = this.allOptions[key];
      const panelKey = options.panelKey || key;

      // @ts-ignore
      const value = this.state[panelKey];

      if (queryOptions[key]) {
        return (
          <DataSourceOption
            key={key}
            {...options}
            onChange={this.onDataSourceOptionChange(panelKey)}
            onBlur={this.onDataSourceOptionBlur(panelKey)}
            value={value}
          />
        );
      }
      return null; // nothing to render
    });
  };

  onOpenOptions = () => {
    this.setState({ isOpen: true });
  };

  onCloseOptions = () => {
    this.setState({ isOpen: false });
  };

  renderCollapsedText(styles: StylesType): React.ReactNode | undefined {
    const { data } = this.props;
    const { isOpen, maxDataPoints, interval } = this.state;

    if (isOpen) {
      return undefined;
    }

    let mdDesc = maxDataPoints;
    if (maxDataPoints === '' && data.request) {
      mdDesc = `auto = ${data.request.maxDataPoints}`;
    }

    let intervalDesc = interval;
    if (intervalDesc === '' && data.request) {
      intervalDesc = `auto = ${data.request.interval}`;
    }

    return (
      <>
        {<div className={styles.collapsedText}>MD = {mdDesc}</div>}
        {<div className={styles.collapsedText}>Interval = {intervalDesc}</div>}
      </>
    );
  }

  render() {
    const { hideTimeOverride } = this.state;
    const { relativeTime, timeShift, isOpen } = this.state;
    const styles = getStyles();

    return (
      <QueryOperationRow
        title="Options"
        headerElement={this.renderCollapsedText(styles)}
        isOpen={isOpen}
        onOpen={this.onOpenOptions}
        onClose={this.onCloseOptions}
      >
        {this.renderOptions()}

        <div className="gf-form">
          <InlineFormLabel width={9}>Relative time</InlineFormLabel>
          <Input
            type="text"
            className="width-6"
            placeholder="1h"
            onChange={this.onRelativeTimeChange}
            onBlur={this.onOverrideTime}
            validationEvents={timeRangeValidationEvents}
            hideErrorMessage={true}
            value={relativeTime}
          />
        </div>

        <div className="gf-form">
          <span className="gf-form-label width-9">Time shift</span>
          <Input
            type="text"
            className="width-6"
            placeholder="1h"
            onChange={this.onTimeShiftChange}
            onBlur={this.onTimeShift}
            validationEvents={timeRangeValidationEvents}
            hideErrorMessage={true}
            value={timeShift}
          />
        </div>
        {(timeShift || relativeTime) && (
          <div className="gf-form-inline">
            <Switch
              label="Hide time info"
              labelClass="width-9"
              checked={hideTimeOverride}
              onChange={this.onToggleTimeOverride}
            />
          </div>
        )}
      </QueryOperationRow>
    );
  }
}

const getStyles = stylesFactory(() => {
  const { theme } = config;

  return {
    collapsedText: css`
      margin-left: ${theme.spacing.md};
      font-size: ${theme.typography.size.sm};
      color: ${theme.colors.textWeak};
    `,
  };
});

type StylesType = ReturnType<typeof getStyles>;
