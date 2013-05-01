(function(reguirejs, require, define){
    define([], function(){
        
        var Line = function(state, fragment, params){
            
            if (!(this instanceof Line)) {

                return new Line(state, x, y, ax, ay);
            };
            
            this.path = [["M", params.x, params.y], ["L", params.zx, params.zy]];
            this.state = state;
            this.fragment = fragment;
            
            this.line = this.state.R.path(this.path)
                    .attr({"stroke-width": "5", "stroke": "#000"})
                    .transform("t10, 10")
                    .drag(this.dragMove.bind(this), this.dragUp.bind(this));
        };
        
        Line.prototype = {
            undrag: function() {
                this.line.undrag();
                
                return this;
            }, 

            update : function(params, indx) {
                var x = params.x,
                    y = params.y,
                    zx = params.zx || this.path[1][1],
                    zy = params.zy || this.path[1][2];
                
                if (typeof indx === "number" && indx === 1){
                    zx = x;
                    zy = y;
                    this.path[0][1] = this.path[0][1];
                    this.path[0][2] = this.path[0][2];
                    this.path[1][1] = zx;
                    this.path[1][2] = zy;   
                } else {
                    this.path[0][1] = x;
                    this.path[0][2] = y;
                    this.path[1][1] = zx;
                    this.path[1][2] = zy;   
                }             
                
                this.line.attr({ path : this.path });
                
                return this;
             },
                    
            dragMove: function(dx, dy, x, y) { 
                var tmp = {
                        dx : dx,
                        dy : dy
                    }, 
                    dx = (dx - (this.dx || 0)),
                    dy = (dy - (this.dy || 0));
            
                this.path[0][1] += dx;
                this.path[0][2] += dy;
                this.path[1][1] += dx;
                this.path[1][2] += dy;
                this.dx = tmp.dx;
                this.dy = tmp.dy;
                
                this.fragment.update({
                    x : this.path[0][1], 
                    y : this.path[0][2], 
                    zx : this.path[1][1], 
                    zy : this.path[1][2]
                });
            },
                    
            dragUp: function() { 
                this.dx = this.dy = null;
                this.undrag();
            },

            get: function() {

                return this.line;
            },
            getPath: function() {

                return this.path;
            },
            getCoords: function() {

                return this.getStartCoords().concat(this.getEndCoords());
            },
            getStartCoords: function() {

                return this.path[0].slice(1, 3);
            },
            getEndCoords: function() {

                return this.path[1].slice(1, 3);
            }
        };
        
        var Curve = function(state, fragment, params){
            
            if (!(this instanceof Curve)) {

                return new Curve(state, x, y, ax, ay, bx, by, zx, zy);
            };
            
            
            this.path = [["M", params.x, params.y], ["C", params.ax, params.ay, 
                        params.bx, params.by, params.zx, params.zy]];
            this.state = state;
            this.fragment = fragment;
                
            this.curve = this.state.R.path(this.path)
                    .attr({"stroke-width": "5", "stroke": "#000"})
                    .transform("t10, 10")
                    .drag(this.dragMove.bind(this), this.dragUp.bind(this));
        };
        
        Curve.prototype = {
            undrag : function(){
                this.curve.undrag();
                
                return this;
            }, 
            
            update : function(params, indx) {
                var x = params.x,
                    y = params.y,
                    zx = params.zx || this.path[1][5],
                    zy = params.zy || this.path[1][6],
                    ax = params.ax || this.path[1][1],
                    ay = params.ay || this.path[1][2],
                    bx = params.bx || this.path[1][3],
                    by = params.by || this.path[1][4];

                if (typeof indx === "number" && indx === 1) {
                    zx = x;
                    zy = y;
                    this.path[0][1] = this.path[0][1];
                    this.path[0][2] = this.path[0][2];
                    this.path[1][5] = zx;
                    this.path[1][6] = zy;
                } else {
                    this.path[0][1] = x;
                    this.path[0][2] = y;
                    this.path[1][1] = ax;
                    this.path[1][2] = ay;
                    this.path[1][3] = bx;
                    this.path[1][4] = by;
                    this.path[1][5] = zx;
                    this.path[1][6] = zy;
                }      

                this.curve.attr({ path : this.path });
                
                return this;
            },
                    
            dragMove : function(dx, dy, x, y){
                var i,
                    l = this.path[1].length,
                    tmp = {
                        dx: dx,
                        dy: dy
                    },
                    dx = (dx - (this.dx || 0)),
                    dy = (dy - (this.dy || 0));
        
                this.path[0][1] += dx;
                this.path[0][2] += dy;
                this.dx = tmp.dx;
                this.dy = tmp.dy;
                
                for ( i = 1; i < l; i += 2 ){
                    this.path[1][i] += dx; 
                }
                
                for ( i = 2; i < l; i += 2 ){
                    this.path[1][i] += dy; 
                }

                this.fragment.update({
                    x : this.path[0][1], 
                    y : this.path[0][2], 
                    zx : this.path[1][5], 
                    zy : this.path[1][6], 
                    ax : this.path[1][1],
                    ay : this.path[1][2], 
                    bx : this.path[1][3], 
                    by : this.path[1][4]
                });
            },
                    
            dragUp : function(){
                this.dx = this.dy = null;
                this.undrag();
            },
                    
            get: function() {

                return this.curve;
            },
            getPath: function() {

                return this.path;
            },
            getCoords: function() {

                return this.getStartCoords().concat(this.getEndCoords());
            },
            getStartCoords: function() {

                return this.path[0].slice(1, 3);
            },
            getEndCoords: function() {

                return this.path[1].slice(4, 6);
            }
        
        };

        var Path = function(state, fragment, type){
            
            if (!(this instanceof Path)) {

                    return new Path(state, type);
            };
            
            this.state = state;
            this.type = type;
            this.fragment = fragment;

            if (this.type === "line"){
                this.path = new Line(state, fragment, {
                                                    x : 0,
                                                    y : 0,
                                                    zx : 50,
                                                    zy : 50
                                                });
            }else{
                this.path = new Curve(state, fragment, {
                                                    x : 0,
                                                    y : 0,
                                                    ax : 0,
                                                    ay : 50,
                                                    bx : 50,
                                                    by : 50,
                                                    cx : 50,
                                                    cy : 50,
                                                    zx : 50,
                                                    zy : 50,
                                                });
            };
            
            this.path['_id'] = state.pathIndx++;
            
            return this.path;
	};

        return Path;
    });

})(window.reguirejs, window.require, window.define);