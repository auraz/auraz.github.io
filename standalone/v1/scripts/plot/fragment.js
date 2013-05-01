(function(reguirejs, require, define){

define(['jquery', 'plot/primitives/path', 'plot/primitives/point'], function($, Path, Point) {

    var Fragment = function(state, type){
        var pointStart, 
            pointEnd,
            coords;

        if (!(this instanceof Fragment)){
        
            return new Fragment(state);
        }
        
        this.state = state;
        this.path = new Path(state, this, type || "line");      
        coords = this.path.getCoords();
        pointStart = new Point(state, this, this.path, coords[0], coords[1], 0);
        pointEnd = new Point(state, this, this.path, coords[2], coords[3], 1);
        this.state.addFragment(this, this.path, pointStart, pointEnd); 
        
        this.points = [ pointStart, pointEnd ];        
    };
    
    Fragment.prototype = {
        isInRadius : function(x0, y0, x1, y1, r){
            var dist = Math.sqrt( (x1 - x0)*(x1 - x0) + (y1 - y0)*(y1 - y0) ),
                r = r || this.state.options.inRadius;
            
            if ( r > dist){
                
                return true;
            };

            return false;  
        },
                
        getClosestPoint : function(point){

            if ( this.points[0].getDist(point) > this.points[1].getDist(point)){
                
                return this.points[1];
            }
            
            return this.points[0];
        },
        
        checkInRadius: function(params, indx){
            var s = this.state,
                len_points = s.points.length,
                point,
                fragmentToMove,
                pointTo,
                current = this.points[indx];
    
            while( len_points-- ){
                point = s.points[len_points];

                if(this.points[0] === point || this.points[1] === point){
                    continue;
                }

                if (this.isInRadius(point.coords[0], point.coords[1], params.x, params.y)){    
                    // if(point.paths.length > 1 || current.paths.length > 1) continue;       
                    //fragmentToMove = point.fragment,
                    // pointTo = fragmentToMove.getClosestPoint(current);
                    pointTo = point;
                    params.x = point.coords[0];
                    params.y = point.coords[1];

                    this.joinPoints(current, pointTo);
                    this.update(params, indx);
                    current.reindex();

                    break;                    
               }
            }

        },
        
        joinPoints : function(current, pointTo){
            var s = this.state,
                pointToFragmentPoints = pointTo.fragment.points,
                indxToRemove;

            jQuery.each(s.points, function(index, elm){
                if(elm._id === pointTo._id){
                    indxToRemove = index;
                }
            });

            jQuery.each(pointToFragmentPoints, function(index, elm){
                if(elm._id === pointTo._id){
                    pointToFragmentPoints[index] = current;    
                }
            });    
            
            current.get().attr({
                fill : "orange"
            });

            current.paths = current.paths.concat(pointTo.paths);   
            current.point.toFront();   

            pointTo.destroy();
            s.points.splice(indxToRemove, 1); 
        },
        
        update: function(params, indx){
            var l = this.points.length;
            
            if ( typeof indx === "number" ){
                
                this.points[indx].update(params, indx);
                this.path.update(params, indx);
                
            }else {
                
                while ( l-- ) {
                    this.points[l].update(params, null, l);
                };
                this.path.update(params);
                
            }
            

        }
        
    };
    
    return Fragment;
});

})(window.reguirejs, window.require, window.define);


