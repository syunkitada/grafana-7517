import { ComponentClass } from 'react';
import { PanelProps, PanelOptionsProps } from '@grafana/ui';

export interface PluginExports {
  Datasource?: any;
  QueryCtrl?: any;
  QueryEditor?: any;
  ConfigCtrl?: any;
  AnnotationsQueryCtrl?: any;
  VariableQueryEditor?: any;
  ExploreQueryField?: any;
  ExploreStartPage?: any;

  // Panel plugin
  PanelCtrl?;
  Panel?: ComponentClass<PanelProps>;
  PanelOptions?: ComponentClass<PanelOptionsProps>;
  PanelDefaults?: any;
}

export interface PanelPlugin {
  id: string;
  name: string;
  hideFromList?: boolean;
  module: string;
  baseUrl: string;
  info: any;
  sort: number;
  exports?: PluginExports;
}

interface PluginMetaQueryOptions {
  cacheTimeout?: boolean;
  maxDataPoints?: boolean;
  minInterval?: boolean;
}

export interface PluginMeta {
  id: string;
  name: string;
  info: PluginMetaInfo;
  includes: PluginInclude[];

  // Datasource-specific
  metrics?: boolean;
  tables?: boolean;
  logs?: boolean;
  explore?: boolean;
  annotations?: boolean;
  mixed?: boolean;
  hasQueryHelp?: boolean;
  queryOptions?: PluginMetaQueryOptions;
}

export interface PluginInclude {
  type: string;
  name: string;
  path: string;
}

interface PluginMetaInfoLink {
  name: string;
  url: string;
}

export interface PluginMetaInfo {
  author: {
    name: string;
    url?: string;
  };
  description: string;
  links: PluginMetaInfoLink[];
  logos: {
    large: string;
    small: string;
  };
  screenshots: any[];
  updated: string;
  version: string;
}

export interface Plugin {
  defaultNavUrl: string;
  enabled: boolean;
  hasUpdate: boolean;
  id: string;
  info: PluginMetaInfo;
  latestVersion: string;
  name: string;
  pinned: boolean;
  state: string;
  type: string;
  module: any;
}

export interface PluginDashboard {
  dashboardId: number;
  description: string;
  folderId: number;
  imported: boolean;
  importedRevision: number;
  importedUri: string;
  importedUrl: string;
  path: string;
  pluginId: string;
  removed: boolean;
  revision: number;
  slug: string;
  title: string;
}

export interface PluginsState {
  plugins: Plugin[];
  searchQuery: string;
  layoutMode: string;
  hasFetched: boolean;
  dashboards: PluginDashboard[];
}

export interface VariableQueryProps {
  query: any;
  onChange: (query: any, definition: string) => void;
  datasource: any;
  templateSrv: any;
}
