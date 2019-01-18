﻿import React, { PureComponent } from 'react';
import * as PopperJS from 'popper.js';
import { Manager, Popper as ReactPopper } from 'react-popper';
import { Portal } from '@grafana/ui';
import Transition from 'react-transition-group/Transition';

const defaultTransitionStyles = {
  transition: 'opacity 200ms linear',
  opacity: 0,
};

const transitionStyles: { [key: string]: object } = {
  exited: { opacity: 0 },
  entering: { opacity: 0 },
  entered: { opacity: 1 },
  exiting: { opacity: 0 },
};

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  renderContent: (content: any) => any;
  show: boolean;
  placement?: PopperJS.Placement;
  content: string | ((props: any) => JSX.Element);
  referenceElement: PopperJS.ReferenceObject;
  arrowClassName?: string;
}

class Popper extends PureComponent<Props> {
  render() {
    const { renderContent, show, placement, onMouseEnter, onMouseLeave, className, arrowClassName } = this.props;
    const { content } = this.props;

    return (
      <Manager>
        <Transition in={show} timeout={100} mountOnEnter={true} unmountOnExit={true}>
          {transitionState => (
            <Portal>
              <ReactPopper
                placement={placement}
                referenceElement={this.props.referenceElement}
                // TODO: move modifiers config to popper controller
                modifiers={{ preventOverflow: { enabled: true, boundariesElement: 'window' } }}
              >
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
                      className={`popper`}
                    >
                      <div className={className}>
                        {renderContent(content)}
                        <div
                          ref={arrowProps.ref}
                          style={{ ...arrowProps.style }}
                          data-placement={placement}
                          className={arrowClassName}
                        />
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
