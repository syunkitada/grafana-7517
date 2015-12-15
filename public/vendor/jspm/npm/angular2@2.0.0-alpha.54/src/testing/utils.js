/* */ 
'use strict';
var __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
    return Reflect.metadata(k, v);
};
var core_1 = require('../../core');
var collection_1 = require('../facade/collection');
var dom_adapter_1 = require('../platform/dom/dom_adapter');
var lang_1 = require('../facade/lang');
var Log = (function() {
  function Log() {
    this._result = [];
  }
  Log.prototype.add = function(value) {
    this._result.push(value);
  };
  Log.prototype.fn = function(value) {
    var _this = this;
    return function(a1, a2, a3, a4, a5) {
      if (a1 === void 0) {
        a1 = null;
      }
      if (a2 === void 0) {
        a2 = null;
      }
      if (a3 === void 0) {
        a3 = null;
      }
      if (a4 === void 0) {
        a4 = null;
      }
      if (a5 === void 0) {
        a5 = null;
      }
      _this._result.push(value);
    };
  };
  Log.prototype.clear = function() {
    this._result = [];
  };
  Log.prototype.result = function() {
    return this._result.join("; ");
  };
  Log = __decorate([core_1.Injectable(), __metadata('design:paramtypes', [])], Log);
  return Log;
})();
exports.Log = Log;
var BrowserDetection = (function() {
  function BrowserDetection(ua) {
    if (lang_1.isPresent(ua)) {
      this._ua = ua;
    } else {
      this._ua = lang_1.isPresent(dom_adapter_1.DOM) ? dom_adapter_1.DOM.getUserAgent() : '';
    }
  }
  Object.defineProperty(BrowserDetection.prototype, "isFirefox", {
    get: function() {
      return this._ua.indexOf('Firefox') > -1;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(BrowserDetection.prototype, "isAndroid", {
    get: function() {
      return this._ua.indexOf('Mozilla/5.0') > -1 && this._ua.indexOf('Android') > -1 && this._ua.indexOf('AppleWebKit') > -1 && this._ua.indexOf('Chrome') == -1;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(BrowserDetection.prototype, "isEdge", {
    get: function() {
      return this._ua.indexOf('Edge') > -1;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(BrowserDetection.prototype, "isIE", {
    get: function() {
      return this._ua.indexOf('Trident') > -1;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(BrowserDetection.prototype, "isWebkit", {
    get: function() {
      return this._ua.indexOf('AppleWebKit') > -1 && this._ua.indexOf('Edge') == -1;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(BrowserDetection.prototype, "isIOS7", {
    get: function() {
      return this._ua.indexOf('iPhone OS 7') > -1 || this._ua.indexOf('iPad OS 7') > -1;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(BrowserDetection.prototype, "isSlow", {
    get: function() {
      return this.isAndroid || this.isIE || this.isIOS7;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(BrowserDetection.prototype, "supportsIntlApi", {
    get: function() {
      return this._ua.indexOf('Chrome/4') > -1 && this._ua.indexOf('Edge') == -1;
    },
    enumerable: true,
    configurable: true
  });
  return BrowserDetection;
})();
exports.BrowserDetection = BrowserDetection;
exports.browserDetection = new BrowserDetection(null);
function dispatchEvent(element, eventType) {
  dom_adapter_1.DOM.dispatchEvent(element, dom_adapter_1.DOM.createEvent(eventType));
}
exports.dispatchEvent = dispatchEvent;
function el(html) {
  return dom_adapter_1.DOM.firstChild(dom_adapter_1.DOM.content(dom_adapter_1.DOM.createTemplate(html)));
}
exports.el = el;
var _RE_SPECIAL_CHARS = ['-', '[', ']', '/', '{', '}', '\\', '(', ')', '*', '+', '?', '.', '^', '$', '|'];
var _ESCAPE_RE = lang_1.RegExpWrapper.create("[\\" + _RE_SPECIAL_CHARS.join('\\') + "]");
function containsRegexp(input) {
  return lang_1.RegExpWrapper.create(lang_1.StringWrapper.replaceAllMapped(input, _ESCAPE_RE, function(match) {
    return ("\\" + match[0]);
  }));
}
exports.containsRegexp = containsRegexp;
function normalizeCSS(css) {
  css = lang_1.StringWrapper.replaceAll(css, /\s+/g, ' ');
  css = lang_1.StringWrapper.replaceAll(css, /:\s/g, ':');
  css = lang_1.StringWrapper.replaceAll(css, /'/g, '"');
  css = lang_1.StringWrapper.replaceAll(css, / }/g, '}');
  css = lang_1.StringWrapper.replaceAllMapped(css, /url\((\"|\s)(.+)(\"|\s)\)(\s*)/g, function(match) {
    return ("url(\"" + match[2] + "\")");
  });
  css = lang_1.StringWrapper.replaceAllMapped(css, /\[(.+)=([^"\]]+)\]/g, function(match) {
    return ("[" + match[1] + "=\"" + match[2] + "\"]");
  });
  return css;
}
exports.normalizeCSS = normalizeCSS;
var _singleTagWhitelist = ['br', 'hr', 'input'];
function stringifyElement(el) {
  var result = '';
  if (dom_adapter_1.DOM.isElementNode(el)) {
    var tagName = dom_adapter_1.DOM.tagName(el).toLowerCase();
    result += "<" + tagName;
    var attributeMap = dom_adapter_1.DOM.attributeMap(el);
    var keys = [];
    attributeMap.forEach(function(v, k) {
      return keys.push(k);
    });
    collection_1.ListWrapper.sort(keys);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var attValue = attributeMap.get(key);
      if (!lang_1.isString(attValue)) {
        result += " " + key;
      } else {
        result += " " + key + "=\"" + attValue + "\"";
      }
    }
    result += '>';
    var childrenRoot = dom_adapter_1.DOM.templateAwareRoot(el);
    var children = lang_1.isPresent(childrenRoot) ? dom_adapter_1.DOM.childNodes(childrenRoot) : [];
    for (var j = 0; j < children.length; j++) {
      result += stringifyElement(children[j]);
    }
    if (!collection_1.ListWrapper.contains(_singleTagWhitelist, tagName)) {
      result += "</" + tagName + ">";
    }
  } else if (dom_adapter_1.DOM.isCommentNode(el)) {
    result += "<!--" + dom_adapter_1.DOM.nodeValue(el) + "-->";
  } else {
    result += dom_adapter_1.DOM.getText(el);
  }
  return result;
}
exports.stringifyElement = stringifyElement;
