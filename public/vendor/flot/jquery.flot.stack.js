/* Flot plugin for stacking data sets rather than overlyaing them.

Copyright (c) 2007-2014 IOLA and Ole Laursen.
Licensed under the MIT license.

The plugin assumes the data is sorted on x (or y if stacking horizontally).
For line charts, it is assumed that if a line has an undefined gap (from a
null point), then the line above it should have the same gap - insert zeros
instead of "null" if you want another behaviour. This also holds for the start
and end of the chart. Note that stacking a mix of positive and negative values
in most instances doesn't make sense (so it looks weird).

Two or more series are stacked when their "stack" attribute is set to the same
key (which can be any number or string or just "true"). To specify the default
stack, you can set the stack option like this:

    series: {
        stack: null/false, true, or a key (number/string)
    }

You can also specify it for a single series, like this:

    $.plot( $("#placeholder"), [{
        data: [ ... ],
        stack: true
    }])

The stacking order is determined by the order of the data series in the array
(later series end up on top of the previous).

Internally, the plugin modifies the datapoints in each series, adding an
offset to the y value. For line series, extra data points are inserted through
interpolation. If there's a second y value, it's also adjusted (e.g for bar
charts or filled areas).

*/

(function ($) {
    var options = {
        series: { stack: null } // or number/string
    };

    function init(plot) {
        function findMatchingSeries(s, allseries) {
            var res = null;
            for (var i = 0; i < allseries.length; ++i) {
                if (s == allseries[i])
                    break;

                if (allseries[i].stack == s.stack)
                    res = allseries[i];
            }

            return res;
        }

        function stackData(plot, s, datapoints) {
            if (s.stack == null || s.stack === false)
                return;

            var other = findMatchingSeries(s, plot.getData());
            if (!other)
                return;

            var ps = datapoints.pointsize,
                points = datapoints.points,
                otherps = other.datapoints.pointsize,
                otherpoints = other.datapoints.points,
                newpoints = [],
                px, py, intery, qx, qy, bottom,
                withlines = s.lines.show,
                horizontal = s.bars.horizontal,
                withbottom = ps > 2 && (horizontal ? datapoints.format[2].x : datapoints.format[2].y),
                withsteps = withlines && s.lines.steps,
                fromgap = true,
                keyOffset = horizontal ? 1 : 0,
                accumulateOffset = horizontal ? 0 : 1,
                i = 0, j = 0, l, m;

            while (true) {
                // browse all points from the current series and from the previous series
                if (i >= points.length && j >= otherpoints.length)
                    break;

                // newpoints will replace current series with
                // as many points as different timestamps we have in the 2 (current & previous) series
                l = newpoints.length;
                px = points[i + keyOffset];
                py = points[i + accumulateOffset];
                qx = otherpoints[j + keyOffset];
                qy = otherpoints[j + accumulateOffset];
                bottom = 0;

                if (i < points.length && px == null) {
                    // let's ignore null points from current series, nothing to do with them
                    i += ps;
                }
                else if (j < otherpoints.length && qx == null) {
                    // let's ignore null points from previous series, nothing to do with them
                    j += otherps;
                }
                else if (i >= points.length) {
                    // no more points in the current series, simply take the remaining points
                    // from the previous series so that next series will correctly stack
                    for (m = 0; m < ps; ++m)
                        newpoints.push(otherpoints[j + m]);
                    bottom = qy;
                    j += otherps;
                }
                else if (j >= otherpoints.length) {
                    // no more points in the previous series, of course let's take
                    // the remaining points from the current series
                    for (m = 0; m < ps; ++m)
                        newpoints.push(points[i + m]);
                    i += ps;
                }
                else {
                    // next available points from current and previous series have the same timestamp
                    if (px == qx) {
                        // so take the point from the current series and skip the previous' one
                        for (m = 0; m < ps; ++m)
                            newpoints.push(points[i + m]);

                        newpoints[l + accumulateOffset] += qy;
                        bottom = qy;

                        i += ps;
                        j += otherps;
                    }
                    // next available point with the smallest timestamp is from the previous series
                    else if (px > qx) {
                        // so take the point from the previous series so that next series will correctly stack
                        for (m = 0; m < ps; ++m)
                            newpoints.push(otherpoints[j + m]);

                        // we might be able to interpolate
                        if (i > 0 && points[i - ps] != null)
                            newpoints[l + accumulateOffset] += py + (points[i - ps + accumulateOffset] - py) * (qx - px) / (points[i - ps + keyOffset] - px);

                        bottom = qy;

                        j += otherps;
                    }
                    // (px < qx) next available point with the smallest timestamp is from the current series
                    else {
                        // so of course let's take the point from the current series
                        for (m = 0; m < ps; ++m)
                            newpoints.push(points[i + m]);

                        // we might be able to interpolate a point below,
                        // this can give us a better y
                        if (j > 0 && otherpoints[j - otherps] != null)
                            bottom = qy + (otherpoints[j - otherps + accumulateOffset] - qy) * (px - qx) / (otherpoints[j - otherps + keyOffset] - qx);

                        newpoints[l + accumulateOffset] += bottom;

                        i += ps;
                    }
                }  

                if (l != newpoints.length && withbottom)
                    newpoints[l + 2] = bottom;
            }

            datapoints.points = newpoints;
        }

        plot.hooks.processDatapoints.push(stackData);
    }

    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'stack',
        version: '1.2'
    });
})(jQuery);
