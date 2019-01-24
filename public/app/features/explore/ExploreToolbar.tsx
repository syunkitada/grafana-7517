import React, { PureComponent } from 'react';
import { ExploreId } from 'app/types/explore';
import { DataSourceSelectItem, RawTimeRange, TimeRange } from '@grafana/ui';
import TimePicker from './TimePicker';
import { DataSourcePicker } from 'app/core/components/Select/DataSourcePicker';

interface Props {
  datasourceMissing: boolean;
  exploreDatasources: DataSourceSelectItem[];
  exploreId: ExploreId;
  loading: boolean;
  range: RawTimeRange;
  selectedDatasource: DataSourceSelectItem;
  splitted: boolean;
  onChangeDatasource: (option) => void;
  onClearAll: () => void;
  onCloseSplit: () => void;
  onChangeTime: (range: TimeRange, changedByScanner?: boolean) => void;
  onRunQuery: () => void;
  onSplit: () => void;
}

const createDatasourcePicker = (props: Props) => {
  const { exploreDatasources, selectedDatasource } = props;

  return (
    <DataSourcePicker
      onChange={props.onChangeDatasource}
      datasources={exploreDatasources}
      current={selectedDatasource}
    />
  );
};

const createResponsiveButton = (options: {
  splitted: boolean;
  title: string;
  onClick: () => void;
  buttonClassName?: string;
  iconClassName?: string;
}) => {
  const { title, onClick, buttonClassName, iconClassName, splitted } = options;

  return (
    <button className={`btn navbar-button ${buttonClassName ? buttonClassName : ''}`} onClick={onClick}>
      <span className="btn-title">{!splitted ? title : ''}</span>
      {iconClassName ? <i className={iconClassName} /> : null}
    </button>
  );
};

const createSplittedClassName = (options: { splitted: boolean; className: string }) => {
  const { className, splitted } = options;

  return splitted ? `${className}-splitted` : className;
};

export class ExploreToolbar extends PureComponent<Props, {}> {
  /**
   * Timepicker to control scanning
   */
  timepickerRef: React.RefObject<TimePicker>;

  constructor(props) {
    super(props);
    this.timepickerRef = React.createRef();
  }

  render() {
    const { datasourceMissing, exploreId, loading, range, splitted } = this.props;
    const toolbar = createSplittedClassName({ splitted, className: 'toolbar' });
    const toolbarItem = createSplittedClassName({ splitted, className: 'toolbar-item' });
    const toolbarHeader = createSplittedClassName({ splitted, className: 'toolbar-header' });
    const timepicker = createSplittedClassName({ splitted, className: 'toolbar-content-item timepicker' });

    return (
      <div className={toolbar}>
        <div className={toolbarItem}>
          <div className={toolbarHeader}>
            <div className="toolbar-header-title">
              {exploreId === 'left' && (
                <a className="navbar-page-btn">
                  <i className="fa fa-rocket fa-fw" />
                  Explore
                </a>
              )}
            </div>
            <div className="toolbar-header-datasource large-screens">
              <div className="datasource-picker">
                {!datasourceMissing && !splitted ? createDatasourcePicker(this.props) : null}
              </div>
            </div>
            <div className="toolbar-header-close">
              {exploreId === 'right' && (
                <button className="btn navbar-button" onClick={this.props.onCloseSplit}>
                  Close Split
                </button>
              )}
            </div>
          </div>
        </div>
        <div className={toolbarItem}>
          {!datasourceMissing && splitted ? (
            <div className="datasource-picker">{createDatasourcePicker(this.props)}</div>
          ) : null}
        </div>
        <div className={toolbarItem}>
          <div className="toolbar-content">
            {!datasourceMissing && !splitted ? (
              <div className="toolbar-content-item small-screens">
                <div className="datasource-picker">{createDatasourcePicker(this.props)}</div>
              </div>
            ) : null}
            {exploreId === 'left' && !splitted ? (
              <div className="toolbar-content-item">
                {createResponsiveButton({
                  splitted,
                  title: 'Split',
                  onClick: this.props.onSplit,
                  iconClassName: 'fa fa-fw fa-columns',
                })}
              </div>
            ) : null}
            <div className={timepicker}>
              <TimePicker ref={this.timepickerRef} range={range} onChangeTime={this.props.onChangeTime} />
            </div>
            <div className="toolbar-content-item">
              <button className="btn navbar-button navbar-button--no-icon" onClick={this.props.onClearAll}>
                Clear All
              </button>
            </div>
            <div className="toolbar-content-item">
              {createResponsiveButton({
                splitted,
                title: 'Run Query',
                onClick: this.props.onRunQuery,
                buttonClassName: 'navbar-button--primary',
                iconClassName: loading ? 'fa fa-spinner fa-fw fa-spin run-icon' : 'fa fa-level-down fa-fw run-icon',
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
