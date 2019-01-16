import React, { PureComponent } from 'react';
import { getAngularLoader, AngularComponent } from 'app/core/services/AngularLoader';
import { Emitter } from 'app/core/utils/emitter';
import { getIntervals } from 'app/core/utils/explore';
import { DataQuery } from 'app/types';
import { RawTimeRange } from '@grafana/ui';
import { getTimeSrv } from 'app/features/dashboard/time_srv';
import 'app/features/plugins/plugin_loader';

interface QueryEditorProps {
  datasource: any;
  error?: string | JSX.Element;
  onExecuteQuery?: () => void;
  onQueryChange?: (value: DataQuery, override?: boolean) => void;
  initialQuery: DataQuery;
  exploreEvents: Emitter;
  range: RawTimeRange;
}

export default class QueryEditor extends PureComponent<QueryEditorProps, any> {
  element: any;
  component: AngularComponent;

  async componentDidMount() {
    if (!this.element) {
      return;
    }

    const { datasource, initialQuery, exploreEvents, range } = this.props;
    this.initTimeSrv(range);

    const loader = getAngularLoader();
    const template = '<plugin-component type="query-ctrl"> </plugin-component>';
    const target = { datasource: datasource.name, ...initialQuery };
    const scopeProps = {
      target,
      ctrl: {
        refresh: () => {
          this.props.onQueryChange(target, false);
          this.props.onExecuteQuery();
        },
        events: exploreEvents,
        panel: {
          datasource,
          targets: [target],
        },
        dashboard: {
          getNextQueryLetter: x => '',
        },
        hideEditorRowActions: true,
        ...getIntervals(range, (datasource || {}).interval, null), // Possible to get resolution?
      },
    };

    this.component = loader.load(this.element, scopeProps, template);
    this.props.onQueryChange(target, false);
  }

  componentWillUnmount() {
    if (this.component) {
      this.component.destroy();
    }
  }

  initTimeSrv(range) {
    const timeSrv = getTimeSrv();
    timeSrv.init({
      time: range,
      refresh: false,
      getTimezone: () => 'utc',
      timeRangeUpdated: () => console.log('refreshDashboard!'),
    });
  }

  render() {
    return <div ref={element => (this.element = element)} style={{ width: '100%' }} />;
  }
}
