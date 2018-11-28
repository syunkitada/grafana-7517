import React, { SFC, PureComponent } from 'react';
import DataSourceOption from './DataSourceOption';
import { getAngularLoader, AngularComponent } from 'app/core/services/AngularLoader';
import { EditorTabBody } from './EditorTabBody';
import { DataSourcePicker } from './DataSourcePicker';
import { PanelModel } from '../panel_model';
import { DashboardModel } from '../dashboard_model';
import './../../panel/metrics_tab';
import config from 'app/core/config';
import { QueryInspector } from './QueryInspector';
import { Switch } from 'app/core/components/Switch/Switch';
import { Input } from 'app/core/components/Form';
import { InputStatus } from 'app/core/components/Form/Input';
import { isValidTimeSpan } from 'app/core/utils/rangeutil';
import { ValidationRule } from 'app/types';

// Services
import { getDatasourceSrv } from 'app/features/plugins/datasource_srv';
import { getBackendSrv, BackendSrv } from 'app/core/services/backend_srv';
import { DataSourceSelectItem } from 'app/types';

import Remarkable from 'remarkable';

interface Props {
  panel: PanelModel;
  dashboard: DashboardModel;
}

interface Help {
  isLoading: boolean;
  helpHtml: any;
}

interface State {
  currentDatasource: DataSourceSelectItem;
  help: Help;
  hideTimeOverride: boolean;
}

interface LoadingPlaceholderProps {
  text: string;
}

const LoadingPlaceholder: SFC<LoadingPlaceholderProps> = ({ text }) => <h2>{text}</h2>;
const validationRules: ValidationRule[] = [
  {
    rule: value => {
      if (!value) {
        return true;
      }
      return isValidTimeSpan(value);
    },
    errorMessage: 'Not a valid timespan',
  },
];

export class QueriesTab extends PureComponent<Props, State> {
  element: any;
  component: AngularComponent;
  datasources: DataSourceSelectItem[] = getDatasourceSrv().getMetricSources();
  backendSrv: BackendSrv = getBackendSrv();

  constructor(props) {
    super(props);
    const { panel } = props;

    this.state = {
      currentDatasource: this.datasources.find(datasource => datasource.value === panel.datasource),
      help: {
        isLoading: false,
        helpHtml: null,
      },
      hideTimeOverride: false,
    };
  }

  componentDidMount() {
    if (!this.element) {
      return;
    }

    const { panel, dashboard } = this.props;
    const loader = getAngularLoader();
    const template = '<metrics-tab />';
    const scopeProps = {
      ctrl: {
        panel: panel,
        dashboard: dashboard,
        refresh: () => panel.refresh(),
      },
    };

    this.component = loader.load(this.element, scopeProps, template);
  }

  componentWillUnmount() {
    if (this.component) {
      this.component.destroy();
    }
  }

  onChangeDataSource = datasource => {
    const { panel } = this.props;
    const { currentDatasource } = this.state;
    // switching to mixed
    if (datasource.meta.mixed) {
      panel.targets.forEach(target => {
        target.datasource = panel.datasource;
        if (!target.datasource) {
          target.datasource = config.defaultDatasource;
        }
      });
    } else if (currentDatasource && currentDatasource.meta.mixed) {
      panel.targets.forEach(target => {
        delete target.datasource;
      });
    }

    panel.datasource = datasource.value;
    panel.refresh();

    this.setState(prevState => ({
      ...prevState,
      currentDatasource: datasource,
    }));
  };

  loadHelp = () => {
    const { currentDatasource } = this.state;
    const hasHelp = currentDatasource.meta.hasQueryHelp;

    if (hasHelp) {
      this.setState(prevState => ({
        ...prevState,
        help: {
          helpHtml: <h2>Loading help...</h2>,
          isLoading: true,
        },
      }));

      this.backendSrv
        .get(`/api/plugins/${currentDatasource.meta.id}/markdown/query_help`)
        .then(res => {
          const md = new Remarkable();
          const helpHtml = md.render(res); // TODO: Clean out dangerous code? Previous: this.helpHtml = this.$sce.trustAsHtml(md.render(res));
          this.setState(prevState => ({
            ...prevState,
            help: {
              helpHtml: <div className="markdown-html" dangerouslySetInnerHTML={{ __html: helpHtml }} />,
              isLoading: false,
            },
          }));
        })
        .catch(() => {
          this.setState(prevState => ({
            ...prevState,
            help: {
              helpHtml: 'Error occured when loading help',
              isLoading: false,
            },
          }));
        });
    }
  };

