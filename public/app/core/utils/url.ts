/**
 * @preserve jquery-param (c) 2015 KNOWLEDGECODE | MIT
 */

export function toUrlParams(a) {
  const s = [];
  const rbracket = /\[\]$/;

  const isArray = function(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  };

  const add = function(k, v) {
    v = typeof v === 'function' ? v() : v === null ? '' : v === undefined ? '' : v;
    if (typeof v !== 'boolean') {
      s[s.length] = encodeURIComponent(k) + '=' + encodeURIComponent(v);
    } else {
      s[s.length] = encodeURIComponent(k);
    }
  };

  const buildParams = function(prefix, obj) {
    let i, len, key;

    if (prefix) {
      if (isArray(obj)) {
        for (i = 0, len = obj.length; i < len; i++) {
          if (rbracket.test(prefix)) {
            add(prefix, obj[i]);
          } else {
            buildParams(prefix, obj[i]);
          }
        }
      } else if (obj && String(obj) === '[object Object]') {
        for (key in obj) {
          buildParams(prefix + '[' + key + ']', obj[key]);
        }
      } else {
        add(prefix, obj);
      }
    } else if (isArray(obj)) {
      for (i = 0, len = obj.length; i < len; i++) {
        add(obj[i].name, obj[i].value);
      }
    } else {
      for (key in obj) {
        buildParams(key, obj[key]);
      }
    }
    return s;
  };

  return buildParams('', a)
    .join('&')
    .replace(/%20/g, '+');
}
