import React, { useCallback } from 'react';
import { TooltipPlugin, ZoomPlugin, GraphNG, GraphNGLegendEvent } from '@grafana/ui';
import { PanelProps } from '@grafana/data';
import { Options } from './types';
import { AnnotationsPlugin } from './plugins/AnnotationsPlugin';
import { ExemplarsPlugin } from './plugins/ExemplarsPlugin';
import { ContextMenuPlugin } from './plugins/ContextMenuPlugin';
import { hideSeriesConfigFactory } from './overrides/hideSeriesConfigFactory';
import { changeSeriesColorConfigFactory } from './overrides/colorSeriesConfigFactory';

interface TimeSeriesPanelProps extends PanelProps<Options> {}

export const TimeSeriesPanel: React.FC<TimeSeriesPanelProps> = ({
  data,
  timeRange,
  timeZone,
  width,
  height,
  options,
  fieldConfig,
  onChangeTimeRange,
  onFieldConfigChange,
  replaceVariables,
}) => {
  const onLegendClick = useCallback(
    (event: GraphNGLegendEvent) => {
      onFieldConfigChange(hideSeriesConfigFactory(event, fieldConfig, data.series));
    },
    [fieldConfig, onFieldConfigChange, data.series]
  );

  const onSeriesColorChange = useCallback(
    (label: string, color: string) => {
      onFieldConfigChange(changeSeriesColorConfigFactory(label, color, fieldConfig));
    },
    [fieldConfig, onFieldConfigChange]
  );

  return (
    <GraphNG
      data={data.series}
      timeRange={timeRange}
      timeZone={timeZone}
      width={width}
      height={height}
      legend={options.legend}
      onLegendClick={onLegendClick}
      onSeriesColorChange={onSeriesColorChange}
    >
      <TooltipPlugin mode={options.tooltipOptions.mode as any} timeZone={timeZone} />
      <ZoomPlugin onZoom={onChangeTimeRange} />
      <ContextMenuPlugin timeZone={timeZone} replaceVariables={replaceVariables} />
      {data.annotations ? <ExemplarsPlugin exemplars={data.annotations} timeZone={timeZone} /> : <></>}
      {data.annotations ? <AnnotationsPlugin annotations={data.annotations} timeZone={timeZone} /> : <></>}
    </GraphNG>
  );
};
