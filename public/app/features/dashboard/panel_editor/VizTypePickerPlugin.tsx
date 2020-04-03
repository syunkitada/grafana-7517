import React from 'react';
import { GrafanaTheme, PanelPluginMeta } from '@grafana/data';
import { stylesFactory, useTheme } from '@grafana/ui';
import { css, cx } from 'emotion';
import tinycolor from 'tinycolor2';

interface Props {
  isCurrent: boolean;
  plugin: PanelPluginMeta;
  onClick: () => void;
  disabled: boolean;
}

const VizTypePickerPlugin: React.FC<Props> = ({ isCurrent, plugin, onClick, disabled }) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const cssClass = cx({
    [styles.item]: true,
    [styles.current]: isCurrent,
    [styles.disabled]: disabled,
  });

  return (
    <div className={cssClass} onClick={disabled ? () => {} : onClick} title={plugin.name}>
      <div className={styles.name}>{plugin.name}</div>
      <img className={styles.img} src={plugin.info.logos.small} />
    </div>
  );
};

const getStyles = stylesFactory((theme: GrafanaTheme) => {
  const itemBorder = `1px solid ${theme.isLight ? theme.colors.gray3 : theme.colors.dark10}`;
  return {
    item: css`
      background: ${theme.isLight ? theme.colors.white : theme.colors.gray05};
      border: ${itemBorder};
      border-radius: 3px;
      height: 100px;
      width: 100%;
      max-width: 200px;
      flex-shrink: 0;
      flex-direction: column;
      text-align: center;
      cursor: pointer;
      display: flex;
      margin-right: 10px;
      margin-bottom: 10px;
      align-items: center;
      justify-content: center;
      padding-bottom: 6px;
      transition: transform 1 ease;
      &:hover {
        box-shadow: 0 0 4px ${theme.colors.blueLight};
        background: ${theme.isLight
          ? tinycolor(theme.colors.blueBase)
              .lighten(45)
              .toHexString()
          : tinycolor(theme.colors.blueBase)
              .darken(46)
              .toHexString()};
        border: 1px solid ${theme.colors.blueLight};
      }
    `,
    current: css`
      box-shadow: 0 0 6px ${theme.colors.orange} !important;
      border: 1px solid ${theme.colors.orange} !important;
      background: ${theme.isLight ? theme.colors.white : theme.colors.gray05};
    `,
    disabled: css`
      opacity: 0.2;
      filter: grayscale(1);
      cursor: default;
      &:hover {
        box-shadow: none;
        border: ${itemBorder};
      }
    `,
    name: css`
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      font-size: ${theme.typography.size.sm};
      display: flex;
      flex-direction: column;
      align-self: center;
      height: 23px;
      font-weight: ${theme.typography.weight.semibold};
    `,
    img: css`
      height: 55px;
    `,
  };
});

export default VizTypePickerPlugin;
