import React from 'react';
import NamedColorsPicker from './NamedColorsPalette';
import { getColorName } from '../..//utils/colorsPalette';
import { ColorPickerProps } from './ColorPicker';
import { GrafanaTheme, Themeable } from '../../types';
import { PopperContentProps } from '../Tooltip/PopperController';
import SpectrumPalette from './SpectrumPalette';

export interface Props extends ColorPickerProps, Themeable, PopperContentProps {}

type PickerType = 'palette' | 'spectrum';

interface State {
  activePicker: PickerType;
}

export class ColorPickerPopover extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      activePicker: 'palette',
    };
  }

  handleSpectrumColorSelect = (color: any) => {
    this.props.onChange(color);
  };

  renderPicker = () => {
    const { activePicker } = this.state;
    const { color, onChange, theme } = this.props;

    return activePicker === 'spectrum' ? (
      <SpectrumPalette color={color} onChange={this.handleSpectrumColorSelect} />
    ) : (
      <NamedColorsPicker color={getColorName(color)} onChange={onChange} theme={theme} />
    );
  };

  render() {
    const { activePicker } = this.state;
    const { theme, children, updatePopperPosition } = this.props;
    const colorPickerTheme = theme || GrafanaTheme.Dark;

    return (
      <div className={`ColorPickerPopover ColorPickerPopover--${colorPickerTheme}`}>
        <div className="ColorPickerPopover__tabs">
          <div
            className={`ColorPickerPopover__tab ${activePicker === 'palette' && 'ColorPickerPopover__tab--active'}`}
            onClick={() => {
              this.setState({ activePicker: 'palette' }, () => {
                if (updatePopperPosition) {
                  updatePopperPosition();
                }
              });
            }}
          >
            Default
          </div>
          <div
            className={`ColorPickerPopover__tab ${activePicker === 'spectrum' && 'ColorPickerPopover__tab--active'}`}
            onClick={() => {
              this.setState({ activePicker: 'spectrum' }, () => {
                if (updatePopperPosition) {
                  updatePopperPosition();
                }
              });
            }}
          >
            Custom
          </div>
        </div>

        <div className="ColorPickerPopover__content">
          {this.renderPicker()}
          {children}
        </div>
      </div>
    );
  }
}
