///<reference path="../../../headers/common.d.ts" />

import _ = require('lodash');

var index = [];
var categories = {
  Aggregations: [],
  Transformations: [],
  Math: [],
  Aliasing: [],
  Fields: [],
};

class QueryPartDef {
  name: string;
  params: any[];
  defaultParams: any[];
  renderer: any;

  constructor(options: any) {
    this.name = options.name;
    this.params = options.params;
    this.defaultParams = options.defaultParams;
    this.renderer = options.renderer;
  }

  static register(options: any) {
    index[options.name] = new QueryPartDef(options);
    options.category.push(index[options.name]);
  }
}

function functionRenderer(part, innerExpr) {
  var str = part.def.name + '(';
  var parameters = _.map(part.params, (value, index) => {
    var paramType = part.def.params[index];
    if (paramType.quote === 'single') {
      return "'" + value + "'";
    } else if (paramType.quote === 'double') {
      return '"' + value + '"';
    }

    return value;
  });

  if (innerExpr) {
    parameters.unshift(innerExpr);
  }
  return str + parameters.join(', ') + ')';
}

function aliasRenderer(part, innerExpr) {
  return innerExpr + ' AS ' + '"' + part.params[0] + '"';
}

function suffixRenderer(part, innerExpr) {
  return innerExpr + ' ' + part.params[0];
}

function identityRenderer(part, innerExpr) {
  return part.params[0];
}

function quotedIdentityRenderer(part, innerExpr) {
  return '"' + part.params[0] + '"';
}

QueryPartDef.register({
  name: 'field',
  category: categories.Fields,
  params: [{type: 'field'}],
  defaultParams: ['value'],
  renderer: quotedIdentityRenderer,
});

QueryPartDef.register({
  name: 'mean',
  category: categories.Aggregations,
  params: [],
  defaultParams: [],
  renderer: functionRenderer,
});

QueryPartDef.register({
  name: 'sum',
  category: categories.Aggregations,
  params: [],
  defaultParams: [],
  renderer: functionRenderer,
});

QueryPartDef.register({
  name: 'derivative',
  category: categories.Transformations,
  params: [{ name: "duration", type: "interval", options: ['1s', '10s', '1m', '5min', '10m', '15m', '1h']}],
  defaultParams: ['10s'],
  renderer: functionRenderer,
});

QueryPartDef.register({
  name: 'time',
  category: categories.Transformations,
  params: [{ name: "rate", type: "interval", options: ['$interval', '1s', '10s', '1m', '5min', '10m', '15m', '1h'] }],
  defaultParams: ['$interval'],
  renderer: functionRenderer,
});

QueryPartDef.register({
  name: 'math',
  category: categories.Math,
  params: [{ name: "expr", type: "string"}],
  defaultParams: [' / 100'],
  renderer: suffixRenderer,
});

QueryPartDef.register({
  name: 'alias',
  category: categories.Aliasing,
  params: [{ name: "name", type: "string", quote: 'double'}],
  defaultParams: ['alias'],
  renderMode: 'suffix',
  renderer: aliasRenderer,
});

class QueryPart {
  part: any;
  def: QueryPartDef;
  params: any[];
  text: string;

  constructor(part: any) {
    this.part = part;
    this.def = index[part.name];
    if (!this.def) {
      throw {message: 'Could not find query part ' + part.name};
    }

    this.params = part.params || _.clone(this.def.defaultParams);
    this.updateText();
  }

  render(innerExpr: string) {
    return this.def.renderer(this, innerExpr);
  }

  hasMultipleParamsInString (strValue, index) {
    if (strValue.indexOf(',') === -1) {
      return false;
    }

    return this.def.params[index + 1] && this.def.params[index + 1].optional;
  }

  updateParam (strValue, index) {
    // handle optional parameters
    // if string contains ',' and next param is optional, split and update both
    if (this.hasMultipleParamsInString(strValue, index)) {
      _.each(strValue.split(','), function(partVal: string, idx) {
        this.updateParam(partVal.trim(), idx);
      }, this);
      return;
    }

    if (strValue === '' && this.def.params[index].optional) {
      this.params.splice(index, 1);
    }
    else {
      this.params[index] = strValue;
    }

    this.part.params = this.params;
    this.updateText();
  }

  updateText() {
    if (this.params.length === 0) {
      this.text = this.def.name + '()';
      return;
    }

    var text = this.def.name + '(';
    text += this.params.join(', ');
    text += ')';
    this.text = text;
  }
}

export = {
  create: function(part): any {
    return new QueryPart(part);
  },

  getFuncDef: function(name) {
    return index[name];
  },

  getCategories: function() {
    return categories;
  }
};
