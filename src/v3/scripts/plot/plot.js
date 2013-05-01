(function(reguirejs, require, define) {

    define([
        'jquery', 
        'src/v3/scripts/plot/toolbar', 
        'src/v3/scripts/plot/primitives/curve', 
        'src/v3/scripts/plot/primitives/line', 
        'src/v3/scripts/plot/primitives/point' 
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

                var sortPathsByPin =  function(axis){
                    return function(prev, next){
                        return prev.pin[axis] - next.pin[axis];   
                    }
                };

                var State = (function(){
                    var WIDTH = 800,
                        HEIGHT = 500,
                        BB = {
                            TOP: 0,
                            RIGHT: WIDTH,
                            BOTTOM: HEIGHT,
                            LEFT: 150,
                            MAX_X_VALUE: 795,
                            MAX_Y_VALUE: 495
                        },
                        _points = [],
                        _paths = [],
                        _getLineFormula,
                        _getPointOfIntersectionLines,
                        _rebuildRules,
                        _getDistanceBetweenCoords,
                        _isLinesParallel,
                        _getSide,
                        _clearStorages;
                    
                    BB.lineTop = [['M', BB.LEFT, BB.TOP],['L', BB.RIGHT, BB.TOP]];
                    BB.lineRight = [['M', BB.RIGHT, BB.TOP],['L', BB.RIGHT, BB.BOTTOM]];
                    BB.lineBottom = [['M', BB.LEFT, BB.BOTTOM],['L', BB.RIGHT, BB.BOTTOM]];
                    BB.lineLeft = [['M', BB.LEFT, BB.TOP],['L', BB.LEFT, BB.BOTTOM]];
                    
                    // We have to pass 2 argumnets, 3rd is a callback function
                    // @param path_1: class Path(object)                    
                    // @param path_2: class Path(object)
                    // @param callback: fucntion                    
                    _getPointOfIntersectionLines = function(path_1, path_2, callback){
                        var p1 = ($.isArray(path_1)) ? path_1 : path_1.pathArray,
                            p2 = ($.isArray(path_2)) ? path_2 : path_2.pathArray,
                            x1 = p1[0][1],
                            x2 = p1[1][1],
                            y1 = p1[0][2],
                            y2 = p1[1][2],
                            x3 = p2[0][1],
                            x4 = p2[1][1],
                            y3 = p2[0][2],
                            y4 = p2[1][2],
                            k1 = (y2 === y1) ? 0 : ((y2 - y1)/(x2 - x1)),
                            k2 = (y4 === y3) ? 0 : ((y4 - y3)/(x4 - x3)),
                            b1 = y1 - k1*x1, 
                            b2 = y3 - k2*x3,
                            res = {};
                    
                        if (k1 === k2) {
                            
                            return false;
                        }
                        
                        res.x = (b2 - b1)/(k1 -  k2); 
                        res.y = k1*res.x + b1;
                
                        if ($.isFunction(callback)) {
                        // If point of intersection is form the left side
                        // we are switching our paths
                            if (res.x >= path_2.pathArray[1][1]) {
                                callback(path_2, path_1, res, true);
                            } else {
                                callback(path_1, path_2, res);
                            }
                        }
                        
                        return res;
                    };
                    
                    _rebuildRules = function(){
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
                                    "stroke" : "blue",
                                    "stroke-dasharray" : "- ",
                                    "stroke-width" : .7,
                                    "opacity" : .9
                                });
                            
                                rules.push(rule);
                            }
                        });
            
                        return this;
                    };
                    
                    _findIntersactions = function(path){
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
                    };
                     
                    _isLinesParallel = function(path_1, path_2){
                        var p1 = path_1.pathArray,
                            p2 = path_2.pathArray,
                            x1 = p1[0][1],
                            y1 = p1[0][2],
                            x2 = p1[1][1],
                            y2 = p1[1][2],
                            x3 = p2[0][1],
                            y3 = p2[0][2],
                            x4 = p2[1][1],
                            y4 = p2[1][2];

                        return (x1 - x2)*(y3 - y4) - (y1 - y2)*(x3 - x4) === 0
                    };
                    
                    _clearStorages = function(){
//                        var len_points = _points.length,
//                            len_paths = _paths.length;
//                        
//                        _points.splice(0, len_points);
//                        _paths.splice(0, len_paths);
                    };
                
                    return {
                        R: Raphael(document.getElementById('plot-v3'), WIDTH, HEIGHT),
                        BOUNDING_BOX: BB,
                        isFirst: false,
                        frags: [],
                        points: _points,
                        paths: _paths,
                        rules: [],
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
                        'sortPathsByPinX': function(){
                            this.paths.sort(sortPathsByPin('x'));
            
                            return this;
                        },
                        'sortPathsByY': function(){
                            this.paths.sort(sortPaths(2));
            
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

                            result = $.grep(this.paths, function(item){
                                
                                return item.pathArray[0][1] >= BB.LEFT; 
//                                return path.isInsideBoundingBox();
                            })[0];

                            return result || false;
                        },  
                        'isFirstPath': function(path){
                            var p = this.getFirstPath();
                            
                            console.log('inside', p.k, path.k)
                            return p === path;
                        },
                        'getLastPath': function(){
                            var paths = this.paths,
                                l = paths.length - 1;
            
                            paths = $.grep(paths, function(item){
                                
                                return item.pathArray[0][1] >= BB.LEFT; 
//                                return item.isInsideBoundingBox(); 
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
                        'removePrevPaths': function(path){
                            var paths = this.paths,
                            rules = this.rules,
                            index, removed;
               
                            this.sortPathsByPinX();
                            paths = $.grep(paths, function(item){
                                
                                return item.pathArray[0][1] >= BB.LEFT; 
//                                return item.isInsideBoundingBox(); 
                            });
            
                            index = paths.indexOf(path);
            
                            if(index < paths.length){
                                removed = paths.splice(0, index);
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
                                
                                return item.pathArray[0][1] >= BB.LEFT; 
//                                return item.isInsideBoundingBox(); 
                            });
                            index = paths.indexOf(path) + 1;
            
                            return paths[index] || false;
                        },
                        'getPrevPath': function(path){
                            var paths = this.paths,
                                index;
               
                            this.sortPathsByX();
                            
                            paths = $.grep(paths, function(item){
                               
                                 return item.pathArray[0][1] >= BB.LEFT; 
//                                return item.isInsideBoundingBox(); 
                            });
                            index = paths.indexOf(path) - 1;
            
                            if (index > 1 && (_isLinesParallel(path, paths[index]))){
                                index -= 1;
                            }
            
                            return paths[index] || false;
                        },
                        'getPathJoinTo': function(path){
                            var paths = this.paths,
                                index;

                            this.sortPathsByX();

                            paths = $.grep(paths, function(item){

                                return item.pathArray[0][1] >= BB.LEFT; 
//                                return item.isInsideBoundingBox(); 
                            });
                            index = paths.indexOf(path) - 1;
            
                            return paths[index] || false;
                        },
                        'findIntersactions': _findIntersactions,
                        'rebuildRules': _rebuildRules,
                        'getPointOfIntersectionLines': _getPointOfIntersectionLines,
                        'isLinesParallel': _isLinesParallel,
                        'clearStorages': _clearStorages
                    }
                    
                }());
    
                new Toolbar(State);
        };
        
        return Plot;
    });

})(window.reguirejs, window.require, window.define);


