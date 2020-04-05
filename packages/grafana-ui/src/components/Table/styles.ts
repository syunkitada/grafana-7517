import { css } from 'emotion';
import { GrafanaTheme } from '@grafana/data';
import { stylesFactory } from '../../themes';

export interface TableStyles {
  cellHeight: number;
  cellHeightInner: number;
  cellPadding: number;
  rowHeight: number;
  table: string;
  thead: string;
  headerCell: string;
  tableCell: string;
  row: string;
  theme: GrafanaTheme;
}

export const getTableStyles = stylesFactory(
  (theme: GrafanaTheme): TableStyles => {
    const colors = theme.colors;
    const headerBg = theme.isLight ? colors.gray98 : colors.gray15;
    const padding = 6;
    const lineHeight = theme.typography.lineHeight.md;
    const bodyFontSize = 14;
    const cellHeight = padding * 2 + bodyFontSize * lineHeight;

    return {
      theme,
      cellHeight,
      cellPadding: padding,
      cellHeightInner: bodyFontSize * lineHeight,
      rowHeight: cellHeight + 2,
      table: css`
        height: 100%;
        width: 100%;
        overflow: auto;
        display: flex;
      `,
      thead: css`
        label: thead;
        overflow-y: auto;
        overflow-x: hidden;
        background: ${headerBg};
      `,
      headerCell: css`
        padding: ${padding}px 10px;
        cursor: pointer;
        white-space: nowrap;
        color: ${colors.blue};
      `,
      row: css`
        label: row;
        border-bottom: 1px solid ${headerBg};
      `,
      tableCell: css`
        padding: ${padding}px 10px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
      `,
    };
  }
);
