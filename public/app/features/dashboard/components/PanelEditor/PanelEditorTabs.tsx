import React, { PureComponent } from 'react';
import { config } from 'app/core/config';
import { css } from 'emotion';
import { IconName, stylesFactory, Tab, TabContent, TabsBar } from '@grafana/ui';
import { AlertTab } from 'app/features/alerting/AlertTab';
import { TransformationsEditor } from '../TransformationsEditor/TransformationsEditor';
import { DashboardModel, PanelModel } from '../../state';
import { PanelEditorTab, PanelEditorTabId } from './types';
import { Subscription } from 'rxjs';
import { PanelQueriesChangedEvent, PanelTransformationsChangedEvent } from 'app/types/events';
import { PanelEditorQueries } from './PanelEditorQueries';

interface PanelEditorTabsProps {
  panel: PanelModel;
  dashboard: DashboardModel;
  tabs: PanelEditorTab[];
  onChangeTab: (tab: PanelEditorTab) => void;
}

export class PanelEditorTabs extends PureComponent<PanelEditorTabsProps> {
  private eventSubs = new Subscription();

  componentDidMount() {
    const { events } = this.props.panel;
    this.eventSubs.add(events.subscribe(PanelQueriesChangedEvent, this.triggerForceUpdate));
    this.eventSubs.add(events.subscribe(PanelTransformationsChangedEvent, this.triggerForceUpdate));
  }

  componentWillUnmount() {
    this.eventSubs.unsubscribe();
  }

  triggerForceUpdate = () => {
    this.forceUpdate();
  };

  getCounter = (tab: PanelEditorTab) => {
    const { panel } = this.props;

    switch (tab.id) {
      case PanelEditorTabId.Query:
        return panel.targets.length;
      case PanelEditorTabId.Alert:
        return panel.alert ? 1 : 0;
      case PanelEditorTabId.Transform:
        const transformations = panel.getTransformations() ?? [];
        return transformations.length;
    }

    return null;
  };

  render() {
    const { dashboard, onChangeTab, tabs, panel } = this.props;
    const styles = getPanelEditorTabsStyles();
    const activeTab = tabs.find(item => item.active)!;

    if (tabs.length === 0) {
      return null;
    }

    return (
      <div className={styles.wrapper}>
        <TabsBar className={styles.tabBar}>
          {tabs.map(tab => {
            return (
              <Tab
                key={tab.id}
                label={tab.text}
                active={tab.active}
                onChangeTab={() => onChangeTab(tab)}
                icon={tab.icon as IconName}
                counter={this.getCounter(tab)}
              />
            );
          })}
        </TabsBar>
        <TabContent className={styles.tabContent}>
          {activeTab.id === PanelEditorTabId.Query && <PanelEditorQueries panel={panel} dashboard={dashboard} />}
          {activeTab.id === PanelEditorTabId.Alert && <AlertTab panel={panel} dashboard={dashboard} />}
          {activeTab.id === PanelEditorTabId.Transform && <TransformationsEditor panel={panel} />}
        </TabContent>
      </div>
    );
  }
}

const getPanelEditorTabsStyles = stylesFactory(() => {
  const { theme } = config;

  return {
    wrapper: css`
      display: flex;
      flex-direction: column;
      height: 100%;
    `,
    tabBar: css`
      padding-left: ${theme.spacing.md};
    `,
    tabContent: css`
      padding: 0;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      min-height: 0;
      background: ${theme.colors.panelBg};
      border-right: 1px solid ${theme.colors.pageHeaderBorder};

      .toolbar {
        background: transparent;
      }
    `,
  };
});
