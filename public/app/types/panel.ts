import { TimeSeries, TimeRange } from './series';
import { LoadingState } from '@grafana/ui';

export interface PanelProps<T = any> {
  timeSeries: TimeSeries[];
  timeRange: TimeRange;
  loading: LoadingState;
  options: T;
  renderCounter: number;
  width: number;
  height: number;
}

export interface PanelOptionsProps<T = any> {
  options: T;
  onChange: (options: T) => void;
}

export interface PanelSize {
  width: number;
  height: number;
}

export interface PanelMenuItem {
  type?: 'submenu' | 'divider';
  text?: string;
  iconClassName?: string;
  onClick?: () => void;
  shortcut?: string;
  subMenu?: PanelMenuItem[];
}

export interface Threshold {
  index: number;
  value: number;
  color?: string;
}

export enum MappingType {
  ValueToText = 1,
  RangeToText = 2,
}

export enum BasicGaugeColor {
  Green = '#299c46',
  Red = '#d44a3a',
}

interface BaseMap {
  id: number;
  operator: string;
  text: string;
  type: MappingType;
}

export interface ValueMap extends BaseMap {
  value: string;
}

export interface RangeMap extends BaseMap {
  from: string;
  to: string;
}
