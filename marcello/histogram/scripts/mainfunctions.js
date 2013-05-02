(function(){
    // @TODO: Smart calculation of min and max for slider
    $(function() {

         // Function for data preparing
        var data = function(){
            var data = $('#data')
                    .text()
                    .trim()
                    .replace(/\s+/gi, ',')
                    .split(','),
                len = data.length,
                arr = [],
                indx, nLen;

            for (indx = 0; indx < len; indx += 2) {
                arr.push([
                    Number(data[indx]),
                    Number(data[indx + 1])
                ]);
            }

            arr.sort(function(a, b){

                return a[0] - b[0];
            });

            nLen = arr.length;

            var xmax = arr[nLen - 1][0];
            var xmin = arr[0][0];

            // delta between closest points by x
            var prev = 0;
            var delta = _.reduce(arr,
                    function(memo, num){
                        var tmp = Math.abs(num[0]-prev);
                        // console.log(num[0], prev, memo);
                        if (tmp < memo && tmp !== 0) {
                            memo = tmp;
                            // console.log(prev, num[0]);
                        }
                        prev=num[0];
                        return memo;
                    }, xmax - xmin);


            return {
                arr: arr,
                length: nLen,
                xmax: xmax,
                xmin: xmin,
                ymax: arr[nLen - 1][1],
                ymin: arr[0][1],
                delta: delta
            };
        }();

        function log10(val) {
          return Math.log(val) / Math.LN10;
        }
        // console.log(data.delta, data.xmax, data.xmin);

        // Calculating precision
        // TODO if delta is integer, precision should be 0
        var s = data.delta.toString().split('.');
        var int_s = s[0];
        var fl_s = s[1];
        var zero_counter = 0;
        var zeros = "";
        for (var i=0; i < fl_s.length; i++){
            if (fl_s[i] === "0") {
                zero_counter +=1;
                zeros += fl_s[i];
            }
            else break;
        }
        var precision = zero_counter + 1;
        new_s  = int_s + "." +  fl_s.slice(0, precision);
        newdelta = parseFloat(new_s);
        // console.log(data.delta, newdelta);
        var slider_min = log10(newdelta);
        var slider_max = log10((data.xmax - data.xmin));
        var slider_value = log10((data.xmax - data.xmin) / Math.sqrt(data.length)); // sqare-root choice
        var slider_step  = ((slider_max - slider_min) / 1000);
        // console.log(slider_min, slider_max, slider_value, slider_step);

        // FIX. 0.5 is half step of flot, IF is it automatically
        // calcilated, should be fixed here
        var x_axis_min = data.xmin - 0.5;
        var x_axis_max = data.xmax + 0.5;




        var slider = {
            min: slider_min,
            max: slider_max,
            value: slider_value,
            step: slider_step,
            slide: function(e, obj){
                var w = obj.value;
                drawPlot(Math.pow(10,w));
            },
            units: 'unit'
        };

        $('#slider').slider(slider);
        $("#slider_value").html(Math.pow(10, slider_value).toFixed(precision));



        var getData = function(w) {
            var res = [],
                len = data.length,
                d = data.arr,
                aj = [], // Left bounds of intervals
                bj = [], // Right bounds of intervals
                nj = [], // Numbers of inserions
                xsum = [],
                ysum = [],
                k = Math.ceil((data.xmax - data.xmin)/w),
                k1, k2;

            for (k2 = 0; k2 < k; k2 += 1) {
                  aj[k2] = data.xmin + k2*w;
                  bj[k2] = aj[k2] + w;
                  nj[k2] = 0;
                  xsum[k2] = 0;
                  ysum[k2] = 0;
            }

            for (k1 = 0; k1 < len; k1 += 1) {
                for (k2 = 0; k2 < k; k2 += 1) {
                    if ((d[k1][0] >= aj[k2]) && (d[k1][0] <= bj[k2])) {
                        nj[k2]++;
                        xsum[k2] += d[k1][0];
                        ysum[k2] += d[k1][1];

                        break;
                    }
                }
            }

            for (k2 = 0; k2 < k; k2 += 1) {
              xsum[k2] = aj[k2];
              ysum[k2] = nj[k2]/(w);
              res.push([xsum[k2], ysum[k2]]);
            }

            return res;
        };

        var prev_val;
        var tick_delta;
        // TODO use axis properties
        var format_x_ticks = function (val, axis){
            // console.log(val, prev_val, delta, x_axis_max);
            if (val > x_axis_max - tick_delta) {
                return slider.units;
            }
            else {
                if (tick_delta === undefined){
                    if (prev_val !== undefined)
                        {tick_delta = val - prev_val;}
                    else{
                        prev_val = val;
                        }
                }
                return val;
            }
        };

        var drawPlot = (function(w){
            var plot = $.plot('#histogram',
                [{
                    bars: {
                        show: true,
                        barWidth: w,
                        align: 'left'
                    },
                    data: getData(w)
                }],
                {
                    xaxis: {
                        min: x_axis_min,
                        max: x_axis_max,
                        tickFormatter: format_x_ticks
                    }
                }
            );

            return function(w){
                plot.setData(
                    [{
                        bars: {
                            show: true,
                            barWidth: w,
                            align: 'left'
                        },
                        data: getData(w)
                    }]
                );

                plot.setupGrid();
                plot.draw();
                $("#slider_value").html(w.toFixed(precision));
                // console.log(w);
            };
        }(Math.pow(10, slider_value)));

    });

}());
