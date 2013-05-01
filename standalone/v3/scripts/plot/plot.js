(function(reguirejs, require, define) {

    define([
        'jquery', 
        'plot/toolbar', 
        'plot/primitives/curve', 
        'plot/primitives/line', 
        'plot/primitives/point' 
    ], 
    function($, Toolbar, Curve, Line, Point) {
        
        var Plot = function(){

                var sortPoints =  function(axis){
                    return function(prev, next){
                        return prev[axis] - next[axis];   
                    }
                };

                var sortPaths =  function(axis){
                    return function(prev, next){
                        return prev.pathArray[0][axis] - next.pathArray[0][axis];   
                    }
                };

                var State = {
                    WIDTH: 800,
                    HEIGHT: 500, 
                    R: Raphael(0, 0, 800, 500),
                    BOUNDING_BOX: {
                        TOP: 20,
                        RIGHT: 710,
                        BOTTOM: 480,
                        LEFT: 150,
                        MAX_X_VALUE: 705,
                        MAX_Y_VALUE: 475
                    },
                    isFirst: false,
                    frags: [],
                    points: [],
                    paths: [],
                    rules: [],
                    toolbar: [],
                    options: {
                        inRadius: 30
                    },
                    pointIndx: 0,
                    pathIndx: 0,
                    'sortPointsByX': function(){
                        this.points.sort(sortPoints('x'));
            
                        return this;
                    },
                    'sortPointsByY': function(){
                        this.points.sort(sortPoints('y'));
            
                        return this;
                    },
                    'sortPathsByX': function(){
                        this.paths.sort(sortPaths(1));
            
                        return this;
                    },
                    'sortRulesByX': function(){
                        this.rules.sort(sortPaths(1));
            
                        return this;
                    },
                    'getInitialState': function(){
                        var interpolated = this.getFirstPath().path.id;
            
                        $.each(this.paths, function( index, Path ){
                            if(interpolated !== Path.path.id ) {
                                Path.getInitialState();
                            }
                        });
            
                        return this;
                    },
                    'getFirstPath': function(){
                        var result;

                        this.sortPathsByX();

                        result = $.grep(this.paths, function(path){
                            return path.isInsideBoundingBox();
                        })[0];

                        return result || false;
                    },       
                    'getLastPath': function(){
                        var paths = this.paths,
                        l = paths.length - 1;
            
                        paths = $.grep(paths, function(item){
                            return item.isInsideBoundingBox(); 
                        });

                        return paths[l] || false;
                    },
                    'removeNextPaths': function(path){
                        var paths = this.paths,
                        rules = this.rules,
                        index, removed;
               
                        this.sortPathsByX();
            
                        index = paths.indexOf(path) + 1;
            
                        if(index < paths.length){
                            removed = paths.splice(index);
                            $.each(removed, function(index, value){
                                value.destroy();
                            });
                        }    
            
                        this.rebuildRules();
            
                        return this;
                    },
                    'getNextPath': function(path){
                        var paths = this.paths,
                        index;
               
                        this.sortPathsByX();
                        paths = $.grep(paths, function(item){
                            return item.isInsideBoundingBox(); 
                        });
                        index = paths.indexOf(path) + 1;
            
                        return paths[index] || false;
                    },
                    'getPrevPath': function(path){
                        var paths = this.paths,
                            index;
               
                        this.sortPathsByX();
            
                        paths = $.grep(paths, function(item){
                            return item.isInsideBoundingBox(); 
                        });
                        index = paths.indexOf(path) - 1;
            
                        return paths[index] || false;
                    },
                    'findIntersactions': function(path){
                        var paths = this.paths,
                        intersectedPath, point;
            
                        intersectedPath = $.grep(paths, function( value, index ){
                            if (value.path.id !== path.path.id){
                                var intersaction = Raphael.pathIntersection(
                                    path.path.attr("path"), 
                                    value.path.attr("path")
                                    )[0];

                                if (intersaction){
                                    point = intersaction;
                                }

                                return intersaction;
                            }

                            return false;
                        })[0];

                        return { 
                            'path': intersectedPath, 
                            'point': point
                        }
                    },
                    'rebuildRules': function(){
                        var self = this,
                        paths = this.paths,
                        rules = this.rules,
                        BB = this.BOUNDING_BOX;
            
                        $.each(rules, function(index, value){
                            value.remove();
                        });
            
                        $.each(paths, function(index, value){
                            var point = value.intersactionPoint,
                            pathArray, rule;
                    
                            if(point){
                                pathArray = [
                                ["M", point.x, point.y], 
                                ["L", point.x, BB.BOTTOM],
                                ["M", BB.LEFT, point.y], 
                                ["L", point.x, point.y]
                                ];
                        
                                rule = self.R.path(pathArray).attr({
                                    "stroke-dasharray" : "- ",
                                    "stroke-width" : .7,
                                    "opacity" : .7
                                });
                            
                                rules.push(rule);
                            }
                        });
            
                        return this;
                    }
                };
    
                new Toolbar(State);
        };
        
        return Plot;
    });

})(window.reguirejs, window.require, window.define);


