(function(reguirejs, require, define){
    define([
        'jquery',
        'src/v1/scripts/plot/fragment', 
        'src/v1/scripts/plot/toolbar'
    ], function ($, Fragment, Toolbar){
        
        var Plot = function(){
            var State = (function(){
                var R = Raphael(document.getElementById('plot-v1'), 800, 500),
                    canvas = $(R.canvas), 
                    canvasOffset = canvas.offset();
                    
                return {
                    R : R,
                    BOUNDING_BOX: {
                        TOP: 20,
                        RIGHT: 800,
                        BOTTOM: 500,
                        LEFT: 150,
                        MAX_X_VALUE: 795,
                        MAX_Y_VALUE: 495
                    },
                    SHIFT: {
                        'top': canvasOffset.top,
                        'left': canvasOffset.left
                    },
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
            }());
    
            new Toolbar(State);
        };
        
        return Plot;
    });

})(window.reguirejs, window.require, window.define);