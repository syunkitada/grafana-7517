// Libraries
import React, { PureComponent } from 'react';

// Components
import { CustomScrollbar } from '@grafana/ui';
import { FadeIn } from 'app/core/components/Animations/FadeIn';
import { PanelOptionSection } from './PanelOptionSection';

interface Props {
  children: JSX.Element;
  heading: string;
  renderToolbar?: () => JSX.Element;
  toolbarItems?: EditorToolbarView[];
}

export interface EditorToolbarView {
  title?: string;
  heading?: string;
  icon?: string;
  disabled?: boolean;
  onClick?: () => void;
  render?: () => JSX.Element;
  action?: () => void;
  btnType?: 'danger';
}

interface State {
  openView?: EditorToolbarView;
  isOpen: boolean;
  fadeIn: boolean;
}

export class EditorTabBody extends PureComponent<Props, State> {
  static defaultProps = {
    toolbarItems: [],
  };

  constructor(props) {
    super(props);

    this.state = {
      openView: null,
      fadeIn: false,
      isOpen: false,
    };
  }

  componentDidMount() {
    this.setState({ fadeIn: true });
  }

  onToggleToolBarView = (item: EditorToolbarView) => {
    this.setState({
      openView: item,
      isOpen: !this.state.isOpen,
    });
  };

  onCloseOpenView = () => {
    this.setState({ isOpen: false });
  };

  static getDerivedStateFromProps(props, state) {
    if (state.openView) {
      const activeToolbarItem = props.toolbarItems.find(
        item => item.title === state.openView.title && item.icon === state.openView.icon
      );
      if (activeToolbarItem) {
        return {
          ...state,
          openView: activeToolbarItem,
        };
      }
    }
    return state;
  }

  renderButton(view: EditorToolbarView) {
    const onClick = () => {
      if (view.onClick) {
        view.onClick();
      }

      if (view.render) {
        this.onToggleToolBarView(view);
      }
    };

    return (
      <div className="nav-buttons" key={view.title + view.icon}>
        <button className="btn navbar-button" onClick={onClick} disabled={view.disabled}>
          {view.icon && <i className={view.icon} />} {view.title}
        </button>
      </div>
    );
  }

  renderOpenView(view: EditorToolbarView) {
    return (
      <PanelOptionSection title={view.title || view.heading} onClose={this.onCloseOpenView}>
        {view.render()}
      </PanelOptionSection>
    );
  }

  render() {
    const { children, renderToolbar, heading, toolbarItems } = this.props;
    const { openView, fadeIn, isOpen } = this.state;

    return (
      <>
        <div className="toolbar">
          <div className="toolbar__heading">{heading}</div>
          {renderToolbar && renderToolbar()}
          {toolbarItems.length > 0 && (
            <>
              <div className="gf-form--grow" />
              {toolbarItems.map(item => this.renderButton(item))}
            </>
          )}
        </div>
        <div className="panel-editor__scroll">
          <CustomScrollbar autoHide={false}>
            <div className="panel-editor__content">
              <FadeIn in={isOpen} duration={200} unmountOnExit={true}>
                {openView && this.renderOpenView(openView)}
              </FadeIn>
              <FadeIn in={fadeIn} duration={50}>
                {children}
              </FadeIn>
            </div>
          </CustomScrollbar>
        </div>
      </>
    );
  }
}
