import { ComponentClass } from 'react';
import { PanelProps, PanelOptionsProps } from './panel';
import { DataQueryOptions, DataQuery, DataQueryResponse, QueryHint } from './datasource';

export interface DataSourceApi<TQuery extends DataQuery = DataQuery> {
  // set externally by grafana
  name?: string;
  meta?: PluginMeta;
  pluginExports?: PluginExports;

  /**
   *  min interval range
   */
  interval?: string;

  /**
   * Imports queries from a different datasource
   */
  importQueries?(queries: TQuery[], originMeta: PluginMeta): Promise<TQuery[]>;

  /**
   * Initializes a datasource after instantiation
   */
  init?: () => void;

  /**
   * Main metrics / data query action
   */
  query(options: DataQueryOptions<TQuery>): Promise<DataQueryResponse>;

  /**
   * Test & verify datasource settings & connection details
   */
  testDatasource(): Promise<any>;

  /**
   *  Get hints for query improvements
   */
  getQueryHints?(query: TQuery, results: any[], ...rest: any): QueryHint[];
}

export interface QueryEditorProps<DSType extends DataSourceApi = DataSourceApi, TQuery extends DataQuery = DataQuery> {
  datasource: DSType;
  query: TQuery;
  onExecuteQuery?: () => void;
  onQueryChange?: (value: DataQuery) => void;
}

export interface PluginExports {
  Datasource?: any;
  QueryCtrl?: any;
  QueryEditor?: ComponentClass<QueryEditorProps>;
  ConfigCtrl?: any;
  AnnotationsQueryCtrl?: any;
  VariableQueryEditor?: any;
  ExploreQueryField?: any;
  ExploreStartPage?: any;

  // Panel plugin
  PanelCtrl?: any;
  Panel?: ComponentClass<PanelProps>;
  PanelOptions?: ComponentClass<PanelOptionsProps>;
  PanelDefaults?: any;
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

interface PluginMetaQueryOptions {
  cacheTimeout?: boolean;
  maxDataPoints?: boolean;
  minInterval?: boolean;
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


