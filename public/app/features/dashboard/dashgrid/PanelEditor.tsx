import React from 'react';
import classNames from 'classnames';
import { PanelModel } from '../panel_model';
import { DashboardModel } from '../dashboard_model';
import { store } from 'app/stores/store';
import { observer } from 'mobx-react';
import { QueriesTab } from './QueriesTab';
import { PanelPlugin } from 'app/types/plugins';
import { VizTypePicker } from './VizTypePicker';

interface PanelEditorProps {
  panel: PanelModel;
  dashboard: DashboardModel;
  panelType: string;
  onTypeChanged: (newType: PanelPlugin) => void;
}

interface PanelEditorTab {
  id: string;
  text: string;
  icon: string;
}

@observer
export class PanelEditor extends React.Component<PanelEditorProps, any> {
  tabs: PanelEditorTab[];

  constructor(props) {
    super(props);

    this.tabs = [
      { id: 'queries', text: 'Queries', icon: 'fa fa-database' },
      { id: 'viz', text: 'Visualization', icon: 'fa fa-line-chart' },
    ];
  }

  renderQueriesTab() {
    return <QueriesTab panel={this.props.panel} dashboard={this.props.dashboard} />;
  }

  renderVizTab() {
    return (
      <div className="viz-editor">
        <div className="viz-editor-col1">
          <VizTypePicker currentType={this.props.panel.type} onTypeChanged={this.props.onTypeChanged} />
        </div>
        <div className="viz-editor-col2">
          <h5 className="page-heading">Options</h5>
        </div>
      </div>
    );
  }

  onChangeTab = (tab: PanelEditorTab) => {
    store.view.updateQuery({ tab: tab.id }, false);
  };

  render() {
    const activeTab: string = store.view.query.get('tab') || 'queries';

    return (
      <div className="tabbed-view tabbed-view--new">
        <div className="tabbed-view-header">
          <ul className="gf-tabs">
            {this.tabs.map(tab => {
              return <TabItem tab={tab} activeTab={activeTab} onClick={this.onChangeTab} key={tab.id} />;
            })}
          </ul>

          <button className="tabbed-view-close-btn" ng-click="ctrl.exitFullscreen();">
            <i className="fa fa-remove" />
          </button>
        </div>

        <div className="tabbed-view-body">
          {activeTab === 'queries' && this.renderQueriesTab()}
          {activeTab === 'viz' && this.renderVizTab()}
        </div>
      </div>
    );
  }
}

interface TabItemParams {
  tab: PanelEditorTab;
  activeTab: string;
  onClick: (tab: PanelEditorTab) => void;
}

function TabItem({ tab, activeTab, onClick }: TabItemParams) {
  const tabClasses = classNames({
    'gf-tabs-link': true,
    active: activeTab === tab.id,
  });

  return (
    <li className="gf-tabs-item" key={tab.id}>
      <a className={tabClasses} onClick={() => onClick(tab)}>
        <i className={tab.icon} />
        {tab.text}
      </a>
    </li>
  );
}
