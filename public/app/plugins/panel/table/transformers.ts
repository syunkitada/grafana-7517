import _ from 'lodash';
import flatten from '../../../core/utils/flatten';
import TimeSeries from '../../../core/time_series2';
import TableModel from '../../../core/table_model';

var transformers = {};

transformers['timeseries_to_rows'] = {
  description: 'Time series to rows',
  getColumns: function() {
    return [];
  },
  transform: function(data, panel, model) {
    model.columns = [
      {text: 'Time', type: 'date'},
      {text: 'Metric'},
      {text: 'Value'},
    ];

    for (var i = 0; i < data.length; i++) {
      var series = data[i];
      for (var y = 0; y < series.datapoints.length; y++) {
        var dp = series.datapoints[y];
        model.rows.push([dp[1], series.target, dp[0]]);
      }
    }
  },
};

transformers['timeseries_to_columns'] = {
  description: 'Time series to columns',
  getColumns: function() {
    return [];
  },
  transform: function(data, panel, model) {
    model.columns.push({text: 'Time', type: 'date'});

    // group by time
    var points = {};

    for (let i = 0; i < data.length; i++) {
      var series = data[i];
      model.columns.push({text: series.target});

      for (var y = 0; y < series.datapoints.length; y++) {
        var dp = series.datapoints[y];
        var timeKey = dp[1].toString();

        if (!points[timeKey]) {
          points[timeKey] = {time: dp[1]};
          points[timeKey][i] = dp[0];
        } else {
          points[timeKey][i] = dp[0];
        }
      }
    }

    for (var time in points) {
      var point = points[time];
      var values = [point.time];

      for (let i = 0; i < data.length; i++) {
        var value = point[i];
        values.push(value);
      }

      model.rows.push(values);
    }
  }
};

transformers['timeseries_aggregations'] = {
  description: 'Time series aggregations',
  getColumns: function() {
    return [
      {text: 'Avg', value: 'avg'},
      {text: 'Min', value: 'min'},
      {text: 'Max', value: 'max'},
      {text: 'Total', value: 'total'},
      {text: 'Current', value: 'current'},
      {text: 'Count', value: 'count'},
    ];
  },
  transform: function(data, panel, model) {
    var i, y;
    model.columns.push({text: 'Metric'});

    for (i = 0; i < panel.columns.length; i++) {
      model.columns.push({text: panel.columns[i].text});
    }

    for (i = 0; i < data.length; i++) {
      var series = new TimeSeries({
        datapoints: data[i].datapoints,
        alias: data[i].target,
      });

      series.getFlotPairs('connected');
      var cells = [series.alias];

      for (y = 0; y < panel.columns.length; y++) {
        cells.push(series.stats[panel.columns[y].value]);
      }

      model.rows.push(cells);
    }
  }
};

transformers['annotations'] = {
  description: 'Annotations',
  getColumns: function() {
    return [];
  },
  transform: function(data, panel, model) {
    model.columns.push({text: 'Time', type: 'date'});
    model.columns.push({text: 'Title'});
    model.columns.push({text: 'Text'});
    model.columns.push({text: 'Tags'});

    if (!data || !data.annotations || data.annotations.length === 0) {
      return;
    }

    for (var i = 0; i < data.annotations.length; i++) {
      var evt = data.annotations[i];
      model.rows.push([evt.time, evt.title, evt.text, evt.tags]);
    }
  }
};

