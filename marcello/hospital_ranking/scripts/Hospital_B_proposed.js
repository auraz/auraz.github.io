(function () {
    var state = {};

    // This defines the variables shown in the sliders.
    var sliders = [{
        human_name   : 'Middle:',
        machine_name : 'm',
        min   : 0,
        max   : 100,
        value : 33,
        old_value: 33
    }, {
        human_name   : 'Young:',
        machine_name : 'y',
        min   : 0,
        max   : 100,
        value : 50,
        old_value: 50
    }];

    var sl = {'m': sliders[0], 'y': sliders[1]};

    plotInfoEl = $('#plot_info'),
    deathRateEl = $('#death_rate'),
    oldEl = $('#old');

    state.var_o = 100 - sliders[0].value - sliders[1].value;

    function get_other_id(s){
        if (s === 'y')
            {return 'm';}
        else
            {return "y";}
    }

    function plot(sliderId, val) {
        var total, diff, M, temp;
        if (sliderId) {
            var delta = val - sl[sliderId].old_value;
            // console.log(sliderId, val, sl[sliderId].value, delta);
            sl[sliderId].old_value = val;
            sl[sliderId].value = val;
            pre_var_o = 100 - sl[get_other_id(sliderId)].value - val;

            // console.log(get_other_id(sliderId), state.var_o, pre_var_o);
            if (pre_var_o < 0) {
                sl[get_other_id(sliderId)].value = 100 - val;
                sl[get_other_id(sliderId)].old_value = 100 - val;
                state.var_o = 0;
                // console.log(state.var_o, sl['m'].value, sl['y'].value);
            } else {
                state.var_o = pre_var_o;
            }

            state.slider_y.slider('value', sl['y'].value);
            state.slider_m.slider('value', sl['m'].value);
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
