(function(reguirejs, require, define){
    define([], function (){
        
	var Point = function(state, fragment, path, x, y, indx){
            
            if (!(this instanceof Point)) {

                return new Point(state, fragment, x, y);
            };
            this['_id'] = state.pointIndx++;
            this.state = state;
            this.fragment = fragment;
            this.paths = [ path ];
            this.coords = [x, y];
            this.indx = {};
            
            this.indx[ path[ "_id" ] ] = indx;
            
            this.point = this.state.R.circle(x, y, 8)
                .attr({"fill": "red"})
//                .click(function(){
//                    console.log("point_id", this._id)
//                }.bind(this))
                .drag(this.dragMove.bind(this), null, this.dragUp.bind(this));
        };

	Point.prototype = {
            reindex : function(){
                var l = this.paths.length;
                        
                while( l-- ){
                    this.indx[ this.paths[ l ][ "_id" ] ] = this.checkPosition( this.paths[ l ] );
                }
                
            },
            
            checkPosition : function( path ){
                var pathCoords = path.getCoords(),
                    pointCoords = this.getCoords();
                if ( pathCoords[0] === pointCoords[0] && pathCoords[1] === pointCoords[1] ) {
                    return 0;
                } else{
                    return 1;
                }
            },
            
            update : function(params, indx, l){
                
                var x = params.x,
                    y = params.y;
                
                if ( l ){
                    x = params.zx;
                    y = params.zy;
                };
                
                this.coords[0] = x;
                this.coords[1] = y;
                
                this.point.attr({
                    cx: x,
                    cy: y
                });
                
                return this;
            },

            dragMove: function(dx, dy, x, y) {
                var l = this.paths.length;
                
                this.coords[0] = x - this.state.SHIFT.left;
                this.coords[1] = y - this.state.SHIFT.top;
                
                while(l--){
                    this.paths[l].fragment.update({
                        x: this.coords[0],
                        y: this.coords[1]
                    }, this.indx[ this.paths[ l ][ "_id" ] ]);            
                }
            },

            get: function(){

                    return this.point;
            },

            getDist: function(point) {
                var x0 = this.coords[0],
                    y0 = this.coords[1],
                    x1 = point.coords[0],
                    y1 = point.coords[1],    
                    dist = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));

                return dist;
            },
                    
            getPath: function(){

                    return this.paths;
            },

            getCoords: function(){

                    return this.coords;
            },

            dragStart: function(){

            },

            dragUp: function(){
                var l = this.paths.length;
                
                while(l--){
                    this.fragment.checkInRadius({
                            x: this.coords[0],
                            y: this.coords[1]
                        }, this.indx[ this.paths[ l ][ "_id" ] ]
                    );
                }  
            },
            
            destroy: function(){
                this.get().remove();
                
                return this;
            }
	};	

	return Point;
    });

})(window.reguirejs, window.require, window.define);