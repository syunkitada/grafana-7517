///<reference path="../../../headers/common.d.ts" />

import kbn from 'app/core/utils/kbn';
import _ from 'lodash';
import TimeSeries from 'app/core/time_series2';
import {colors} from 'app/core/core';



export class DataProcessor {

  constructor(private panel) {
  }

  getSeriesList(options) {
    if (!options.dataList || options.dataList.length === 0) {
      return [];
    }

    // auto detect xaxis mode
    var firstItem;
    if (options.dataList && options.dataList.length > 0) {
      firstItem = options.dataList[0];
      if (firstItem.type === 'docs') {
        this.panel.xaxis.mode = 'custom';
      }
    }

    switch (this.panel.xaxis.mode) {
      case 'series':
      case 'time': {
        return options.dataList.map(this.timeSeriesHandler.bind(this));
      }
      case 'custom': {
        return this.customHandler(firstItem);
      }
    }
  }

  seriesHandler(seriesData, index, datapoints, alias) {
    var colorIndex = index % colors.length;
    var color = this.panel.aliasColors[alias] || colors[colorIndex];

    var series = new TimeSeries({datapoints: datapoints, alias: alias, color: color, unit: seriesData.unit});

    // if (datapoints && datapoints.length > 0) {
    //   var last = moment.utc(datapoints[datapoints.length - 1][1]);
    //   var from = moment.utc(this.range.from);
    //   if (last - from < -10000) {
    //     this.datapointsOutside = true;
    //   }
    //
    //   this.datapointsCount += datapoints.length;
    //   this.panel.tooltip.msResolution = this.panel.tooltip.msResolution || series.isMsResolutionNeeded();
    // }

    return series;
  }

  timeSeriesHandler(seriesData, index) {
    var datapoints = seriesData.datapoints;
    var alias = seriesData.target;

    return this.seriesHandler(seriesData, index, datapoints, alias);
  }

  customHandler(dataItem) {
    console.log('custom', dataItem);
    let nameField = this.panel.xaxis.name;
    if (!nameField) {
      throw {message: 'No field name specified to use for x-axis, check your axes settings'};
    }

  //   let valueField = this.panel.xaxis.esValueField;
  //   let datapoints = _.map(seriesData.datapoints, (doc) => {
  //     return [
  //       pluckDeep(doc, valueField),  // Y value
  //       pluckDeep(doc, xField)       // X value
  //     ];
  //   });
  //
  //   // Remove empty points
  //   datapoints = _.filter(datapoints, (point) => {
  //     return point[0] !== undefined;
  //   });
  //
  //   var alias = valueField;
  //   re
    return [];
  }

  tableHandler(seriesData, index) {
    var xColumnIndex = Number(this.panel.xaxis.columnIndex);
    var valueColumnIndex = Number(this.panel.xaxis.valueColumnIndex);
    var datapoints = _.map(seriesData.rows, (row) => {
      var value = valueColumnIndex ? row[valueColumnIndex] : _.last(row);
      return [
        value,             // Y value
        row[xColumnIndex]  // X value
      ];
    });

    var alias = seriesData.columns[valueColumnIndex].text;

    return this.seriesHandler(seriesData, index, datapoints, alias);
  }

  // esRawDocHandler(seriesData, index) {
  //   let xField = this.panel.xaxis.esField;
  //   let valueField = this.panel.xaxis.esValueField;
  //   let datapoints = _.map(seriesData.datapoints, (doc) => {
  //     return [
  //       pluckDeep(doc, valueField),  // Y value
  //       pluckDeep(doc, xField)       // X value
  //     ];
  //   });
  //
  //   // Remove empty points
  //   datapoints = _.filter(datapoints, (point) => {
  //     return point[0] !== undefined;
  //   });
  //
  //   var alias = valueField;
  //   return this.seriesHandler(seriesData, index, datapoints, alias);
  // }
  //
  validateXAxisSeriesValue() {
    switch (this.panel.xaxis.mode) {
      case 'series': {
        if (this.panel.xaxis.values.length === 0) {
          this.panel.xaxis.values = ['total'];
          return;
        }

        var validOptions = this.getXAxisValueOptions({});
        var found = _.find(validOptions, {value: this.panel.xaxis.values[0]});
        if (!found) {
          this.panel.xaxis.values = ['total'];
        }
        return;
      }
    }
  }

  getDocProperties(dataList) {
    if (dataList.length === 0) {
      return [];
    }

    var firstItem = dataList[0];
    if (firstItem.type === 'docs'){
      if (firstItem.datapoints.length === 0) {
        return [];
      }

      return this.getPropertiesFromDoc(firstItem.datapoints[0]);
    }
  }

  getXAxisValueOptions(options) {
    switch (this.panel.xaxis.mode) {
      case 'time': {
        return [];
      }
      case 'series': {
        return [
          {text: 'Avg', value: 'avg'},
          {text: 'Min', value: 'min'},
          {text: 'Max', value: 'min'},
          {text: 'Total', value: 'total'},
          {text: 'Count', value: 'count'},
        ];
      }
    }
  }

  getPropertiesFromDoc(doc) {
    let props = [];
    let propParts = [];

    function getPropertiesRecursive(obj) {
      _.forEach(obj, (value, key) => {
        if (_.isObject(value)) {
          propParts.push(key);
          getPropertiesRecursive(value);
        } else {
          let field = propParts.concat(key).join('.');
          props.push(field);
        }
      });
      propParts.pop();
    }

    getPropertiesRecursive(doc);
    return props;
  }

  pluckDeep(obj: any, property: string) {
    let propertyParts = property.split('.');
    let value = obj;
    for (let i = 0; i < propertyParts.length; ++i) {
      if (value[propertyParts[i]]) {
        value = value[propertyParts[i]];
      } else {
        return undefined;
      }
    }
    return value;
  }

}


