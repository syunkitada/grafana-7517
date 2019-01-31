// Libraries
import React, { PureComponent } from 'react';
import { AutoSizer } from 'react-virtualized';

// Services
import { getTimeSrv, TimeSrv } from '../time_srv';

// Components
import { PanelHeader } from './PanelHeader/PanelHeader';
import { DataPanel } from './DataPanel';

// Utils
import { applyPanelTimeOverrides } from 'app/features/dashboard/utils/panel';
import { PANEL_HEADER_HEIGHT } from 'app/core/constants';

// Types
import { PanelModel } from '../panel_model';
import { DashboardModel } from '../dashboard_model';
import { PanelPlugin } from 'app/types';
import { TimeRange } from '@grafana/ui';

import variables from 'sass/_variables.scss';
import templateSrv from 'app/features/templating/template_srv';
import { DataQueryResponse } from '@grafana/ui/src';

export interface Props {
  panel: PanelModel;
  dashboard: DashboardModel;
  plugin: PanelPlugin;
}

export interface State {
  refreshCounter: number;
  renderCounter: number;
  timeInfo?: string;
  timeRange?: TimeRange;
}

export class PanelChrome extends PureComponent<Props, State> {
  timeSrv: TimeSrv = getTimeSrv();

  constructor(props) {
    super(props);

    this.state = {
      refreshCounter: 0,
      renderCounter: 0,
    };
  }

  componentDidMount() {
    this.props.panel.events.on('refresh', this.onRefresh);
    this.props.panel.events.on('render', this.onRender);
    this.props.dashboard.panelInitialized(this.props.panel);
  }

  componentWillUnmount() {
    this.props.panel.events.off('refresh', this.onRefresh);
  }

  onRefresh = () => {
    console.log('onRefresh');
    if (!this.isVisible) {
      return;
    }

    const { panel } = this.props;
    const timeData = applyPanelTimeOverrides(panel, this.timeSrv.timeRange());

    this.setState({
      refreshCounter: this.state.refreshCounter + 1,
      timeRange: timeData.timeRange,
      timeInfo: timeData.timeInfo,
    });
  };

  onRender = () => {
    this.setState({
      renderCounter: this.state.renderCounter + 1,
    });
  };

  onInterpolate = (value: string, format?: string) => {
    return templateSrv.replace(value, this.props.panel.scopedVars, format);
  };

  onDataResponse = (dataQueryResponse: DataQueryResponse) => {
    if (this.props.dashboard.isSnapshot()) {
      this.props.panel.snapshotData = dataQueryResponse.data;
    }
  };

  get isVisible() {
    return !this.props.dashboard.otherPanelInFullscreen(this.props.panel);
  }

  renderPanel(loading, timeSeries, width, height): JSX.Element {
    const { panel, plugin } = this.props;
    const { timeRange, renderCounter } = this.state;
    const PanelComponent = plugin.exports.Panel;

    return (
      <div className="panel-content">
        <PanelComponent
          loading={loading}
          timeSeries={timeSeries}
          timeRange={timeRange}
          options={panel.getOptions(plugin.exports.PanelDefaults)}
          width={width - 2 * variables.panelHorizontalPadding}
          height={height - PANEL_HEADER_HEIGHT - variables.panelVerticalPadding}
          renderCounter={renderCounter}
          onInterpolate={this.onInterpolate}
        />
      </div>
    );
  }

  render() {
    const { panel, dashboard } = this.props;
    const { refreshCounter, timeRange, timeInfo } = this.state;

    const { datasource, targets, transparent } = panel;
    const containerClassNames = `panel-container panel-container--absolute ${transparent ? 'panel-transparent' : ''}`;
    return (
      <AutoSizer>
        {({ width, height }) => {
          if (width === 0) {
            return null;
          }

          return (
            <div className={containerClassNames}>
              <PanelHeader
                panel={panel}
                dashboard={dashboard}
                timeInfo={timeInfo}
                title={panel.title}
                description={panel.description}
                scopedVars={panel.scopedVars}
                links={panel.links}
              />

              {panel.snapshotData ? (
                this.renderPanel(false, panel.snapshotData, width, height)
              ) : (
                <DataPanel
                  datasource={datasource}
                  queries={targets}
                  timeRange={timeRange}
                  isVisible={this.isVisible}
                  widthPixels={width}
                  refreshCounter={refreshCounter}
                  onDataResponse={this.onDataResponse}
                >
                  {({ loading, timeSeries }) => {
                    return this.renderPanel(loading, timeSeries, width, height);
                  }}
                </DataPanel>
              )}
            </div>
          );
        }}
      </AutoSizer>
    );
  }
}
