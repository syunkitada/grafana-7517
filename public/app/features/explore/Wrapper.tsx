import React, { Component } from 'react';
import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';

import { updateLocation } from 'app/core/actions';
import { StoreState } from 'app/types';
import { ExploreId, ExploreUrlState } from 'app/types/explore';
import { parseUrlState } from 'app/core/utils/explore';

import { initializeExploreSplit } from './state/actions';
import ErrorBoundary from './ErrorBoundary';
import Explore from './Explore';

interface WrapperProps {
  initializeExploreSplit: typeof initializeExploreSplit;
  split: boolean;
  updateLocation: typeof updateLocation;
  urlStates: { [key: string]: string };
}

export class Wrapper extends Component<WrapperProps> {
  initialSplit: boolean;
  urlStates: { [key: string]: ExploreUrlState };

  constructor(props: WrapperProps) {
    super(props);
    this.urlStates = {};
    const { left, right } = props.urlStates;
    if (props.urlStates.left) {
      this.urlStates.leftState = parseUrlState(left);
    }
    if (props.urlStates.right) {
      this.urlStates.rightState = parseUrlState(right);
      this.initialSplit = true;
    }
  }

  componentDidMount() {
    if (this.initialSplit) {
      this.props.initializeExploreSplit();
    }
  }

  render() {
    const { split } = this.props;
    const { leftState, rightState } = this.urlStates;

    return (
      <div className="explore-wrapper">
        <ErrorBoundary>
          <Explore exploreId={ExploreId.left} urlState={leftState} />
        </ErrorBoundary>
        {split && (
          <ErrorBoundary>
            <Explore exploreId={ExploreId.right} urlState={rightState} />
          </ErrorBoundary>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state: StoreState) => {
  const urlStates = state.location.query;
  const { split } = state.explore;
  return { split, urlStates };
};

const mapDispatchToProps = {
  initializeExploreSplit,
  updateLocation,
};

export default hot(module)(connect(mapStateToProps, mapDispatchToProps)(Wrapper));
