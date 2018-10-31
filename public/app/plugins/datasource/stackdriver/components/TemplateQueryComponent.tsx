import React, { PureComponent } from 'react';
import SimpleDropdown from './SimpleDropdown';
import { TemplateQueryProps } from 'app/types/plugins';
import { getMetricTypesByService, extractServicesFromMetricDescriptors } from '../functions';
import defaultsDeep from 'lodash/defaultsDeep';
import { MetricFindQueryTypes } from '../types';

export class StackdriverTemplateQueryComponent extends PureComponent<TemplateQueryProps, any> {
  queryTypes: Array<{ value: string; name: string }> = [
    { value: MetricFindQueryTypes.Services, name: 'Services' },
    { value: MetricFindQueryTypes.MetricTypes, name: 'Metric Types' },
    { value: MetricFindQueryTypes.MetricLabels, name: 'Metric Labels' },
    { value: MetricFindQueryTypes.ResourceLabels, name: 'Resource Labels' },
    { value: MetricFindQueryTypes.ResourceTypes, name: 'Resource Types' },
    { value: MetricFindQueryTypes.Aggregations, name: 'Aggregations' },
    { value: MetricFindQueryTypes.Alignerns, name: 'Aligners' },
    { value: MetricFindQueryTypes.AlignmentPeriods, name: 'Alignment Periods' },
  ];

  defaults = {
    type: '',
    metricDescriptors: [],
    service: '',
    metricType: '',
    labels: [],
    labelKey: '',
    metricTypes: [],
    services: [],
  };

  constructor(props: TemplateQueryProps) {
    super(props);
    this.handleQueryTypeChange = this.handleQueryTypeChange.bind(this);
    this.onServiceChange = this.onServiceChange.bind(this);
    this.onMetricTypeChange = this.onMetricTypeChange.bind(this);
    this.onLabelKeyChange = this.onLabelKeyChange.bind(this);
    this.state = defaultsDeep(this.props.query, this.defaults);
  }

  async componentDidMount() {
    const metricDescriptors = await this.props.datasource.getMetricTypes(this.props.datasource.projectName);
    const services = extractServicesFromMetricDescriptors(metricDescriptors).map(m => ({
      value: m.service,
      name: m.serviceShortName,
    }));
    const service = this.state.service || services[0].value;
    const metricTypes = getMetricTypesByService(metricDescriptors, service).map(m => ({
      value: m.type,
      name: m.displayName,
    }));
    const metricType = this.state.metricType || metricTypes[0].value;
    let state: any = { services, service, metricTypes, metricType, metricDescriptors };
    if (this.isLabelQuery(this.state.queryType)) {
      const labels = await this.getLabelKeys(this.state.metricType);
      const labelKey = labels.indexOf(this.state.labelKey) !== -1 ? this.state.labelKey : labels[0];
      state = { ...state, labels, labelKey };
    }
    this.setState(state);
  }

  async handleQueryTypeChange(event) {
    let state: any = { type: event.target.value };
    if (this.isLabelQuery(event.target.value)) {
      const labels = await this.getLabelKeys(this.state.metricType, event.target.value);
      const labelKey = labels.indexOf(this.state.labelKey) !== -1 ? this.state.labelKey : labels[0];
      state = { ...state, labels, labelKey };
    }
    this.setState(state);
  }

  async onServiceChange(event) {
    const metricTypes = getMetricTypesByService(this.state.metricDescriptors, event.target.value).map(m => ({
      value: m.type,
      name: m.displayName,
    }));
    const metricTypeExistInArray = metricTypes.find(m => m.value === this.state.metricType);
    const metricType = metricTypeExistInArray ? metricTypeExistInArray.value : metricTypes[0].value;
    let state: any = { service: event.target.value, metricTypes, metricType };
    if (this.isLabelQuery(this.state.type)) {
      const labels = await this.getLabelKeys(metricType);
      const labelKey = labels.indexOf(this.state.labelKey) !== -1 ? this.state.labelKey : labels[0];
      state = { ...state, labelKey, labels: labels };
    }
    this.setState(state);
  }

  async onMetricTypeChange(event) {
    let state: any = { metricType: event.target.value };
    if (this.isLabelQuery(this.state.type)) {
      const labels = await this.getLabelKeys(event.target.value);
      const labelKey = labels.indexOf(this.state.labelKey) !== -1 ? this.state.labelKey : labels[0];
      state = { ...state, labels, labelKey };
    }
    this.setState(state);
  }

  async getLabelKeys(metricType, type = this.state.type) {
    const refId = 'StackdriverTemplateQueryComponent';
    const response = await this.props.datasource.getLabels(metricType, refId);
    return Object.keys(response.meta[type]);
  }

  onLabelKeyChange(event) {
    this.setState({ labelKey: event.target.value });
  }

  componentDidUpdate() {
    const { metricDescriptors, metricLabels, resourceLabels, ...queryModel } = this.state;
    this.props.onChange(queryModel);
  }

  isLabelQuery(queryType) {
    return [MetricFindQueryTypes.MetricLabels, MetricFindQueryTypes.ResourceLabels].indexOf(queryType) !== -1;
  }

  renderQueryTypeSwitch(queryType) {
    switch (queryType) {
      case MetricFindQueryTypes.MetricTypes:
        return (
          <SimpleDropdown
            value={this.state.service}
            options={this.state.services}
            onValueChange={this.onServiceChange}
            label="Services"
          />
        );
      case MetricFindQueryTypes.MetricLabels:
      case MetricFindQueryTypes.ResourceLabels:
      case MetricFindQueryTypes.ResourceTypes:
        return (
          <React.Fragment>
            <SimpleDropdown
              value={this.state.service}
              options={this.state.services}
              onValueChange={this.onServiceChange}
              label="Services"
            />
            <SimpleDropdown
              value={this.state.metricType}
              options={this.state.metricTypes}
              onValueChange={this.onMetricTypeChange}
              label="Metric Types"
            />
            <SimpleDropdown
              value={this.state.labelKey}
              options={this.state.labels.map(l => ({ value: l, name: l }))}
              onValueChange={this.onLabelKeyChange}
              label={
                this.state.type === MetricFindQueryTypes.ResourceLabels ? 'Resource Label Key' : 'Metric Label Key'
              }
            />
          </React.Fragment>
        );
      case MetricFindQueryTypes.Alignerns:
      case MetricFindQueryTypes.Aggregations:
        return (
          <React.Fragment>
            <SimpleDropdown
              value={this.state.service}
              options={this.state.services}
              onValueChange={this.onServiceChange}
              label="Services"
            />
            <SimpleDropdown
              value={this.state.metricType}
              options={this.state.metricTypes}
              onValueChange={this.onMetricTypeChange}
              label="Metric Types"
            />
          </React.Fragment>
        );
      default:
        return '';
    }
  }

  render() {
    return (
      <React.Fragment>
        <SimpleDropdown
          value={this.state.type}
          options={this.queryTypes}
          onValueChange={this.handleQueryTypeChange}
          label="Query Types"
        />
        {this.renderQueryTypeSwitch(this.state.type)}
      </React.Fragment>
    );
  }
}
