﻿import React, { PureComponent } from 'react';
import * as PopperJS from 'popper.js';
import { Manager, Popper as ReactPopper } from 'react-popper';
import { Portal } from '@grafana/ui';
import Transition from 'react-transition-group/Transition';

export enum Themes {
  Default = 'popper__background--default',
  Error = 'popper__background--error',
}

const defaultTransitionStyles = {
  transition: 'opacity 200ms linear',
  opacity: 0,
};

const transitionStyles: {[key: string]: object} = {
  exited: { opacity: 0 },
  entering: { opacity: 0 },
  entered: { opacity: 1 },
  exiting: { opacity: 0 },
};

interface Props extends React.DOMAttributes<HTMLDivElement> {
  renderContent: (content: any) => any;
  show: boolean;
  placement?: PopperJS.Placement;
  content: string | ((props: any) => JSX.Element);
  refClassName?: string;
  referenceElement: PopperJS.ReferenceObject;
  theme?: Themes;
}

class Popper extends PureComponent<Props> {
  render() {
    const { renderContent, show, placement, onMouseEnter, onMouseLeave, theme } = this.props;
    const { content } = this.props;

    const popperBackgroundClassName = 'popper__background' + (theme ? ' ' + theme : '');

    return (
      <Manager>
        <Transition in={show} timeout={100} mountOnEnter={true} unmountOnExit={true}>
          {transitionState => (
            <Portal>
              <ReactPopper placement={placement} referenceElement={this.props.referenceElement}>
                {({ ref, style, placement, arrowProps }) => {
                  return (
                    <div
                      onMouseEnter={onMouseEnter}
                      onMouseLeave={onMouseLeave}
                      ref={ref}
                      style={{
                        ...style,
                        ...defaultTransitionStyles,
                        ...transitionStyles[transitionState],
                      }}
                      data-placement={placement}
                      className="popper"
                    >
                      <div className={popperBackgroundClassName}>
                        {renderContent(content)}
                        <div ref={arrowProps.ref} data-placement={placement} className="popper__arrow" />
                      </div>
                    </div>
                  );
                }}
              </ReactPopper>
            </Portal>
          )}
        </Transition>
      </Manager>
    );
  }
}

export default Popper;
