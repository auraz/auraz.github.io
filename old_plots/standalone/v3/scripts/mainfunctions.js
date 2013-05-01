requirejs.config({
    baseUrl: 'scripts/',
    paths: {
        'jquery': 'jquery-1.7.2.min',
        'raphael': 'raphael-min'
    },
    'shim': {
        'raphael': {
            'exports': 'Raphael'
        }
    }
});


require(['plot/plot'], 
function(Plot) {
    new Plot();
});
