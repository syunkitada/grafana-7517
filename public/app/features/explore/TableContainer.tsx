import React, { PureComponent } from 'react';
import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';

import { ExploreId, ExploreItemState } from 'app/types/explore';
import { StoreState } from 'app/types';

import { clickTableButton } from './state/actions';
import Table from './Table';
import Panel from './Panel';
import TableModel from 'app/core/table_model';

interface TableContainerProps {
  clickTableButton: typeof clickTableButton;
  exploreId: ExploreId;
  loading: boolean;
  onClickLabel: (key: string, value: string) => void;
  showingTable: boolean;
  tableResult?: TableModel;
}

export class TableContainer extends PureComponent<TableContainerProps> {
  onClickTableButton = () => {
    this.props.clickTableButton(this.props.exploreId);
  };

  render() {
    const { loading, onClickLabel, showingTable, tableResult } = this.props;
    return (
      <Panel label="Table" loading={loading} isOpen={showingTable} onToggle={this.onClickTableButton}>
        <Table data={tableResult} loading={loading} onClickCell={onClickLabel} />
      </Panel>
    );
  }
}

function mapStateToProps(state: StoreState, { exploreId }) {
  const explore = state.explore;
  const item: ExploreItemState = explore[exploreId];
  const { queryTransactions, showingTable, tableResult } = item;
  const loading = queryTransactions.some(qt => qt.resultType === 'Table' && !qt.done);
  return { loading, showingTable, tableResult };
}

const mapDispatchToProps = {
  clickTableButton,
};

export default hot(module)(connect(mapStateToProps, mapDispatchToProps)(TableContainer));
