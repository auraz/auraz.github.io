(function(reguirejs, require, define){
    define([
        'jquery', 
        'src/v3/scripts/plot/primitives/point'
    ], 
    function($, Point){

        var Line = function(from, to, state){
            var self = this;

            if (!(this instanceof Line)) {
                return new Line(from, to, state);
            }

            this.state = state;
            this.pathArray = [["M", from.x, from.y], ["L", to.x, to.y]];
            this.initialState = [["M", from.x, from.y], ["L", to.x, to.y]];
            this.pin = {
                x: 0,
                y: 0
            };

            try{
                this.k = (to.y - from.y)/(to.x - from.x);
            } catch(e) {
                this.k = 0;
            }

            this.controls = this.state.R.set(
                from.get().hide(), 
                to.get().hide()
            );
            
            this.path = this.state.R.path(this.pathArray)
                    .attr({"stroke-width": "7", "stroke": "#000", "stroke-linecap": "round"})
                    .drag(this.move, down, up)
                    .hover(this.highlight, this.unHighlight);
            
            this.state.paths.push(this);

            this.path.update = function(x, y) {
                var j = self.controls.length;
                
                self.pathArray[0][1] += x;
                self.pathArray[0][2] += y;
                self.pathArray[1][1] += x;
                self.pathArray[1][2] += y;
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
                    self.path.attr({path: self.pathArray});
                }
            };

            this.controls[1].update = function(x, y, flag){
                var X = this.attr("cx") + x,
                    Y = this.attr("cy") + y;
                this.attr({cx: X, cy: Y});
                if (!flag){
                    self.pathArray[1][1] = X;
                    self.pathArray[1][2] = Y;
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

            function down() {
                var state = self.state,
                    firstPath, lastPath;
            
                this.isDragged = true;
                self.highlight.call(this);
                self.intersactionPoint = null;
                
//                if (self.isInsideBoundingBox()){
                if (self.pathArray[0][1] >= state.BOUNDING_BOX.LEFT){
                    
                    self.destroy();
                    return;
                    
                    
                    
                    self.getInitialState();
                    state
                        .removeNextPaths(self)
                        .rebuildRules();
                    
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
                    if(self.isFirst){
                        state.isFirst = false;
                    }
                } else {
                    self.cloneSegment();
                }
            }
			
            function up(e) { 
                var state = self.state,
                    intersaction, path, point;
                
                self.pin = {
                    x: e.offsetX,
                    y: e.offsetY
                };

                this.dx = this.dy = null;
                this.isDragged = false; 
                self.unHighlight.call(this);
                    
//                if (!self.isInsideBoundingBox()){
//                    self.destroy();
//                    
//                    return false;
//                }

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
                    
                    if(point){
                        // If intersection is present, join paths and iterpolate 
                        // last path (current)
                        self.intersactionPoint = point;
                            
                        if(self.pin.x <= point.x){
                            joinPaths(self, path, point, true); 
//                            state.removePrevPaths(self);
                        } else {
                            joinPaths(path, self, point); 
//                            state.removeNextPaths(self);
                        }
                        
                    } else {
                        // Otherwise, we remove current Line and return from function
                        self.destroy();
                        return;


                        path = state.getPrevPath(self);
                        if(path) {
                            var res = state.getPointOfIntersectionLines(path, self, joinPaths);
//                            new Point(res.x, res.y, state)
                        }
    
    

                    
                        return false;
                    }
                }
            
            }
            
            
            
            
            // Join to paths in a given point.
            function joinPaths (from, to, point, toLeft){
                var pTo = to.pathArray,
                    pFr = from.pathArray,
                    X = point.x - pTo[0][1],
                    Y = point.y - pTo[0][2],
                    X1, Y1;

                if (typeof pFr[1][5] === "number"){
                    X1 = point.x - pFr[1][5];
                    Y1 = point.y - pFr[1][6];
                } else{
                    X1 = point.x - pFr[1][1];
                    Y1 = point.y - pFr[1][2];
                }    

                from.controls[1].update(X1, Y1);
              
                if (from.updateCoefs){
                    from.updateCoefs(point, {
                        'x': pFr[0][1],
                        'y': pFr[0][2]
                    });
                }
                
                to.controls[0].update(X, Y);
                
                if(toLeft){
                    from.interpolateLeft(true);
                } else {
                    to.interpolate(true);
                }
                
            }
        };
                
        Line.prototype = {
            'move': function(dx, dy, x, y) { 
                this.update(dx - (this.dx || 0), dy - (this.dy || 0));
                this.dx = dx;
                this.dy = dy;
            },
            'get': function() {

                return this.path;
            },
            'getInitialState': function(){
                var p = this.pathArray,
                    i = this.initialState,
                    X = p[0][1] - i[0][1],
                    Y = p[0][2] - i[0][2];
                
                p[0][1] = i[0][1];
                p[0][2] = i[0][2];
                p[1][1] = i[1][1];
                p[1][2] = i[1][2];

                $.each(this.controls, function( index, element ){
                    element.data("Class").getInitialState(); 
                });

                this.path.update(X, Y);
            },
            'undrag': function() {
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

                    if(item.point.id !== self.controls[0].id && item.point.id !== self.controls[1].id){
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
            'interpolate': function(flag){             
                var state = this.state,
                    BB = state.BOUNDING_BOX,
                    delta = {},
                    intersection;
                
                this.getInitialState();
                
                intersection = this.formula(BB.RIGHT, BB.BOTTOM);
                
                delta.x0 = flag ? 0 : BB.LEFT - this.pathArray[0][1];
                
                delta.x1 = ((this.k !== 0) ? intersection.x : BB.RIGHT)- this.pathArray[1][1];
                delta.y1 = intersection.y - this.pathArray[0][2] || 0;
                
                this.controls[0].update(delta.x0, 0);
                this.controls[1].update(delta.x1, delta.y1);
            },
            'interpolateLeft': function(flag){             
                var state = this.state,
                    BB = state.BOUNDING_BOX,
                    delta = {},
                    intersection;
                
                intersection = this.formula(BB.LEFT);
                
                delta.x0 = ((this.k !== 0) ? intersection.x : BB.LEFT) - this.pathArray[0][1];
                delta.y0 = (intersection.y - this.pathArray[0][2]);
                
                delta.x1 = 0; 
                delta.y1 = 0; 
                
                this.controls[0].update(delta.x0, delta.y0);
                this.controls[1].update(delta.x1, delta.y1);
            },
            'cloneSegment': function(){
                var state = this.state,
                    path = this.pathArray,
                    from = new Point(path[0][1], path[0][2], state),
                    to = new Point(path[1][1], path[1][2], state);               

                    new Line(from, to, state);
            },
            'formula': function(x){
                var p = this.pathArray,
                    x1 = p[0][1],
                    y1 = p[0][2],
                    x2 = p[1][1],
                    y2 = p[1][2],
                    A = y1 - y2,
                    B = x2 - x1,
                    C = x1*y2 - x2*y1,
                    Y = -(A/B)*x - C/B,
                    X = -(B/A)*Y - C/A;

                    return {
                       'x': X,
                       'y': Y
                    }
                    
            }
        };

        return Line;
    });

})(window.reguirejs, window.require, window.define);