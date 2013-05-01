(function(reguirejs, require, define) {

    define([
        'jquery', 
        'src/v1/scripts/plot/fragment', 
        'src/v1/scripts/plot/primitives/path'
    ], 
    function($, Fragment, Path) {

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
                ],
                frag, Dx, Dy;
            
        
            if (!(this instanceof Toolbar)) {

                return new Toolbar(state);
            }

            this.state = state;
            this.blocks = [];
            this.variants = [
                "line",
                "curve"
            ];

            var dragStart = function() {
                var type = this.data("pType"),
                    pos =  this.data("pos");    
            
                frag = new Fragment(state, type);
                dragMove(pos.x, pos.y);
                Dx = Dy = null;
            };
            
            var dragEnd = function() {
                Dx = Dy = null;
            };

            var dragMove = function(dx, dy, x, y) {
                var path = frag.path.getPath(),
                    i,
                    l = path[1].length,
                    tmp = {
                        dx: dx,
                        dy: dy
                    },
                    dx = (dx - (Dx || 0)),
                    dy = (dy - (Dy || 0));
                    
                path[0][1] += dx;
                path[0][2] += dy;
                Dx = tmp.dx;
                Dy = tmp.dy;

                for (i = 1; i < l; i += 2) {
                    path[1][i] += dx;
                }

                for (i = 2; i < l; i += 2) {
                    path[1][i] += dy;
                }

                frag.update({
                    x: path[0][1],
                    y: path[0][2],
                    zx: path[1][5] || path[1][1] || 0,
                    zy: path[1][6] || path[1][2] || 0,
                    ax: path[1][1] || 0,
                    ay: path[1][2] || 0,
                    bx: path[1][3] || 0,
                    by: path[1][4] || 0
                });
                
            };
            
            
            for ( var i = 0, l = this.variants.length; i < l; i++ ){
                
                new Path(state, this, this.variants[i])
                        .undrag()
                        .get()
//                        .transform( Raphael.format('t{0}, {1}', 10, 70*i + 20 ) )
                        .data({
                            pType : this.variants[i],
                            pos : { 
                                x : 0,
                                y : 0
                            }
                        })
                        .drag(dragMove, dragStart, dragEnd);
            }

            (function(){
                
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


