(function () {
    var state = {},

    // This defines the variables shown in the sliders.
    sliders = [{
        human_name   : 'Middle:',
        machine_name : 'm',
        min   : 0,
        max   : 100,
        value : 33
    }, {
        human_name   : 'Young:',
        machine_name : 'y',
        min   : 0,
        max   : 100,
        value : 50
    }],

    plotInfoEl = $('#plot_info'),
    deathRateEl = $('#death_rate'),
    oldEl = $('#old');

    state.var_o = 100 - sliders[0].value - sliders[1].value;

    function plot(sliderId, val) {
        var total, diff, M, temp;

        if (sliderId) {
            diff = 100 - state.var_o - state.var_y - state.var_m;
            M = 0.5 * diff;

            if (sliderId === 'y') {
                if (state.var_o > Math.abs(M)) {
                    state.var_o = state.var_o + M
                } else {
                    temp = state.var_o;
                    state.var_o = 0;
                    M = diff - temp;
                }

                state.var_m = 100 - state.var_y - state.var_o;
                state.slider_m.slider('value', state.var_m);
            } else {
                if (state.var_o > Math.abs(M)) {
                    state.var_o = state.var_o + M
                } else {
                    temp = state.var_o;
                    state.var_o = 0;
                    M = diff - temp;
                }

                state.var_y = 100 - state.var_m - state.var_o;
                state.slider_y.slider('value', state.var_y);
            }
        }

        total = (state.var_y * 2 + state.var_m * 5 + state.var_o * 8) / 100;
        plotInfoEl.text(
            '' +
            Math.round(state.var_y) + '%\u00D72/1000 + ' +
            Math.round(state.var_m) + '%\u00D75/1000 + ' +
            Math.round(state.var_o) + '%\u00D78/1000 = ' +
            Math.round(total) + '/1000 deaths per visit'
        );
        deathRateEl.text('Total death rate is ' + Math.round(total) + ' per thousand visits');
        oldEl.text(Math.round(state.var_o) + '%');

        $.each(sliders, function (index, slider) {
            var mname = slider['machine_name'],
                value = state['slider_' + slider['machine_name']].slider('option', 'value');
            
                if (slider['machine_name'] === sliderId){
                    value = val;
                }

            $('#ctr_' + mname).html(value + '%');
        });

    }

    function replot(sliderId, val) {
        var value, mname;

        if (sliderId) {
            if (state['slider_' + sliderId + '_lock'] === true) {
                return;
            }
        }

        if (!sliderId) {            
            $.each(sliders, function (index, slider) {
                var mname = slider['machine_name'],
                    value = state['slider_' + slider['machine_name']].slider('option', 'value');

                state['var_' + slider['machine_name']] = value;
                $('#ctr_' + mname).html(value + '%');
            });
        } else {
            state['var_' + sliderId] = val;
        }

        plot(sliderId, val);
    }

    $(function () {
        $.each(sliders, function (index, slider) {
            var selector;

            $('#applet').append(
                $(
                    '<tr>' +
                        '<td>' + slider['human_name'] + '</td>' +
                        '<td width=50><div id=ctr_' + slider['machine_name'] + '></div></td>' +
                        '<td width=400><div id=' + slider['machine_name'] + '></div></td>' +
                    '</tr>'
                )
            );

            selector = $('#' + slider['machine_name']);
            state['slider_' + slider['machine_name']] = selector;
            state['slider_' + slider['machine_name'] + '_lock'] = true;

            selector.slider({
                max: slider['max'],
                min: slider['min'],
                value: slider['value'],
                slide: function (e, obj) {
                    var sliderId = slider['machine_name'];
                    replot(sliderId, obj.value);
                },
                start: function() {
                    state['slider_' + slider['machine_name'] + '_lock'] = false;
                },
                stop: function() {
                    state['slider_' + slider['machine_name'] + '_lock'] = true;
                }
            });
            $('#ctr_' + slider['machine_name']).html('0');
            selector.find('a').data('slider_id', slider['machine_name']);
        });

        replot();
    });

}());
