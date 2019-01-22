import React, { FunctionComponent } from 'react';
import { storiesOf } from '@storybook/react';
import NamedColorsPicker from './NamedColorsPicker';
import { Color, getColorName } from '@grafana/ui/src/utils/colorsPalette';
import { withKnobs, select } from '@storybook/addon-knobs';

const CenteredStory: FunctionComponent<{}> = ({ children }) => {
  return (
    <div
      style={{
        height: '100vh  ',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </div>
  );
};

interface StateHolderProps<T> {
  initialState: T;
  children: (currentState: T, updateState: (nextState: T) => void) => JSX.Element;
}

class UseState<T> extends React.Component<StateHolderProps<T>, { value: T }> {
  constructor(props: StateHolderProps<T>) {
    super(props);
    this.state = {
      value: props.initialState,
    };
  }
  static getDerivedStateFromProps(props: StateHolderProps<{}>, state: { value: {} }) {
    return {
      value: props.initialState,
    };
  }

  handleStateUpdate = (nextState: T) => {
    this.setState({ value: nextState });
  };
  render() {
    return this.props.children(this.state.value, this.handleStateUpdate);
  }
}

storiesOf('UI/NamedColorPicker', module)
  .addDecorator(withKnobs)
  .addDecorator(story => <CenteredStory>{story()}</CenteredStory>)
  .add('Named colors swatch - support for named colors', () => {
    const selectedColor = select(
      'Selected color',
      {
        Green: 'green',
        Red: 'red',
        'Light blue': 'light-blue',
      },
      'green'
    );

    return (
      <UseState initialState={selectedColor}>
        {(selectedColor, updateSelectedColor) => {
          console.log(selectedColor);
          return (
            <NamedColorsPicker
              selectedColor={selectedColor as Color}
              onChange={color => {
                // @ts-ignore
                updateSelectedColor((color).name);
              }}
            />
          );
        }}
      </UseState>
    );
  })
  .add('Named colors swatch - support for hex values', () => {
    return (
      <UseState initialState="#00ff00">
        {(selectedColor, updateSelectedColor) => {
          return (
            <NamedColorsPicker
              selectedColor={getColorName(selectedColor)}
              onChange={color => updateSelectedColor(color.variants.dark)}
            />
          );
        }}
      </UseState>
    );
  });
