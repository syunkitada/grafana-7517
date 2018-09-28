import React, { PureComponent } from 'react';
import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';
import PageHeader from 'app/core/components/PageHeader/PageHeader';
import OrgActionBar from 'app/core/components/OrgActionBar/OrgActionBar';
import PluginList from './PluginList';
import { NavModel, Plugin } from 'app/types';
import { loadPlugins, setPluginsLayoutMode, setPluginsSearchQuery } from './state/actions';
import { getNavModel } from '../../core/selectors/navModel';
import { getLayoutMode, getPlugins, getPluginsSearchQuery } from './state/selectors';
import { LayoutMode } from '../../core/components/LayoutSelector/LayoutSelector';

export interface Props {
  navModel: NavModel;
  plugins: Plugin[];
  layoutMode: LayoutMode;
  searchQuery: string;
  loadPlugins: typeof loadPlugins;
  setPluginsLayoutMoode: typeof setPluginsLayoutMode;
  setPluginsSearchQuery: typeof setPluginsSearchQuery;
}

export class PluginListPage extends PureComponent<Props> {
  componentDidMount() {
    this.fetchPlugins();
  }

  async fetchPlugins() {
    await this.props.loadPlugins();
  }

  render() {
    const { navModel, plugins, layoutMode, setPluginsLayoutMoode, setPluginsSearchQuery, searchQuery } = this.props;

    const linkButton = {
      href: 'https://grafana.com/plugins?utm_source=grafana_plugin_list',
      title: 'Find more plugins on Grafana.com',
    };
    return (
      <div>
        <PageHeader model={navModel} />
        <div className="page-container page-body">
          <OrgActionBar
            searchQuery={searchQuery}
            layoutMode={layoutMode}
            setLayoutMode={mode => setPluginsLayoutMoode(mode)}
            setSearchQuery={query => setPluginsSearchQuery(query)}
            linkButton={linkButton}
          />
          {plugins && <PluginList plugins={plugins} layoutMode={layoutMode} />}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    navModel: getNavModel(state.navIndex, 'plugins'),
    plugins: getPlugins(state.plugins),
    layoutMode: getLayoutMode(state.plugins),
    searchQuery: getPluginsSearchQuery(state.plugins),
  };
}

const mapDispatchToProps = {
  loadPlugins,
  setPluginsLayoutMode,
  setPluginsSearchQuery,
};

export default hot(module)(connect(mapStateToProps, mapDispatchToProps)(PluginListPage));
