import React from 'react';
import ReactDOM from 'react-dom';
import Drop from 'tether-drop';
import { ColorPickerPopover } from './ColorPickerPopover';

export interface Props {
  color: string;
  onChange: (c: string) => void;
}

export class ColorPicker extends React.Component<Props, any> {
  pickerElem: HTMLElement | null;
  colorPickerDrop: any;

  openColorPicker = () => {
    const dropContent = <ColorPickerPopover color={this.props.color} onColorSelect={this.onColorSelect} />;

    const dropContentElem = document.createElement('div');
    ReactDOM.render(dropContent, dropContentElem);

    const drop = new Drop({
      target: this.pickerElem,
      content: dropContentElem,
      position: 'top center',
      classes: 'drop-popover',
      openOn: 'click',
      hoverCloseDelay: 200,
      tetherOptions: {
        constraints: [{ to: 'scrollParent', attachment: 'none both' }],
      },
    });

    drop.on('close', this.closeColorPicker);

    this.colorPickerDrop = drop;
    this.colorPickerDrop.open();
  };

  closeColorPicker = () => {
    setTimeout(() => {
      if (this.colorPickerDrop && this.colorPickerDrop.tether) {
        this.colorPickerDrop.destroy();
      }
    }, 100);
  };

  onColorSelect = (color: string) => {
    this.props.onChange(color);
  };

  render() {
    return (
      <div className="sp-replacer sp-light" onClick={this.openColorPicker} ref={element => (this.pickerElem = element)}>
        <div className="sp-preview">
          <div className="sp-preview-inner" style={{ backgroundColor: this.props.color }} />
        </div>
      </div>
    );
  }
}
