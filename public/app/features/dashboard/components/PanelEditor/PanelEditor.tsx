import React, { PureComponent } from 'react';
import { css, cx } from 'emotion';
import { GrafanaTheme, PanelData, LoadingState, DefaultTimeRange, PanelEvents } from '@grafana/data';
import { stylesFactory, Forms, CustomScrollbar } from '@grafana/ui';
import config from 'app/core/config';

import { PanelModel } from '../../state/PanelModel';
import { DashboardModel } from '../../state/DashboardModel';
import { DashboardPanel } from '../../dashgrid/DashboardPanel';
import { QueriesTab } from '../../panel_editor/QueriesTab';
import SplitPane from 'react-split-pane';
import { StoreState } from '../../../../types/store';
import { connect } from 'react-redux';
import { updateLocation } from '../../../../core/reducers/location';
import { Unsubscribable } from 'rxjs';

const getStyles = stylesFactory((theme: GrafanaTheme) => {
  const resizer = css`
    padding: 3px;
    font-style: italic;
    background: ${theme.colors.panelBg};
    &:hover {
      background: ${theme.colors.headingColor};
    }
  `;

  return {
    wrapper: css`
      width: 100%;
      height: 100%;
      position: fixed;
      z-index: ${theme.zIndex.modal};
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: ${theme.colors.pageBg};
    `,
    fill: css`
      width: 100%;
      height: 100%;
    `,
    resizerV: cx(
      resizer,
      css`
        cursor: col-resize;
      `
    ),
    resizerH: cx(
      resizer,
      css`
        cursor: row-resize;
      `
    ),
    noScrollPaneContent: css`
      height: 100%;
      overflow: hidden;
    `,
  };
});

interface Props {
  dashboard: DashboardModel;
  panel: PanelModel;
  updateLocation: typeof updateLocation;
}

interface State {
  pluginLoadedCounter: number;
  dirtyPanel?: PanelModel;
  data: PanelData;
}

export class PanelEditor extends PureComponent<Props, State> {
  querySubscription: Unsubscribable;

  state: State = {
    pluginLoadedCounter: 0,
    data: {
      state: LoadingState.NotStarted,
      series: [],
      timeRange: DefaultTimeRange,
    },
  };

  constructor(props: Props) {
    super(props);

    // To ensure visualisation  settings are re-rendered when plugin has loaded
    // panelInitialised event is emmited from PanelChrome
    props.panel.events.on(PanelEvents.panelInitialized, () => {
      this.setState(state => ({
        pluginLoadedCounter: state.pluginLoadedCounter + 1,
      }));
    });
  }

  componentDidMount() {
    const { panel } = this.props;
    const dirtyPanel = panel.getEditClone();
    this.setState({ dirtyPanel });

    // Get data from any pending
    panel
      .getQueryRunner()
      .getData()
      .subscribe({
        next: (data: PanelData) => {
          this.setState({ data });
          // TODO, cancel????
        },
      });

    // Listen for queries on the new panel
    const queryRunner = dirtyPanel.getQueryRunner();
    this.querySubscription = queryRunner.getData().subscribe({
      next: (data: PanelData) => this.setState({ data }),
    });
  }

  componentWillUnmount() {
    if (this.querySubscription) {
      this.querySubscription.unsubscribe();
    }
    //this.cleanUpAngularOptions();
  }

  onPanelUpdate = () => {
    const { dirtyPanel } = this.state;
    const { dashboard } = this.props;
    dashboard.updatePanel(dirtyPanel);
  };

  onPanelExit = () => {
    const { updateLocation } = this.props;
    this.onPanelUpdate();
    updateLocation({
      query: { editPanel: null },
      partial: true,
    });
  };

  onDiscard = () => {
    this.props.updateLocation({
      query: { editPanel: null },
      partial: true,
    });
  };

  onDragFinished = () => {
    document.body.style.cursor = 'auto';
    console.log('TODO, save splitter settings');
  };

  render() {
    const { dashboard } = this.props;
    const { dirtyPanel } = this.state;

    const styles = getStyles(config.theme);

    if (!dirtyPanel) {
      return null;
    }

    return (
      <div className={styles.wrapper}>
        <div>
          <button className="navbar-edit__back-btn" onClick={this.onPanelExit}>
            <i className="fa fa-arrow-left"></i>
          </button>
          {this.props.panel.title}
          <Forms.Button variant="destructive" onClick={this.onDiscard}>
            Discard
          </Forms.Button>
        </div>
        <SplitPane
          split="vertical"
          primary="second"
          minSize={50}
          defaultSize={350}
          resizerClassName={styles.resizerV}
          onDragStarted={() => (document.body.style.cursor = 'col-resize')}
          onDragFinished={this.onDragFinished}
        >
          <SplitPane
            split="horizontal"
            minSize={50}
            primary="second"
            defaultSize="40%"
            resizerClassName={styles.resizerH}
            onDragStarted={() => (document.body.style.cursor = 'row-resize')}
            onDragFinished={this.onDragFinished}
          >
            <div className={styles.fill}>
              <DashboardPanel
                dashboard={dashboard}
                panel={dirtyPanel}
                isEditing={false}
                isInEditMode
                isFullscreen={false}
                isInView={true}
              />
            </div>
            <div className={styles.noScrollPaneContent}>
              <QueriesTab panel={dirtyPanel} dashboard={dashboard} />
            </div>
          </SplitPane>
          <div className={styles.noScrollPaneContent}>
            <CustomScrollbar>
              <div>Viz settings</div>
            </CustomScrollbar>
          </div>
        </SplitPane>
      </div>
    );
  }
}

const mapStateToProps = (state: StoreState) => ({
  location: state.location,
});

const mapDispatchToProps = {
  updateLocation,
};

export default connect(mapStateToProps, mapDispatchToProps)(PanelEditor);
