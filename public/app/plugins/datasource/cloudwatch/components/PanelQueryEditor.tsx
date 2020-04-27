import React, { PureComponent } from 'react';
import { ExploreQueryFieldProps, ExploreMode } from '@grafana/data';
import { Segment } from '@grafana/ui';
import { CloudWatchQuery } from '../types';
import { CloudWatchDatasource } from '../datasource';
import { QueryInlineField } from './';
import { MetricsQueryEditor } from './MetricsQueryEditor';
import LogsQueryEditor from './LogsQueryEditor';

export type Props = ExploreQueryFieldProps<CloudWatchDatasource, CloudWatchQuery>;

interface State {
  queryMode: ExploreMode;
}

export class PanelQueryEditor extends PureComponent<Props, State> {
  state: State = { queryMode: (this.props.query.queryMode as ExploreMode) ?? ExploreMode.Metrics };

  onQueryModeChange(mode: ExploreMode) {
    this.setState({
      queryMode: mode,
    });
  }

  render() {
    const { queryMode } = this.state;

    return (
      <>
        <QueryInlineField label="Query Mode">
          <Segment
            value={queryMode}
            options={[
              { label: 'Metrics', value: ExploreMode.Metrics },
              { label: 'Logs', value: ExploreMode.Logs },
            ]}
            onChange={({ value }) => this.onQueryModeChange(value ?? ExploreMode.Metrics)}
          />
        </QueryInlineField>
        {queryMode === ExploreMode.Logs ? <LogsQueryEditor {...this.props} /> : <MetricsQueryEditor {...this.props} />}
      </>
    );
  }
}
