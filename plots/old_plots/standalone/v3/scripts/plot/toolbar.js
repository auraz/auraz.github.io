(function(reguirejs, require, define) {

    define(['jquery', 'plot/primitives/curve', 'plot/primitives/line', 'plot/primitives/point'], function($, Curve, Line, Point) {

        var Toolbar = function(state) {
        
            if (!(this instanceof Toolbar)) {

                return new Toolbar(state);
            }

            this.state = state;

            (function(){
                var lineFrom = new Point(20, 20, state),
                    lineTo = new Point(100, 20, state),
                    
                    curveUpFrom = new Point(20, 50, state),
                    curveUpTo = new Point(100, 130, state),
                    curveUpCFrom = new Point(20, 100, state),
                    curveUpCTo = new Point(40, 130, state),
                    
                    curveDownFrom = new Point(20, 150, state),
                    curveDownTo = new Point(100, 230, state),
                    curveDownCFrom = new Point(70, 150, state),
                    curveDownCTo = new Point(100, 170, state);    
                
                state.R.path("M150 20 L150 20 150 480 L150 480 710 480");         
                state.R.path("M150 20 L150 20 710 20 L710 20 710 480").attr({
                    "stroke-dasharray" : "- ",
                    "stroke-width" : .7,
                    "opacity" : .7
                });         

                new Line(lineFrom, lineTo, state);
                new Curve(curveUpFrom, curveUpTo, curveUpCFrom, curveUpCTo, state);
                new Curve(curveDownFrom, curveDownTo, curveDownCFrom, curveDownCTo, state);   

            }());
            
        };

        return Toolbar;
    });

})(window.reguirejs, window.require, window.define);


