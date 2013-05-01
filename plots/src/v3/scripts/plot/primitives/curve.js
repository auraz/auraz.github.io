(function(reguirejs, require, define){
    define([
        'jquery', 
        'src/v3/scripts/plot/primitives/point'
    ], 
    function($, Point){

    var Curve = function(from, to, cFr, cTo, state){
        var self = this;

        if (!(this instanceof Curve)) {
            return new Curve(from, to, cFr, cTo, state);
        }            

        this.state = state;
        this.pathArray = [["M", from.x, from.y], ["C", cFr.x, cFr.y, cTo.x, cTo.y, to.x, to.y]];
        this.initialState = [["M", from.x, from.y], ["C", cFr.x, cFr.y, cTo.x, cTo.y, to.x, to.y]];
        
        this.kcTo = {
            'x': (cTo.x - from.x)/(to.x - from.x),
            'y': (cTo.y - from.y)/(to.y - from.y)
        };
        this.kcFr = {
            'x': (cFr.x - from.x)/(to.x - from.x),
            'y': (cFr.y - from.y)/(to.y - from.y)
        };
        
        this.controls = this.state.R.set(
            from.get().hide(), 
            to.get().hide(),
            cFr.get().hide(),
            cTo.get().hide()
        );
            
        this.path = this.state.R.path(this.pathArray)
                .attr({"stroke-width": "7", "stroke": "#000", "stroke-linecap": "round"})
                .drag(this.move, down, up)
                .hover(this.highlight, this.unHighlight);

        this.state.paths.push(this);

        this.path.update = function(x, y) {
            var i,
                l = self.pathArray[1].length,
                j = self.controls.length;

            self.pathArray[0][1] += x;
            self.pathArray[0][2] += y;
    
            for ( i = 1; i < l; i += 2 ){
                self.pathArray[1][i] += x; 
            }
            
            for ( i = 2; i < l; i += 2 ){
                self.pathArray[1][i] += y; 
            }  

            self.path.attr({ path : self.pathArray });
            
            while(j--){
                self.controls[j].update(x, y, true);    
            }
        };

        this.controls[0].update = function(x, y, flag){
            var X = this.attr("cx") + x,
                Y = this.attr("cy") + y;
            this.attr({cx: X, cy: Y});
            if (!flag){
                self.pathArray[0][1] = X;
                self.pathArray[0][2] = Y;
                self.controls[2].update(x, y);
            }
        };

        this.controls[1].update = function(x, y, flag){
            var X = this.attr("cx") + x,
                Y = this.attr("cy") + y;
            this.attr({cx: X, cy: Y});
            if (!flag){
                self.pathArray[1][5] = X;
                self.pathArray[1][6] = Y;
                self.controls[3].update(x, y);
            }
        };

        this.controls[2].update = function(x, y, flag){
            var X = this.attr("cx") + x,
                Y = this.attr("cy") + y;
            this.attr({cx: X, cy: Y});
            if (!flag){
                self.pathArray[1][1] = X;
                self.pathArray[1][2] = Y;
                self.path.attr({path: self.pathArray});
            }
        };

        this.controls[3].update = function(x, y, flag){
            var X = this.attr("cx") + x,
                Y = this.attr("cy") + y;
            this.attr({cx: X, cy: Y});
            if (!flag){
                self.pathArray[1][3] = X;
                self.pathArray[1][4] = Y;
                self.path.attr({path: self.pathArray});
            }
        };

        this.controls.drag(controlsMove, controlsUp);

        function controlsMove(dx, dy) {
            this.update(dx - (this.dx || 0), dy - (this.dy || 0));
            this.dx = dx;
            this.dy = dy;
        }
        function controlsUp() {
            this.dx = this.dy = 0;
        }

        function down(x, y){
            var state = self.state,
                firstPath, lastPath,
                prevPath;
            
            this.isDragged = true;
            self.highlight.call(this);
            self.intersactionPoint = null;

            if (self.isInsideBoundingBox()) {
                self.getInitialState();
                state
                    .removeNextPaths(self);
                
                prevPath = state.getPrevPath(self);
                
                if(prevPath) {
                    prevPath.interpolate(true);
                }
                
                firstPath = state.getFirstPath();             
                
                if(firstPath.path.isDragged){
                    firstPath.getInitialState();
                } else if(firstPath === lastPath){
                    firstPath.interpolate();
                }
                
                if(self.isFirst) {
                    state.isFirst = false;
                }
            } else {
                self.cloneSegment();
            }
        }

        function up(e){
            var state = self.state,
                intersaction, path, point;
              
            if (!self.isInsideBoundingBox()){
                self.destroy();

                return false;
            };

            if (!state.isFirst) {
                // If element is first inside bounding box we have to 
                // interpolate it
                state.isFirst = self.isFirst = true;
                self.interpolate();
            } else{
                // Otherwise we are finding intersection
                intersaction = state.findIntersactions(self);
                path = intersaction.path;
                point = intersaction.point;

                if(point) {
                    // If intersection is present, join paths and iterpolate 
                    // last path (current)                    
                    self.intersactionPoint = point;
                    joinPaths(path, self, point);
                    state.removeNextPaths(self);
                    self.interpolate(true);
                    
                } else {
                    // Otherwise, we remove current Curve and return from function
                    self.destroy();
                    
                    return false;
                }
            }

            this.dx = this.dy = null;
            this.isDragged = false; 
            self.unHighlight.call(this);

        }

        function joinPaths (from, to, point){
            var X = point.x - self.pathArray[0][1],
                Y = point.y - self.pathArray[0][2],
                BB = self.state.BOUNDING_BOX,
                cToX = BB.MAX_X_VALUE - to.pathArray[1][5],
                cToY = BB.MAX_Y_VALUE - to.pathArray[1][6],
                X1, Y1;

            if (typeof from.pathArray[1][5] === "number"){
                X1 = point.x - from.pathArray[1][5];
                Y1 = point.y - from.pathArray[1][6];
            } else{
                X1 = point.x - from.pathArray[1][1];
                Y1 = point.y - from.pathArray[1][2];
            }    

            from.controls[1].update(X1, Y1);
            
            if (from.updateCoefs){    
                  from.updateCoefs(point, {                     
                    'x': from.pathArray[0][1],
                    'y': from.pathArray[0][2]
                  });
            }

            to.controls[0].update(X, Y);
            to.controls[1].update(cToX, cToY);
            
            if (to.updateCoefs){                  
                to.interpolate(true);
            }
        }
    };

    Curve.prototype = {
        'move' : function(dx, dy, x, y){
            this.update(dx - (this.dx || 0), dy - (this.dy || 0));
            this.dx = dx;
            this.dy = dy;
        },      
        'get': function() {

            return this.path;
        },
        'getInitialState': function(){
            var self = this,
                i = 0,
                path = this.pathArray,
                initial = this.initialState,
                l = path[1].length,
                X = path[0][1] - initial[0][1],
                Y = path[0][2] - initial[0][2];

            path[0][1] = initial[0][1];
            path[0][2] = initial[0][2];
    
            for ( i = 1; i < l; i += 2 ){
                path[1][i] = initial[1][i]; 
            }
            
            for ( i = 2; i < l; i += 2 ){
                path[1][i] = initial[1][i]; 
            } 

            $.each(this.controls, function( index, element ){
                element.data("Class").getInitialState(); 
            });

            this.path.update(X, Y);
        },
        'undrag': function(){
            this.path.undrag();
            
            return this;
        },
        'destroy': function(){
            var self = this;

            this.path.remove();
            this.state.paths = this.state.paths.filter(function(item){
                
                return item !== self;
            });

            this.state.points = this.state.points.filter(function(item){
                var bool = false;

                if(item.point.id !== self.controls[0].id && item.point.id !== self.controls[1].id &&
                   item.point.id !== self.controls[2].id && item.point.id !== self.controls[3].id){
                    bool = true;
                } else{
                    item.destroy();
                }

                return bool;
            });

            return true;
        },
        'highlight': function(){
            if(!this.isDragged){
                this.toFront()
                    .attr({
                        "stroke": "green"
                    });   
            }
        },
        'unHighlight': function(){   
            if(!this.isDragged){             
                this.attr({
                    "stroke": "#000"
                });
            }
        },
        'isInsideBoundingBox': function(){
            var BB = this.state.BOUNDING_BOX;

            if (this.pathArray[0][1] > BB.LEFT && this.pathArray[1][1] < BB.RIGHT && 
                this.pathArray[0][2] > BB.TOP && this.pathArray[1][2] < BB.BOTTOM){

                return true;
            }

            return false;
        },
        'updateCoefs': function(coords, shift){
            var controls = this.controls,
                state = this.state,
                path = this.pathArray,
                BB = state.BOUNDING_BOX,
                shift = {
                  'x': shift && shift.x || BB.LEFT,
                  'y': shift && shift.y || BB.TOP
                },
                c = {
                    'x': coords.x - shift.x,
                    'y': coords.y - shift.y
                },
                from = {
                    'x': c.x * this.kcFr.x + shift.x,
                    'y': c.y * this.kcFr.y + shift.y
                }
                to = {
                    'x': c.x * this.kcTo.x + shift.x,
                    'y': c.y * this.kcTo.y + shift.y
                };
                
                controls[2].attr({
                    cx: from.x,
                    cy: from.y
                })
                
                controls[3].attr({
                    cx: to.x,
                    cy: to.y
                })

                path[1][1] = from.x;
                path[1][2] = from.y;
                path[1][3] = to.x;
                path[1][4] = to.y;
                
                this.path.attr({
                    path: this.pathArray
                });
        },
        'interpolate': function(flag){             
            var state = this.state,
                BB = state.BOUNDING_BOX,
                path = this.pathArray,
                initial = this.initialState,
                delta = {};

            this.getInitialState();
            delta.x0 = flag ? 0 : BB.LEFT - this.pathArray[0][1] + 5;
            delta.x1 = BB.MAX_X_VALUE - this.pathArray[1][5];
            
         
            if(initial[0][2] > initial[1][6]) {
                delta.y0 = flag ? 0 : BB.MAX_Y_VALUE - this.pathArray[0][2];
                delta.y1 = BB.TOP + 5 - this.pathArray[1][6];
            } else {
                delta.y0 = flag ? 0 : BB.TOP - this.pathArray[0][2] + 5;
                delta.y1 = BB.MAX_Y_VALUE - this.pathArray[1][6];
            }
            
            this.controls[0].update(delta.x0, delta.y0);
            this.controls[1].update(delta.x1, delta.y1);
            
            if(flag || initial[0][2] > initial[1][6]) {
                this.updateCoefs({
                    'x': path[1][5],
                    'y': path[1][6]
                }, {
                    'x': path[0][1],
                    'y': path[0][2]
                });                
            } else {
                this.updateCoefs({
                    'x': BB.MAX_X_VALUE,
                    'y': BB.MAX_Y_VALUE
                });
            }
        },
        'cloneSegment': function(){
            var state = this.state,
                path = this.pathArray,
                from = new Point(path[0][1], path[0][2], state),
                to = new Point(path[1][5], path[1][6], state),
                cFr = new Point(path[1][1], path[1][2], state),
                cTo = new Point(path[1][3], path[1][4], state);               
            
            new Curve(from, to, cFr, cTo, state);
        }
    };


    return Curve;
});

})(window.reguirejs, window.require, window.define);