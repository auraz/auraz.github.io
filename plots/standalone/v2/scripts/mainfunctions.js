requirejs.config({
    baseUrl: 'scripts/',
    paths: {
        'jquery': 'jquery-1.7.2.min',
        'libcanvas': 'libcanvas',
        'atom': 'atom'
    },
    'shim': {
        'libcanvas': {
            'exports': 'LibCanvas',
            'atom': 'atom'
        }
    }
});


require(['jquery', 'plot/app'], function($, app) {
    $.noConflict();

    new app();

});
