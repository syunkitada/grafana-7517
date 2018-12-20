import coreModule from 'app/core/core_module';
import _ from 'lodash';
import { alignmentPeriods } from './constants';
import { getAlignmentOptionsByMetric, getAggregationOptionsByMetric } from './functions';
import kbn from 'app/core/utils/kbn';

export class StackdriverAggregation {
  constructor() {
    return {
      templateUrl: 'public/app/plugins/datasource/stackdriver/partials/query.aggregation.html',
      controller: 'StackdriverAggregationCtrl',
      restrict: 'E',
      scope: {
        target: '=',
        alignmentPeriod: '<',
        refresh: '&',
      },
    };
  }
}

export class StackdriverAggregationCtrl {
  alignmentPeriods: any[];
  aggOptions: any[];
  alignOptions: any[];
  target: any;

  /** @ngInject */
  constructor(private $scope, private templateSrv) {
    this.$scope.ctrl = this;
    this.target = $scope.target;
    this.alignmentPeriods = alignmentPeriods.map(ap => ({
      ...ap,
      label: ap.text,
    }));
    this.setAggOptions();
    this.setAlignOptions();
    const self = this;
    $scope.$on('metricTypeChanged', () => {
      self.setAggOptions();
      self.setAlignOptions();
    });
  }

  setAlignOptions() {
    this.alignOptions = getAlignmentOptionsByMetric(this.target.valueType, this.target.metricKind).map(a => ({
      ...a,
      label: a.text,
    }));
  }

  setAggOptions() {
    let aggregations = getAggregationOptionsByMetric(this.target.valueType, this.target.metricKind).map(a => ({
      ...a,
      label: a.text,
    }));
    if (!aggregations.find(o => o.value === this.templateSrv.replace(this.target.crossSeriesReducer))) {
      this.deselectAggregationOption('REDUCE_NONE');
    }

    if (this.target.groupBys.length > 0) {
      aggregations = aggregations.filter(o => o.value !== 'REDUCE_NONE');
      this.deselectAggregationOption('REDUCE_NONE');
    }
    this.aggOptions = [
      this.getTemplateVariablesGroup(),
      {
        label: 'Aggregations',
        options: aggregations,
      },
    ];
  }

  handleAlignmentChange(value) {
    this.target.perSeriesAligner = value;
    this.$scope.refresh();
  }

  handleAggregationChange(value) {
    this.target.crossSeriesReducer = value;
    this.$scope.refresh();
  }

  handleAlignmentPeriodChange(value) {
    this.target.alignmentPeriod = value;
    this.$scope.refresh();
  }

  formatAlignmentText() {
    const alignments = getAlignmentOptionsByMetric(this.target.valueType, this.target.metricKind);
    const selectedAlignment = alignments.find(
      ap => ap.value === this.templateSrv.replace(this.target.perSeriesAligner)
    );
    return `${kbn.secondsToHms(this.$scope.alignmentPeriod)} interval (${
      selectedAlignment ? selectedAlignment.text : ''
    })`;
  }

  deselectAggregationOption(notValidOptionValue: string) {
    const aggregations = getAggregationOptionsByMetric(this.target.valueType, this.target.metricKind);
    const newValue = aggregations.find(o => o.value !== notValidOptionValue);
    this.target.crossSeriesReducer = newValue ? newValue.value : '';
  }

  getTemplateVariablesGroup() {
    return {
      label: 'Template Variables',
      options: this.templateSrv.variables.map(v => ({
        label: `$${v.name}`,
        value: `$${v.name}`,
      })),
    };
  }
}

coreModule.directive('stackdriverAggregation', StackdriverAggregation);
coreModule.controller('StackdriverAggregationCtrl', StackdriverAggregationCtrl);