transformers['table'] = {
  description: 'Table',
  getColumns: function(data) {
    if (!data || data.length === 0) {
      return [];
    }

    // Track column indexes: name -> index
    const columnNames = {};

    // Union of all non-value columns
    const columns = data.reduce((acc, d, i) => {
      d.columns.forEach((col, j) => {
        const { text } = col;
        if (text !== 'Value') {
          if (columnNames[text] === undefined) {
            columnNames[text] = acc.length;
            acc.push(col);
          }
        }
      });
      return acc;
    }, []);

    // Append one value column per data set
    data.forEach((_, i) => {
      // Value (A), Value (B),...
      const text = `Value #${String.fromCharCode(65 + i)}`;
      columnNames[text] = columns.length;
      columns.push({ text });
    });

    return columns;
  },
  transform: function(data, panel, model) {
    if (!data || data.length === 0) {
      return;
    }

    const noTableIndex = _.findIndex(data, d => d.type !== 'table');
    if (noTableIndex > -1) {
      throw {message: `Result of query #${String.fromCharCode(65 + noTableIndex)} is not in table format, try using another transform.`};
    }

    // Track column indexes: name -> index
    const columnNames = {};
    const columnIndexes = [];

    // Union of all non-value columns
    const columns = data.reduce((acc, d, i) => {
      const indexes = [];
      d.columns.forEach((col, j) => {
        const { text } = col;
        if (text !== 'Value') {
          if (columnNames[text] === undefined) {
            columnNames[text] = acc.length;
            acc.push(col);
          }
          indexes[j] = columnNames[text];
        }
      });
      columnIndexes.push(indexes);
      return acc;
    }, []);
    const nonValueColumnCount = columns.length;

    // Append one value column per data set
    data.forEach((_, i) => {
      // Value #A, Value #B,...
      const text = `Value #${String.fromCharCode(65 + i)}`;
      columnNames[text] = columns.length;
      columns.push({ text });
      columnIndexes[i].push(columnNames[text]);
    });

    model.columns = columns;

    // Adjust rows to new column indexes
    let rows = data.reduce((acc, d, i) => {
      const indexes = columnIndexes[i];
      d.rows.forEach((r, j) => {
        const alteredRow = [];
        indexes.forEach((to, from) => {
          alteredRow[to] = r[from];
        });
        acc.push(alteredRow);
      });
      return acc;
    }, []);

    // Merge rows that have same columns
    const mergedRows = {};
    rows = rows.reduce((acc, row, i) => {
      if (!mergedRows[i]) {
        const match = _.findIndex(rows, (other, j) => {
          let same = true;
          for (let index = 0; index < nonValueColumnCount; index++) {
            if (row[index] !== other[index]) {
              same = false;
              break;
            }
          }
          return same;
        }, i + 1);
        if (match > -1) {
          const matchedRow = rows[match];
          // Merge values into current row
          for (let index = nonValueColumnCount; index < columns.length; index++) {
            if (row[index] === undefined && matchedRow[index] !== undefined) {
              row[index] = matchedRow[index];
              break;
            }
          }
          mergedRows[match] = matchedRow;
        }
        acc.push(row);
      }
      return acc;
    }, []);

    model.rows = rows;
  }
};

transformers['json'] = {
  description: 'JSON Data',
  getColumns: function(data) {
    if (!data || data.length === 0) {
      return [];
    }

    var names: any = {};
    for (var i = 0; i < data.length; i++) {
      var series = data[i];
      if (series.type !== 'docs') {
        continue;
      }

      // only look at 100 docs
      var maxDocs = Math.min(series.datapoints.length, 100);
      for (var y = 0; y < maxDocs; y++) {
        var doc = series.datapoints[y];
        var flattened = flatten(doc, null);
        for (var propName in flattened) {
          names[propName] = true;
        }
      }
    }

    return _.map(names, function(value, key) {
      return {text: key, value: key};
    });
  },
  transform: function(data, panel, model) {
    var i, y, z;

    for (let column of panel.columns) {
      var tableCol: any = {text: column.text};

      // if filterable data then set columns to filterable
      if (data.length > 0 && data[0].filterable) {
        tableCol.filterable = true;
      }

      model.columns.push(tableCol);
    }

    if (model.columns.length === 0) {
      model.columns.push({text: 'JSON'});
    }

    for (i = 0; i < data.length; i++) {
      var series = data[i];

      for (y = 0; y < series.datapoints.length; y++) {
        var dp = series.datapoints[y];
        var values = [];

        if (_.isObject(dp) && panel.columns.length > 0) {
          var flattened = flatten(dp, null);
          for (z = 0; z < panel.columns.length; z++) {
            values.push(flattened[panel.columns[z].value]);
          }
        } else {
          values.push(JSON.stringify(dp));
        }

        model.rows.push(values);
      }
    }
  }
};

function transformDataToTable(data, panel) {
  var model = new TableModel();

  if (!data || data.length === 0) {
    return model;
  }

  var transformer = transformers[panel.transform];
  if (!transformer) {
    throw {message: 'Transformer ' + panel.transform + ' not found'};
  }

  transformer.transform(data, panel, model);
  return model;
}

export {transformers, transformDataToTable};
