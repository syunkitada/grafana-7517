import React from 'react';
import { hot } from 'react-hot-loader';
import ReactGridLayout from 'react-grid-layout';
import { GRID_CELL_HEIGHT, GRID_CELL_VMARGIN, GRID_COLUMN_COUNT } from 'app/core/constants';
import { DashboardPanel } from './DashboardPanel';
import { DashboardModel } from '../dashboard_model';
import { PanelModel } from '../panel_model';
import classNames from 'classnames';
import sizeMe from 'react-sizeme';
import { Google } from 'grafana-ui';

console.log(Google);

let lastGridWidth = 1200;
let ignoreNextWidthChange = false;

function GridWrapper({
  size,
  layout,
  onLayoutChange,
  children,
  onDragStop,
  onResize,
  onResizeStop,
  onWidthChange,
  className,
  isResizable,
  isDraggable,
  isFullscreen,
}) {
  const width = size.width > 0 ? size.width : lastGridWidth;

  // logic to ignore width changes (optimization)
  if (width !== lastGridWidth) {
    if (ignoreNextWidthChange) {
      ignoreNextWidthChange = false;
    } else if (!isFullscreen && Math.abs(width - lastGridWidth) > 8) {
      onWidthChange();
      lastGridWidth = width;
    }
  }

  return (
    <ReactGridLayout
      width={lastGridWidth}
      className={className}
      isDraggable={isDraggable}
      isResizable={isResizable}
      measureBeforeMount={false}
      containerPadding={[0, 0]}
      useCSSTransforms={false}
      margin={[GRID_CELL_VMARGIN, GRID_CELL_VMARGIN]}
      cols={GRID_COLUMN_COUNT}
      rowHeight={GRID_CELL_HEIGHT}
      draggableHandle=".grid-drag-handle"
      layout={layout}
      onResize={onResize}
      onResizeStop={onResizeStop}
      onDragStop={onDragStop}
      onLayoutChange={onLayoutChange}
    >
      {children}
    </ReactGridLayout>
  );
}

const SizedReactLayoutGrid = sizeMe({ monitorWidth: true })(GridWrapper);

export interface DashboardGridProps {
  dashboard: DashboardModel;
}

export class DashboardGrid extends React.Component<DashboardGridProps> {
  gridToPanelMap: any;
  panelMap: { [id: string]: PanelModel };

  constructor(props) {
    super(props);
    this.onLayoutChange = this.onLayoutChange.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onResizeStop = this.onResizeStop.bind(this);
    this.onDragStop = this.onDragStop.bind(this);
    this.onWidthChange = this.onWidthChange.bind(this);

    // subscribe to dashboard events
    const dashboard = this.props.dashboard;
    dashboard.on('panel-added', this.triggerForceUpdate.bind(this));
    dashboard.on('panel-removed', this.triggerForceUpdate.bind(this));
    dashboard.on('repeats-processed', this.triggerForceUpdate.bind(this));
    dashboard.on('view-mode-changed', this.onViewModeChanged.bind(this));
    dashboard.on('row-collapsed', this.triggerForceUpdate.bind(this));
    dashboard.on('row-expanded', this.triggerForceUpdate.bind(this));
  }

  buildLayout() {
    const layout = [];
    this.panelMap = {};

    for (const panel of this.props.dashboard.panels) {
      const stringId = panel.id.toString();
      this.panelMap[stringId] = panel;

      if (!panel.gridPos) {
        console.log('panel without gridpos');
        continue;
      }

      const panelPos: any = {
        i: stringId,
        x: panel.gridPos.x,
        y: panel.gridPos.y,
        w: panel.gridPos.w,
        h: panel.gridPos.h,
      };

      if (panel.type === 'row') {
        panelPos.w = GRID_COLUMN_COUNT;
        panelPos.h = 1;
        panelPos.isResizable = false;
        panelPos.isDraggable = panel.collapsed;
      }

      layout.push(panelPos);
    }

    return layout;
  }

  onLayoutChange(newLayout) {
    for (const newPos of newLayout) {
      this.panelMap[newPos.i].updateGridPos(newPos);
    }

    this.props.dashboard.sortPanelsByGridPos();
  }

  triggerForceUpdate() {
    this.forceUpdate();
  }

  onWidthChange() {
    for (const panel of this.props.dashboard.panels) {
      panel.resizeDone();
    }
  }

  onViewModeChanged(payload) {
    ignoreNextWidthChange = true;
    this.forceUpdate();
  }

  updateGridPos(item, layout) {
    this.panelMap[item.i].updateGridPos(item);

    // react-grid-layout has a bug (#670), and onLayoutChange() is only called when the component is mounted.
    // So it's required to call it explicitly when panel resized or moved to save layout changes.
    this.onLayoutChange(layout);
  }

  onResize(layout, oldItem, newItem) {
    this.panelMap[newItem.i].updateGridPos(newItem);
  }

  onResizeStop(layout, oldItem, newItem) {
    this.updateGridPos(newItem, layout);
    this.panelMap[newItem.i].resizeDone();
  }

  onDragStop(layout, oldItem, newItem) {
    this.updateGridPos(newItem, layout);
  }

  renderPanels() {
    const panelElements = [];

    for (const panel of this.props.dashboard.panels) {
      const panelClasses = classNames({ 'react-grid-item--fullscreen': panel.fullscreen });
      panelElements.push(
        <div key={panel.id.toString()} className={panelClasses} id={`panel-${panel.id}`}>
          <DashboardPanel
            panel={panel}
            dashboard={this.props.dashboard}
            isEditing={panel.isEditing}
            isFullscreen={panel.fullscreen}
          />
        </div>
      );
    }

    return panelElements;
  }

  render() {
    return (
      <SizedReactLayoutGrid
        className={classNames({ layout: true })}
        layout={this.buildLayout()}
        isResizable={this.props.dashboard.meta.canEdit}
        isDraggable={this.props.dashboard.meta.canEdit}
        onLayoutChange={this.onLayoutChange}
        onWidthChange={this.onWidthChange}
        onDragStop={this.onDragStop}
        onResize={this.onResize}
        onResizeStop={this.onResizeStop}
        isFullscreen={this.props.dashboard.meta.fullscreen}
      >
        {this.renderPanels()}
      </SizedReactLayoutGrid>
    );
  }
}

export default hot(module)(DashboardGrid);
