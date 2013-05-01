(function(reguirejs, require, define) {

    define(['jquery', 'plot/fragment', 'plot/primitives/path'], function($, Fragment, Path) {

        var Toolbar = function(state) {
            var l, 
                i,
                frag,
                Dx,
                Dy;
        
            if (!(this instanceof Toolbar)) {

                return new Toolbar(state);
            }

            this.state = state;
            this.blocks = [];
            this.variants = [
                "line",
                "curve",
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
            
            
            for ( i = 0, l = this.variants.length; i < l; i++ ){
                
                new Path(state, this, this.variants[i])
                        .undrag()
                        .get()
                        .transform( Raphael.format('t{0}, {1}', 10, 70*i + 20 ) )
                        .data({
                            pType : this.variants[i],
                            pos : { 
                                x : 10,
                                y :  70 * i + 20
                            }
                        })
                        .drag(dragMove, dragStart, dragEnd);
            }

            (function(){
                state.R.path("M150 20 L150 20 150 480 L150 480 710 480");         
                state.R.path("M150 20 L150 20 710 20 L710 20 710 480").attr({
                    "stroke-dasharray" : "- ",
                    "stroke-width" : .7,
                    "opacity" : .7
                }); 
            }());
            
        };

        return Toolbar;
    });

})(window.reguirejs, window.require, window.define);


