import _ from 'lodash';
import { QueryCtrl } from 'app/plugins/sdk';
import './query_aggregation_ctrl';
import './query_filter_ctrl';
import { StackdriverPicker } from './components/StackdriverPicker';
import { react2AngularDirective } from 'app/core/utils/react2angular';
import { registerAngularDirectives } from './angular_wrappers';
import { Target, QueryMeta } from './types';

export const DefaultTarget = {
  defaultProject: 'loading project...',
  metricType: '',
  service: '',
  metric: '',
  unit: '',
  crossSeriesReducer: 'REDUCE_MEAN',
  alignmentPeriod: 'stackdriver-auto',
  perSeriesAligner: 'ALIGN_MEAN',
  groupBys: [],
  filters: [],
  showAggregationOptions: false,
  aliasBy: '',
  metricKind: '',
  valueType: '',
};

export class StackdriverQueryCtrl extends QueryCtrl {
  static templateUrl = 'partials/query.editor.html';
  target: Target;

  defaults = {
    defaultProject: 'loading project...',
    metricType: '',
    service: '',
    metric: '',
    unit: '',
    crossSeriesReducer: 'REDUCE_MEAN',
    alignmentPeriod: 'stackdriver-auto',
    perSeriesAligner: 'ALIGN_MEAN',
    groupBys: [],
    filters: [],
    showAggregationOptions: false,
    aliasBy: '',
    metricKind: '',
    valueType: '',
  };

  showHelp: boolean;
  showLastQuery: boolean;
  lastQueryMeta: QueryMeta;
  lastQueryError?: string;
  labelData: QueryMeta;

  loadLabelsPromise: Promise<any>;
  templateSrv: any;
  $rootScope: any;
  uiSegmentSrv: any;

  /** @ngInject */
  constructor($scope, $injector, templateSrv, $rootScope, uiSegmentSrv) {
    super($scope, $injector);
    this.templateSrv = templateSrv;
    this.$rootScope = $rootScope;
    this.uiSegmentSrv = uiSegmentSrv;
    _.defaultsDeep(this.target, this.defaults);
    this.panelCtrl.events.on('data-received', this.onDataReceived.bind(this), $scope);
    this.panelCtrl.events.on('data-error', this.onDataError.bind(this), $scope);
    react2AngularDirective('stackdriverPicker', StackdriverPicker, [
      'options',
      'onChange',
      'selected',
      'searchable',
      'className',
      'placeholder',
      'groupName',
      ['templateVariables', { watchDepth: 'reference' }],
    ]);
    registerAngularDirectives();
    this.handleQueryChange = this.handleQueryChange.bind(this);
    this.handleExecuteQuery = this.handleExecuteQuery.bind(this);
  }

  handleQueryChange(target: Target) {
    Object.assign(this.target, target);
  }

  handleExecuteQuery() {
    this.$scope.ctrl.refresh();
  }

  onDataReceived(dataList) {
    this.lastQueryError = null;
    this.lastQueryMeta = null;

    const anySeriesFromQuery: any = _.find(dataList, { refId: this.target.refId });
    if (anySeriesFromQuery) {
      this.lastQueryMeta = anySeriesFromQuery.meta;
      this.lastQueryMeta.rawQueryString = decodeURIComponent(this.lastQueryMeta.rawQuery);
    }
  }

  onDataError(err) {
    if (err.data && err.data.results) {
      const queryRes = err.data.results[this.target.refId];
      if (queryRes && queryRes.error) {
        this.lastQueryMeta = queryRes.meta;
        this.lastQueryMeta.rawQueryString = decodeURIComponent(this.lastQueryMeta.rawQuery);

        let jsonBody;
        try {
          jsonBody = JSON.parse(queryRes.error);
        } catch {
          this.lastQueryError = queryRes.error;
        }

        this.lastQueryError = jsonBody.error.message;
      }
    }
  }
}
