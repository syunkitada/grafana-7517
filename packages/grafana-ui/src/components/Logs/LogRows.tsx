import React, { PureComponent } from 'react';
import memoizeOne from 'memoize-one';
import { LogsModel, TimeZone, LogsDedupStrategy, LogRowModel } from '@grafana/data';

import { Themeable } from '../../types/theme';
import { withTheme } from '../../themes/index';
import { getLogRowStyles } from './getLogRowStyles';

//Components
import { LogRow } from './LogRow';

export const PREVIEW_LIMIT = 100;
export const RENDER_LIMIT = 500;

export interface Props extends Themeable {
  data: LogsModel;
  dedupStrategy: LogsDedupStrategy;
  highlighterExpressions: string[];
  showTime: boolean;
  timeZone: TimeZone;
  deduplicatedData?: LogsModel;
  rowLimit?: number;
  isLogsPanel?: boolean;
  previewLimit?: number;
  onClickFilterLabel?: (key: string, value: string) => void;
  onClickFilterOutLabel?: (key: string, value: string) => void;
  getRowContext?: (row: LogRowModel, options?: any) => Promise<any>;
}

interface State {
  renderAll: boolean;
}

class UnThemedLogRows extends PureComponent<Props, State> {
  renderAllTimer: number | null = null;

  static defaultProps = {
    previewLimit: PREVIEW_LIMIT,
    rowLimit: RENDER_LIMIT,
  };

  state: State = {
    renderAll: false,
  };

  componentDidMount() {
    // Staged rendering
    const { data, previewLimit } = this.props;
    const rowCount = data ? data.rows.length : 0;
    // Render all right away if not too far over the limit
    const renderAll = rowCount <= previewLimit! * 2;
    if (renderAll) {
      this.setState({ renderAll });
    } else {
      this.renderAllTimer = window.setTimeout(() => this.setState({ renderAll: true }), 2000);
    }
  }

  componentWillUnmount() {
    if (this.renderAllTimer) {
      clearTimeout(this.renderAllTimer);
    }
  }

  makeGetRows = memoizeOne((processedRows: LogRowModel[]) => {
    return () => processedRows;
  });

  render() {
    const {
      dedupStrategy,
      showTime,
      data,
      deduplicatedData,
      highlighterExpressions,
      timeZone,
      onClickFilterLabel,
      onClickFilterOutLabel,
      rowLimit,
      theme,
      isLogsPanel,
      previewLimit,
    } = this.props;
    const { renderAll } = this.state;
    const dedupedData = deduplicatedData ? deduplicatedData : data;
    const hasData = data && data.rows && data.rows.length > 0;
    const dedupCount = dedupedData
      ? dedupedData.rows.reduce((sum, row) => (row.duplicates ? sum + row.duplicates : sum), 0)
      : 0;
    const showDuplicates = dedupStrategy !== LogsDedupStrategy.none && dedupCount > 0;

    // Staged rendering
    const processedRows = dedupedData ? dedupedData.rows : [];
    const firstRows = processedRows.slice(0, previewLimit!);
    const rowCount = Math.min(processedRows.length, rowLimit!);
    const lastRows = processedRows.slice(previewLimit!, rowCount);

    // React profiler becomes unusable if we pass all rows to all rows and their labels, using getter instead
    const getRows = this.makeGetRows(processedRows);
    const getRowContext = this.props.getRowContext ? this.props.getRowContext : () => Promise.resolve([]);
    const { logsRows } = getLogRowStyles(theme);

    return (
      <div className={logsRows}>
        {hasData &&
          firstRows.map((row, index) => (
            <LogRow
              key={row.uid}
              getRows={getRows}
              getRowContext={getRowContext}
              highlighterExpressions={highlighterExpressions}
              row={row}
              showDuplicates={showDuplicates}
              showTime={showTime}
              timeZone={timeZone}
              isLogsPanel={isLogsPanel}
              onClickFilterLabel={onClickFilterLabel}
              onClickFilterOutLabel={onClickFilterOutLabel}
            />
          ))}
        {hasData &&
          renderAll &&
          lastRows.map((row, index) => (
            <LogRow
              key={row.uid}
              getRows={getRows}
              getRowContext={getRowContext}
              row={row}
              showDuplicates={showDuplicates}
              showTime={showTime}
              timeZone={timeZone}
              isLogsPanel={isLogsPanel}
              onClickFilterLabel={onClickFilterLabel}
              onClickFilterOutLabel={onClickFilterOutLabel}
            />
          ))}
        {hasData && !renderAll && <span>Rendering {rowCount - previewLimit!} rows...</span>}
      </div>
    );
  }
}

export const LogRows = withTheme(UnThemedLogRows);
LogRows.displayName = 'LogsRows';
