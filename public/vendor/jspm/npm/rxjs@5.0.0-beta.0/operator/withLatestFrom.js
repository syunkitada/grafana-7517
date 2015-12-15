/* */ 
var __extends = (this && this.__extends) || function(d, b) {
  for (var p in b)
    if (b.hasOwnProperty(p))
      d[p] = b[p];
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var tryCatch_1 = require('../util/tryCatch');
var errorObject_1 = require('../util/errorObject');
var OuterSubscriber_1 = require('../OuterSubscriber');
var subscribeToResult_1 = require('../util/subscribeToResult');
function withLatestFrom() {
  var args = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    args[_i - 0] = arguments[_i];
  }
  var project;
  if (typeof args[args.length - 1] === 'function') {
    project = args.pop();
  }
  var observables = args;
  return this.lift(new WithLatestFromOperator(observables, project));
}
exports.withLatestFrom = withLatestFrom;
var WithLatestFromOperator = (function() {
  function WithLatestFromOperator(observables, project) {
    this.observables = observables;
    this.project = project;
  }
  WithLatestFromOperator.prototype.call = function(subscriber) {
    return new WithLatestFromSubscriber(subscriber, this.observables, this.project);
  };
  return WithLatestFromOperator;
})();
var WithLatestFromSubscriber = (function(_super) {
  __extends(WithLatestFromSubscriber, _super);
  function WithLatestFromSubscriber(destination, observables, project) {
    _super.call(this, destination);
    this.observables = observables;
    this.project = project;
    this.toRespond = [];
    var len = observables.length;
    this.values = new Array(len);
    for (var i = 0; i < len; i++) {
      this.toRespond.push(i);
    }
    for (var i = 0; i < len; i++) {
      var observable = observables[i];
      this.add(subscribeToResult_1.subscribeToResult(this, observable, observable, i));
    }
  }
  WithLatestFromSubscriber.prototype.notifyNext = function(observable, value, observableIndex, index) {
    this.values[observableIndex] = value;
    var toRespond = this.toRespond;
    if (toRespond.length > 0) {
      var found = toRespond.indexOf(observableIndex);
      if (found !== -1) {
        toRespond.splice(found, 1);
      }
    }
  };
  WithLatestFromSubscriber.prototype.notifyComplete = function() {};
  WithLatestFromSubscriber.prototype._next = function(value) {
    if (this.toRespond.length === 0) {
      var values = this.values;
      var destination = this.destination;
      var project = this.project;
      var args = [value].concat(values);
      if (project) {
        var result = tryCatch_1.tryCatch(this.project).apply(this, args);
        if (result === errorObject_1.errorObject) {
          destination.error(result.e);
        } else {
          destination.next(result);
        }
      } else {
        destination.next(args);
      }
    }
  };
  return WithLatestFromSubscriber;
})(OuterSubscriber_1.OuterSubscriber);
