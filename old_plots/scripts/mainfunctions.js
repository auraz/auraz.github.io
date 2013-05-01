requirejs.config({
    baseUrl: '',
    paths: {
        'jquery': 'scripts/jquery-1.7.2.min',
        'raphael': 'scripts/raphael-min'
    },
    'shim': {
        'raphael': {
            'exports': 'Raphael'
        }
    }
});


require(['src/v1/scripts/plot/plot', 'src/v2/scripts/plot/plot', 'src/v3/scripts/plot/plot'], 
function(Plot_v1, Plot_v2, Plot_v3) {
    new Plot_v1();
    new Plot_v2();
    new Plot_v3();
});
