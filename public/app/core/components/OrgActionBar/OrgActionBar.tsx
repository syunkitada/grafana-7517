import React, { PureComponent } from 'react';
import LayoutSelector, { LayoutMode } from '../LayoutSelector/LayoutSelector';

export interface Props {
  searchQuery: string;
  layoutMode?: LayoutMode;
  showLayoutMode: boolean;
  setLayoutMode?: (mode: LayoutMode) => {};
  setSearchQuery: (value: string) => {};
  linkButton: { href: string; title: string };
}

export default class OrgActionBar extends PureComponent<Props> {
  render() {
    const { searchQuery, layoutMode, setLayoutMode, linkButton, setSearchQuery, showLayoutMode } = this.props;

    return (
      <div className="page-action-bar">
        <div className="gf-form gf-form--grow">
          <label className="gf-form--has-input-icon">
            <input
              type="text"
              className="gf-form-input width-20"
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
              placeholder="Filter by name or type"
            />
            <i className="gf-form-input-icon fa fa-search" />
          </label>
          {showLayoutMode && (
            <LayoutSelector mode={layoutMode} onLayoutModeChanged={(mode: LayoutMode) => setLayoutMode(mode)} />
          )}
        </div>
        <div className="page-action-bar__spacer" />
        <a className="btn btn-success" href={linkButton.href} target="_blank">
          {linkButton.title}
        </a>
      </div>
    );
  }
}
