/* */ 
var $export = require('./$.export'),
    log1p = require('./$.math-log1p'),
    sqrt = Math.sqrt,
    $acosh = Math.acosh;
$export($export.S + $export.F * !($acosh && Math.floor($acosh(Number.MAX_VALUE)) == 710), 'Math', {acosh: function acosh(x) {
    return (x = +x) < 1 ? NaN : x > 94906265.62425156 ? Math.log(x) + Math.LN2 : log1p(x - 1 + sqrt(x - 1) * sqrt(x + 1));
  }});