  renderOptions = close => {
    const { currentDatasource } = this.state;
    const { queryOptions } = currentDatasource.meta;
    const { panel } = this.props;

    const onChangeFn = (panelKey: string) => {
      return (value: string | number) => {
        panel[panelKey] = value;
        panel.refresh();
      };
    };

    const allOptions = {
      cacheTimeout: {
        label: 'Cache timeout',
        placeholder: '60',
        name: 'cacheTimeout',
        value: panel.cacheTimeout,
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
        value: panel.maxDataPoints,
        tooltipInfo: (
          <>
            The maximum data points the query should return. For graphs this is automatically set to one data point per
            pixel.
          </>
        ),
      },
      minInterval: {
        label: 'Min time interval',
        placeholder: '0',
        name: 'minInterval',
        value: panel.interval,
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

    return Object.keys(queryOptions).map(key => {
      const options = allOptions[key];
      return <DataSourceOption key={key} {...options} onChange={onChangeFn(allOptions[key].panelKey || key)} />;
    });
  };

  renderQueryInspector = () => {
    const { panel } = this.props;
    return <QueryInspector panel={panel} LoadingPlaceholder={LoadingPlaceholder} />;
  };

  renderHelp = () => {
    const { helpHtml, isLoading } = this.state.help;
    return isLoading ? <LoadingPlaceholder text="Loading help..." /> : helpHtml;
  };

  emptyToNull = (value: string) => {
    return value === '' ? null : value;
  };

  onOverrideTime = (evt, status: InputStatus) => {
    const { value } = evt.target;
    const { panel } = this.props;
    const emptyToNullValue = this.emptyToNull(value);
    if (status === InputStatus.Valid && panel.timeFrom !== emptyToNullValue) {
      panel.timeFrom = emptyToNullValue;
      panel.refresh();
    }
  };

  onTimeShift = (evt, status: InputStatus) => {
    const { value } = evt.target;
    const { panel } = this.props;
    const emptyToNullValue = this.emptyToNull(value);
    if (status === InputStatus.Valid && panel.timeShift !== emptyToNullValue) {
      panel.timeShift = emptyToNullValue;
      panel.refresh();
    }
  };

  onToggleTimeOverride = () => {
    const { panel } = this.props;
    panel.hideTimeOverride = !panel.hideTimeOverride;
    panel.refresh();
  };

  render() {
    const { currentDatasource } = this.state;
    const hideTimeOverride = this.props.panel.hideTimeOverride;
    console.log('hideTimeOverride', hideTimeOverride);
    const { hasQueryHelp, queryOptions } = currentDatasource.meta;
    const hasQueryOptions = !!queryOptions;
    const dsInformation = {
      title: currentDatasource.name,
      imgSrc: currentDatasource.meta.info.logos.small,
      render: closeOpenView => (
        <DataSourcePicker
          datasources={this.datasources}
          onChangeDataSource={ds => {
            closeOpenView();
            this.onChangeDataSource(ds);
          }}
        />
      ),
    };

    const queryInspector = {
      title: 'Query Inspector',
      render: this.renderQueryInspector,
    };

    const dsHelp = {
      title: '',
      icon: 'fa fa-question',
      disabled: !hasQueryHelp,
      onClick: this.loadHelp,
      render: this.renderHelp,
    };

    const options = {
      title: '',
      icon: 'fa fa-cog',
      disabled: !hasQueryOptions,
      render: this.renderOptions,
    };

    return (
      <EditorTabBody heading="Queries" main={dsInformation} toolbarItems={[options, queryInspector, dsHelp]}>
        <>
          <div ref={element => (this.element = element)} style={{ width: '100%' }} />

          <h5 className="section-heading">Time Range</h5>

          <div className="gf-form-group">
            <div className="gf-form">
              <span className="gf-form-label">
                <i className="fa fa-clock-o" />
              </span>

              <span className="gf-form-label width-12">Override relative time</span>
              <span className="gf-form-label width-6">Last</span>
              <Input
                type="text"
                className="gf-form-input max-width-8"
                placeholder="1h"
                onBlurWithStatus={this.onOverrideTime}
                validationRules={validationRules}
                hideErrorMessage={true}
              />
            </div>

            <div className="gf-form">
              <span className="gf-form-label">
                <i className="fa fa-clock-o" />
              </span>
              <span className="gf-form-label width-12">Add time shift</span>
              <span className="gf-form-label width-6">Amount</span>
              <Input
                type="text"
                className="gf-form-input max-width-8"
                placeholder="1h"
                onBlurWithStatus={this.onTimeShift}
                validationRules={validationRules}
                hideErrorMessage={true}
              />
            </div>

            <div className="gf-form-inline">
              <div className="gf-form">
                <span className="gf-form-label">
                  <i className="fa fa-clock-o" />
                </span>
              </div>
              <Switch label="Hide time override info" checked={hideTimeOverride} onChange={this.onToggleTimeOverride} />
            </div>
          </div>
        </>
      </EditorTabBody>
    );
  }
}
