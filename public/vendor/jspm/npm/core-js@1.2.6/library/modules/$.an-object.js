/* */ 
var isObject = require('./$.is-object');
module.exports = function(it) {
  if (!isObject(it))
    throw TypeError(it + ' is not an object!');
  return it;
};
