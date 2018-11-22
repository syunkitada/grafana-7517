import React, { SFC, PureComponent } from 'react';
import DataSourceOption from './DataSourceOption';
import { getAngularLoader, AngularComponent } from 'app/core/services/AngularLoader';
import { EditorTabBody } from './EditorTabBody';
import { DataSourcePicker } from './DataSourcePicker';
import { JSONFormatter } from 'app/core/components/JSONFormatter/JSONFormatter';
import { PanelModel } from '../panel_model';
import { DashboardModel } from '../dashboard_model';
import './../../panel/metrics_tab';
import config from 'app/core/config';

// Services
import { getDatasourceSrv } from 'app/features/plugins/datasource_srv';
import { getBackendSrv, BackendSrv } from 'app/core/services/backend_srv';
import { DataSourceSelectItem } from 'app/types';
import appEvents from 'app/core/app_events';

import Remarkable from 'remarkable';

interface Props {
  panel: PanelModel;
  dashboard: DashboardModel;
}

interface Help {
  isLoading: boolean;
  helpHtml: any;
}

interface DsQuery {
  isLoading: boolean;
  response: {};
}

interface State {
  currentDatasource: DataSourceSelectItem;
  help: Help;
  dsQuery: DsQuery;
}

interface LoadingPlaceholderProps {
  text: string;
}

const LoadingPlaceholder: SFC<LoadingPlaceholderProps> = ({ text }) => <h2>{text}</h2>;

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
      dsQuery: {
        isLoading: false,
        response: {},
      },
    };
    appEvents.on('ds-request-response', this.onDataSourceResponse);
    panel.events.on('refresh', this.onPanelRefresh);
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
    const { panel } = this.props;
    appEvents.off('ds-request-response', this.onDataSourceResponse);
    panel.events.off('refresh', this.onPanelRefresh);

    if (this.component) {
      this.component.destroy();
    }
  }

  onPanelRefresh = () => {
    this.setState(prevState => ({
      ...prevState,
      dsQuery: {
        isLoading: true,
        response: {},
      },
    }));
  };

  onDataSourceResponse = (response: any = {}) => {
    // ignore if closed
    // if (!this.isOpen) {
    //   return;
    // }

    // if (this.isMocking) {
    //   this.handleMocking(data);
    //   return;
    // }

    // this.isLoading = false;
    // data = _.cloneDeep(data);
    response = { ...response }; // clone

    if (response.headers) {
      delete response.headers;
    }

    if (response.config) {
      response.request = response.config;
      delete response.config;
      delete response.request.transformRequest;
      delete response.request.transformResponse;
      delete response.request.paramSerializer;
      delete response.request.jsonpCallbackParam;
      delete response.request.headers;
      delete response.request.requestId;
      delete response.request.inspect;
      delete response.request.retry;
      delete response.request.timeout;
    }

    if (response.data) {
      response.response = response.data;

      // if (response.status === 200) {
      //   // if we are in error state, assume we automatically opened
      //   // and auto close it again
      //   if (this.hasError) {
      //     this.hasError = false;
      //     this.isOpen = false;
      //   }
      // }

      delete response.data;
      delete response.status;
      delete response.statusText;
      delete response.$$config;
    }
    this.setState(prevState => ({
      ...prevState,
      dsQuery: {
        isLoading: false,
        response: response,
      },
    }));
  };

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

  loadQueryInspector = () => {
    const { panel } = this.props;
    panel.refresh();
  };

  renderQueryInspector = () => {
    const { response, isLoading } = this.state.dsQuery;
    return isLoading ? <LoadingPlaceholder text="Loading query inspector..." /> : <JSONFormatter json={response} />;
  };

  renderHelp = () => {
    const { helpHtml, isLoading } = this.state.help;
    return isLoading ? <LoadingPlaceholder text="Loading help..." /> : helpHtml;
  };

  render() {
    const { currentDatasource } = this.state;

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
      onClick: this.loadQueryInspector,
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
        <div ref={element => (this.element = element)} style={{ width: '100%' }} />
      </EditorTabBody>
    );
  }
}
