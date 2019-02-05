// Libraries
import $ from 'jquery';
import React, { PureComponent, MouseEvent } from 'react';
import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';
import classNames from 'classnames';

// Services & Utils
import { createErrorNotification } from 'app/core/copy/appNotification';

// Components
import { DashboardGrid } from '../dashgrid/DashboardGrid';
import { DashNav } from '../components/DashNav';
import { SubMenu } from '../components/SubMenu';
import { DashboardSettings } from '../components/DashboardSettings';
import { CustomScrollbar } from '@grafana/ui';

// Redux
import { initDashboard } from '../state/initDashboard';
import { setDashboardModel } from '../state/actions';
import { updateLocation } from 'app/core/actions';
import { notifyApp } from 'app/core/actions';

// Types
import { StoreState, DashboardLoadingState, DashboardRouteInfo } from 'app/types';
import { DashboardModel, PanelModel } from 'app/features/dashboard/state';

interface Props {
  urlUid?: string;
  urlSlug?: string;
  urlType?: string;
  editview?: string;
  urlPanelId?: string;
  urlFolderId?: string;
  $scope: any;
  $injector: any;
  routeInfo: DashboardRouteInfo;
  urlEdit: boolean;
  urlFullscreen: boolean;
  loadingState: DashboardLoadingState;
  dashboard: DashboardModel;
  initDashboard: typeof initDashboard;
  setDashboardModel: typeof setDashboardModel;
  notifyApp: typeof notifyApp;
  updateLocation: typeof updateLocation;
}

interface State {
  isSettingsOpening: boolean;
  isEditing: boolean;
  isFullscreen: boolean;
  fullscreenPanel: PanelModel | null;
  scrollTop: number;
  rememberScrollTop: number;
}

export class DashboardPage extends PureComponent<Props, State> {
  state: State = {
    isSettingsOpening: false,
    isEditing: false,
    isFullscreen: false,
    fullscreenPanel: null,
    scrollTop: 0,
    rememberScrollTop: 0,
  };

  async componentDidMount() {
    this.props.initDashboard({
      $injector: this.props.$injector,
      $scope: this.props.$scope,
      urlSlug: this.props.urlSlug,
      urlUid: this.props.urlUid,
      urlType: this.props.urlType,
      urlFolderId: this.props.urlFolderId,
      routeInfo: this.props.routeInfo,
      fixUrl: true,
    });
  }

  componentWillUnmount() {
    if (this.props.dashboard) {
      this.props.dashboard.destroy();
      this.props.setDashboardModel(null);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { dashboard, editview, urlEdit, urlFullscreen, urlPanelId } = this.props;

    if (!dashboard) {
      return;
    }

    // if we just got dashboard update title
    if (!prevProps.dashboard) {
      document.title = dashboard.title + ' - Grafana';
    }

    // handle animation states when opening dashboard settings
    if (!prevProps.editview && editview) {
      this.setState({ isSettingsOpening: true });
      setTimeout(() => {
        this.setState({ isSettingsOpening: false });
      }, 10);
    }

    // Sync url state with model
    if (urlFullscreen !== dashboard.meta.fullscreen || urlEdit !== dashboard.meta.isEditing) {
      if (urlPanelId) {
        this.onEnterFullscreen();
      } else {
        this.onLeaveFullscreen();
      }
    }
  }

  onEnterFullscreen() {
    const { dashboard, urlEdit, urlFullscreen, urlPanelId } = this.props;

    const panel = dashboard.getPanelById(parseInt(urlPanelId, 10));

    if (panel) {
      dashboard.setViewMode(panel, urlFullscreen, urlEdit);
      this.setState({
        isEditing: urlEdit,
        isFullscreen: urlFullscreen,
        fullscreenPanel: panel,
        rememberScrollTop: this.state.scrollTop,
      });
      this.setPanelFullscreenClass(urlFullscreen);
    } else {
      this.handleFullscreenPanelNotFound(urlPanelId);
    }
  }

  onLeaveFullscreen() {
    const { dashboard } = this.props;

    if (this.state.fullscreenPanel) {
      dashboard.setViewMode(this.state.fullscreenPanel, false, false);
    }

    this.setState(
      {
        isEditing: false,
        isFullscreen: false,
        fullscreenPanel: null,
        scrollTop: this.state.rememberScrollTop,
      },
      () => {
        dashboard.render();
      }
    );

    this.setPanelFullscreenClass(false);
  }

  handleFullscreenPanelNotFound(urlPanelId: string) {
    // Panel not found
    this.props.notifyApp(createErrorNotification(`Panel with id ${urlPanelId} not found`));
    // Clear url state
    this.props.updateLocation({
      query: {
        edit: null,
        fullscreen: null,
        panelId: null,
      },
      partial: true,
    });
  }

  setPanelFullscreenClass(isFullscreen: boolean) {
    $('body').toggleClass('panel-in-fullscreen', isFullscreen);
  }

  setScrollTop = (e: MouseEvent<HTMLElement>): void => {
    const target = e.target as HTMLElement;
    this.setState({ scrollTop: target.scrollTop });
  };

  onAddPanel = () => {
    const { dashboard } = this.props;

    // Return if the "Add panel" exists already
    if (dashboard.panels.length > 0 && dashboard.panels[0].type === 'add-panel') {
      return;
    }

    dashboard.addPanel({
      type: 'add-panel',
      gridPos: { x: 0, y: 0, w: 12, h: 8 },
      title: 'Panel Title',
    });

    // scroll to top after adding panel
    this.setState({ scrollTop: 0 });
  };

  render() {
    const { dashboard, editview, $injector } = this.props;
    const { isSettingsOpening, isEditing, isFullscreen, scrollTop } = this.state;

    if (!dashboard) {
      return null;
    }

    const classes = classNames({
      'dashboard-page--settings-opening': isSettingsOpening,
      'dashboard-page--settings-open': !isSettingsOpening && editview,
    });

    const gridWrapperClasses = classNames({
      'dashboard-container': true,
      'dashboard-container--has-submenu': dashboard.meta.submenuEnabled,
    });

    return (
      <div className={classes}>
        <DashNav
          dashboard={dashboard}
          isEditing={isEditing}
          isFullscreen={isFullscreen}
          editview={editview}
          $injector={$injector}
          onAddPanel={this.onAddPanel}
        />
        <div className="scroll-canvas scroll-canvas--dashboard">
          <CustomScrollbar autoHeightMin={'100%'} setScrollTop={this.setScrollTop} scrollTop={scrollTop}>
            {dashboard && editview && <DashboardSettings dashboard={dashboard} />}

            <div className={gridWrapperClasses}>
              {dashboard.meta.submenuEnabled && <SubMenu dashboard={dashboard} />}
              <DashboardGrid dashboard={dashboard} isEditing={isEditing} isFullscreen={isFullscreen} />
            </div>
          </CustomScrollbar>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: StoreState) => ({
  urlUid: state.location.routeParams.uid,
  urlSlug: state.location.routeParams.slug,
  urlType: state.location.routeParams.type,
  editview: state.location.query.editview,
  urlPanelId: state.location.query.panelId,
  urlFolderId: state.location.query.folderId,
  urlFullscreen: state.location.query.fullscreen === true,
  urlEdit: state.location.query.edit === true,
  loadingState: state.dashboard.loadingState,
  dashboard: state.dashboard.model as DashboardModel,
});

const mapDispatchToProps = {
  initDashboard,
  setDashboardModel,
  notifyApp,
  updateLocation,
};

export default hot(module)(connect(mapStateToProps, mapDispatchToProps)(DashboardPage));
