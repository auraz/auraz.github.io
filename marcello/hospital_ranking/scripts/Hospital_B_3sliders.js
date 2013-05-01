(function () {
    var state = {},

    // This defines the variables shown in the sliders.
    sliders = [{
        human_name   : 'Old:',
        machine_name : 'o_3',
        min   : 0,
        max   : 100,
        value : 17
    },{
        human_name   : 'Middle:',
        machine_name : 'm_3',
        min   : 0,
        max   : 100,
        value : 33
    }, {
        human_name   : 'Young:',
        machine_name : 'y_3',
        min   : 0,
        max   : 100,
        value : 50
    }],

    plotInfoEl = $('#plot_info_3'),
    deathRateEl = $('#death_rate_3');

    function plot(sliderId, val) {
        var total, diff, M, temp;

        if (sliderId) {
            diff = 100 - state.var_o_3 - state.var_y_3 - state.var_m_3;
            M = 0.5 * diff;

            if (sliderId === 'y_3') {
                if (state.var_o_3 > Math.abs(M)) {
                    state.var_o_3 = state.var_o_3 + M
                } else {
                    temp = state.var_o_3;
                    state.var_o_3 = 0;
                    M = diff - temp;
                }

                state.var_m_3 = Math.round(100 - state.var_y_3 - state.var_o_3);
                state.var_o_3 = 100 - state.var_m_3 - state.var_y_3;

                state.slider_m_3.slider('value', state.var_m_3);
                state.slider_o_3.slider('value', state.var_o_3);
            } else if (sliderId === 'm_3') {
                if (state.var_o_3 > Math.abs(M)) {
                    state.var_o_3 = state.var_o_3 + M
                } else {
                    temp = state.var_o_3;
                    state.var_o_3 = 0;
                    M = diff - temp;
                }

                state.var_y_3 = Math.round(100 - state.var_m_3 - state.var_o_3);
                state.var_o_3 = 100 - state.var_m_3 - state.var_y_3;

                state.slider_y_3.slider('value', state.var_y_3);
                state.slider_o_3.slider('value', state.var_o_3);
            } else {
                if (state.var_y_3 > Math.abs(M)) {
                    state.var_y_3 = state.var_y_3 + M
                } else {
                    temp = state.var_y_3;
                    state.var_y_3 = 0;
                    M = diff - temp;
                }

                state.var_m_3 = Math.round(100 - state.var_o_3 - state.var_y_3);
                state.var_y_3 = 100 - state.var_o_3 - state.var_m_3;
                
                state.slider_m_3.slider('value', state.var_m_3);
                state.slider_y_3.slider('value', state.var_y_3);
            }
        }

        total = (state.var_y_3 * 2 + state.var_m_3 * 5 + state.var_o_3 * 8) / 100;
        plotInfoEl.text(
            '' +
            Math.round(state.var_y_3) + '%\u00D72/1000 + ' +
            Math.round(state.var_m_3) + '%\u00D75/1000 + ' +
            Math.round(state.var_o_3) + '%\u00D78/1000 = ' +
            Math.round(total) + '/1000 deaths per visit'
        );
        deathRateEl.text('Total death rate is ' + Math.round(total) + ' per thousand visits');
    
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

            $('#applet_3').append(
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
