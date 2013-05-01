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


require(['jquery', 'plot/fragment', 'plot/toolbar'], function($, Fragment, Toolbar) {
    $.noConflict();

    var State = {
        R : Raphael(0, 0, 800, 500),
        frags : [],
        points : [],
        paths : [],
        toolbar : [],
        options : {
            inRadius : 30
        },
        pointIndx : 0,
        pathIndx : 0,
        Fragment : Fragment,
        addFragment : function(frag, path, pointStart, pointEnd){
            this.frags.push(frag);
            this.paths.push(path);
            this.points.push(pointStart);
            this.points.push(pointEnd);
        }
    };
    

//    new Fragment(State);
    new Toolbar(State);

});
