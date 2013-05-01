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
                
                if (self.isInsideBoundingBox()){
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
			
            function up() { 
                var state = self.state,
                    intersaction, path, point;
                    
                if (!self.isInsideBoundingBox()){
                    self.destroy();
                    
                    return false;
                }

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
                        joinPaths(path, self, point); 
                        state.removeNextPaths(self);
                        self.interpolate(true);
                    } else {
                        // Otherwise, we remove current Line and return from function
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
                to.interpolate(true);
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
                var X = this.pathArray[0][1] - this.initialState[0][1],
                    Y = this.pathArray[0][2] - this.initialState[0][2];
                
                this.pathArray[0][1] = this.initialState[0][1];
                this.pathArray[0][2] = this.initialState[0][2];
                this.pathArray[1][1] = this.initialState[1][1];
                this.pathArray[1][2] = this.initialState[1][2];

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
                    delta = {};
                
                this.getInitialState();
                delta.x0 = flag ? 0 : BB.LEFT - this.pathArray[0][1] + 5;
                delta.x1 = BB.MAX_X_VALUE - this.pathArray[1][1];
                
                this.controls[0].update(delta.x0, 0);
                this.controls[1].update(delta.x1, 0);
            },
            'cloneSegment': function(){
                var state = this.state,
                    path = this.pathArray,
                    from = new Point(path[0][1], path[0][2], state),
                    to = new Point(path[1][1], path[1][2], state);               

                    new Line(from, to, state);
            }
        };

        return Line;
    });

})(window.reguirejs, window.require, window.define);