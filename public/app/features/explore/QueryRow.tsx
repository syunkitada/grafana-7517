import React, { PureComponent } from 'react';
import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';
import { RawTimeRange } from '@grafana/ui';
import _ from 'lodash';

import { QueryTransaction, HistoryItem, QueryHint, ExploreItemState, ExploreId } from 'app/types/explore';
import { Emitter } from 'app/core/utils/emitter';
import { DataQuery, StoreState } from 'app/types';

// import DefaultQueryField from './QueryField';
import QueryEditor from './QueryEditor';
import QueryTransactionStatus from './QueryTransactionStatus';
import {
  addQueryRow,
  changeQuery,
  highlightLogsExpression,
  modifyQueries,
  removeQueryRow,
  runQueries,
} from './state/actions';

function getFirstHintFromTransactions(transactions: QueryTransaction[]): QueryHint {
  const transaction = transactions.find(qt => qt.hints && qt.hints.length > 0);
  if (transaction) {
    return transaction.hints[0];
  }
  return undefined;
}

interface QueryRowProps {
  addQueryRow: typeof addQueryRow;
  changeQuery: typeof changeQuery;
  className?: string;
  exploreId: ExploreId;
  datasourceInstance: any;
  highlightLogsExpression: typeof highlightLogsExpression;
  history: HistoryItem[];
  index: number;
  initialQuery: DataQuery;
  modifyQueries: typeof modifyQueries;
  queryTransactions: QueryTransaction[];
  exploreEvents: Emitter;
  range: RawTimeRange;
  removeQueryRow: typeof removeQueryRow;
  runQueries: typeof runQueries;
}

export class QueryRow extends PureComponent<QueryRowProps> {
  onExecuteQuery = () => {
    const { exploreId } = this.props;
    this.props.runQueries(exploreId);
  };

  onChangeQuery = (query: DataQuery, override?: boolean) => {
    const { datasourceInstance, exploreId, index } = this.props;
    this.props.changeQuery(exploreId, query, index, override);
    if (query && !override && datasourceInstance.getHighlighterExpression && index === 0) {
      // Live preview of log search matches. Only use on first row for now
      this.updateLogsHighlights(query);
    }
  };

  onClickAddButton = () => {
    const { exploreId, index } = this.props;
    this.props.addQueryRow(exploreId, index);
  };

  onClickClearButton = () => {
    this.onChangeQuery(null, true);
  };

  onClickHintFix = action => {
    const { datasourceInstance, exploreId, index } = this.props;
    if (datasourceInstance && datasourceInstance.modifyQuery) {
      const modifier = (queries: DataQuery, action: any) => datasourceInstance.modifyQuery(queries, action);
      this.props.modifyQueries(exploreId, action, index, modifier);
    }
  };

  onClickRemoveButton = () => {
    const { exploreId, index } = this.props;
    this.props.removeQueryRow(exploreId, index);
  };

  updateLogsHighlights = _.debounce((value: DataQuery) => {
    const { datasourceInstance } = this.props;
    if (datasourceInstance.getHighlighterExpression) {
      const expressions = [datasourceInstance.getHighlighterExpression(value)];
      this.props.highlightLogsExpression(this.props.exploreId, expressions);
    }
  }, 500);

  render() {
    const { datasourceInstance, history, index, initialQuery, queryTransactions, exploreEvents, range } = this.props;
    const transactions = queryTransactions.filter(t => t.rowIndex === index);
    const transactionWithError = transactions.find(t => t.error !== undefined);
    const hint = getFirstHintFromTransactions(transactions);
    const queryError = transactionWithError ? transactionWithError.error : null;
    const QueryField = datasourceInstance.pluginExports.ExploreQueryField;
    return (
      <div className="query-row">
        <div className="query-row-status">
          <QueryTransactionStatus transactions={transactions} />
        </div>
        <div className="query-row-field">
          {QueryField ? (
            <QueryField
              datasource={datasourceInstance}
              error={queryError}
              hint={hint}
              initialQuery={initialQuery}
              history={history}
              onClickHintFix={this.onClickHintFix}
              onPressEnter={this.onExecuteQuery}
              onQueryChange={this.onChangeQuery}
            />
          ) : (
            <QueryEditor
              datasource={datasourceInstance}
              error={queryError}
              onQueryChange={this.onChangeQuery}
              onExecuteQuery={this.onExecuteQuery}
              initialQuery={initialQuery}
              exploreEvents={exploreEvents}
              range={range}
            />
          )}
        </div>
        <div className="query-row-tools">
          <button className="btn navbar-button navbar-button--tight" onClick={this.onClickClearButton}>
            <i className="fa fa-times" />
          </button>
          <button className="btn navbar-button navbar-button--tight" onClick={this.onClickAddButton}>
            <i className="fa fa-plus" />
          </button>
          <button className="btn navbar-button navbar-button--tight" onClick={this.onClickRemoveButton}>
            <i className="fa fa-minus" />
          </button>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state: StoreState, { exploreId, index }) {
  const explore = state.explore;
  const item: ExploreItemState = explore[exploreId];
  const { datasourceInstance, history, initialQueries, queryTransactions, range } = item;
  const initialQuery = initialQueries[index];
  return { datasourceInstance, history, initialQuery, queryTransactions, range };
}

const mapDispatchToProps = {
  addQueryRow,
  changeQuery,
  highlightLogsExpression,
  modifyQueries,
  removeQueryRow,
  runQueries,
};

export default hot(module)(connect(mapStateToProps, mapDispatchToProps)(QueryRow));
