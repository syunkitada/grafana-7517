// Libraries
import React, { PureComponent } from 'react';

// Components
import { Select, SelectOptionItem } from '@grafana/ui';

// Types
import { QueryEditorProps } from '@grafana/ui/src/types';
import { LokiDatasource } from '../datasource';
import { LokiQuery } from '../types';
import { LokiQueryField } from './LokiQueryField';

type Props = QueryEditorProps<LokiDatasource, LokiQuery>;

interface State {
  query: LokiQuery;
}

export class LokiQueryEditor extends PureComponent<Props> {
  state: State = {
    query: this.props.query,
  };

  onRunQuery = () => {
    const { query } = this.state;

    this.props.onChange(query);
    this.props.onRunQuery();
  };

  onFieldChange = (query: LokiQuery, override?) => {
    this.setState({
      query: {
        ...this.state.query,
        expr: query.expr,
      }
    });
  };

  onFormatChanged = (option: SelectOptionItem) => {
    this.props.onChange({
      ...this.state.query,
      resultFormat: option.value,
    });
  };

  render() {
    const { query } = this.state;
    const { datasource } = this.props;
    const formatOptions: SelectOptionItem[] = [
      { label: 'Time Series', value: 'time_series' },
      { label: 'Table', value: 'table' },
      { label: 'Logs', value: 'logs' },
    ];

    query.resultFormat = query.resultFormat || 'time_series';
    const currentFormat = formatOptions.find(item => item.value === query.resultFormat);

    return (
      <div>
        <LokiQueryField
          datasource={datasource}
          initialQuery={query}
          onQueryChange={this.onFieldChange}
          onPressEnter={this.onRunQuery}
        />
        <div className="gf-form">
          <div className="gf-form-label">Format as</div>
          <Select isSearchable={false} options={formatOptions} onChange={this.onFormatChanged} value={currentFormat} />
        </div>
      </div>
    );
  }
}

export default LokiQueryEditor;
