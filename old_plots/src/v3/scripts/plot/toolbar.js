(function(reguirejs, require, define) {

    define([
        'jquery', 
        'src/v3/scripts/plot/primitives/curve', 
        'src/v3/scripts/plot/primitives/line', 
        'src/v3/scripts/plot/primitives/point'
    ], 
    function($, Curve, Line, Point) {

        var Toolbar = function(state) {
            var BB = state.BOUNDING_BOX,
                CENTER = {
                    'x': (BB.RIGHT - BB.LEFT)*0.5 + BB.LEFT,
                    'y': (BB.BOTTOM - BB.TOP)*0.5 + BB.TOP
                },
                axisArray = [
                    ["M", BB.LEFT, CENTER.y], 
                    ["L", BB.RIGHT, CENTER.y],
                    ["M", CENTER.x, BB.TOP], 
                    ["L", CENTER.x, BB.BOTTOM],
                ];
        
            if (!(this instanceof Toolbar)) {

                return new Toolbar(state);
            }

            this.state = state;

            (function(){
                var lineFrom = new Point(20, 20, state),
                    lineTo = new Point(100, 20, state),
                    
                    curveUpTLTRFrom = new Point(20, 50, state),
                    curveUpTLTRTo = new Point(100, 130, state),
                    curveUpTLTRCFrom = new Point(20, 100, state),
                    curveUpTLTRCTo = new Point(40, 130, state),
                    
                    curveDownTLBRFrom = new Point(20, 150, state),
                    curveDownTLBRTo = new Point(100, 230, state),
                    curveDownTLBRCFrom = new Point(70, 150, state),
                    curveDownTLBRCTo = new Point(100, 170, state);    
                    
                    curveUpBLTRFrom = new Point(20, 330, state),
                    curveUpBLTRTo = new Point(100, 250, state),
                    curveUpBLTRCFrom = new Point(70, 330, state),
                    curveUpBLTRCTo = new Point(100, 310, state);    
                    
                    curveDownBLTRFrom = new Point(20, 430, state),
                    curveDownBLTRTo = new Point(100, 350, state),
                    curveDownBLTRCFrom = new Point(20, 400, state),
                    curveDownBLTRCTo = new Point(40, 350, state);    
                              
                new Line(lineFrom, lineTo, state);
                new Curve(curveUpTLTRFrom, curveUpTLTRTo, curveUpTLTRCFrom, curveUpTLTRCTo, state);   
                new Curve(curveDownTLBRFrom, curveDownTLBRTo, curveDownTLBRCFrom, curveDownTLBRCTo, state);
                new Curve(curveUpBLTRFrom, curveUpBLTRTo, curveUpBLTRCFrom, curveUpBLTRCTo, state);   
                new Curve(curveDownBLTRFrom, curveDownBLTRTo, curveDownBLTRCFrom, curveDownBLTRCTo, state);   
                
                state.R.path(axisArray);         
                state.R.rect(BB.LEFT, BB.TOP, BB.RIGHT - BB.LEFT, BB.BOTTOM - BB.TOP).attr({
                    "stroke-width" : .7,
                    "opacity" : .7
                });   
                
                for( var i = CENTER.y; i < BB.BOTTOM; i += 25){
                    axisArray = [
                        ["M", BB.LEFT, i], 
                        ["L", BB.RIGHT, i],
                    ];
                    state.R.path(axisArray).attr({
                            "stroke-dasharray" : ". ",
                            "opacity" : .3
                        });    
                }
                
                for( var j = CENTER.y; j > BB.TOP; j -= 25){
                    axisArray = [
                        ["M", BB.LEFT, j], 
                        ["L", BB.RIGHT, j],
                    ];
                    state.R.path(axisArray).attr({
                            "stroke-dasharray" : ". ",
                            "opacity" : .3
                        });    
                }
                
                for( var k = CENTER.x; k > BB.LEFT; k -= 25){
                    axisArray = [
                        ["M", k, BB.TOP], 
                        ["L", k, BB.BOTTOM],
                    ];
                    state.R.path(axisArray).attr({
                            "stroke-dasharray" : ". ",
                            "opacity" : .3
                        });    
                }
                
                for( var m = CENTER.x; m < BB.RIGHT; m += 25){
                    axisArray = [
                        ["M", m, BB.TOP], 
                        ["L", m, BB.BOTTOM],
                    ];
                    state.R.path(axisArray).attr({
                            "stroke-dasharray" : ". ",
                            "opacity" : .3
                        });    
                }

            }());
            
        };

        return Toolbar;
    });

})(window.reguirejs, window.require, window.define);


