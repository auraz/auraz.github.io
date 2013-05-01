(function(reguirejs, require, define){
    define([], function (){
            
    	var Point = function(x, y, state){
            
            if (!(this instanceof Point)) {

                return new Point(x, y, state);
            };
             this['_id'] = state.pointIndx++;
            this.state = state;
            this.x = x
            this.y = y;
            this.initialState = {};
            this.initialState.x = this.x;
            this.initialState.y = this.y;

            this.point = this.state.R.circle(x, y, 6)
                .data("Class", this)
                .attr({"fill": "rgba(255, 0, 0, .2)"})
                .click(function(){
                    console.log("point_id", this._id)
                }.bind(this));

                        
            this.state.points.push(this);
            this.state.sortPointsByX();    

        };

    	Point.prototype = {        
            update : function(x, y){                
                this.x = x || this.x;
                this.y = y || this.y;

                this.point.attr({
                    cx: this.x,
                    cy: this.y
                });
                
                return this;
            },
            get: function(){

                    return this.point;
            },
            getInitialState: function(){
                var state = this.initialState;
                this.update(state.x, state.y);
            },
            getDist: function(point) {
                var x0 = this.coords[0],
                    y0 = this.coords[1],
                    x1 = point.coords[0],
                    y1 = point.coords[1],    
                    dist = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));

                return dist;
            },
            getPosition: function(){
                var points = this.state.points,
                    l = points.length,
                    i = 0;

                for( i = 0; i < l; i++ ){

                    if (points[i]._id === this._id){
                        
                        return l;
                    }
                }
                return -1;
            },                    
            getPath: function(){
                    return this.path;
            },
            hide: function(){
                this.get().hide();

                return this;
            },
            destroy: function(){
                this.get().remove();
                
                return this;
            }
    	};	

    	return Point;
    });

})(window.reguirejs, window.require, window.define);