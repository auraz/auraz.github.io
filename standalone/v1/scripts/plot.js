var Storage = (function(){
    var _storagePoints = [],
        _storageLines = [];
    
    var _set = function(config){
        var storage = [];

        if (config.type === "path"){
            storage = _storagePoints;
        } else{
            storage = _storageLines;
        }

        storage.push({
            type: config.type,
            coords: config.coords,
            name: config.name,
            path: config.path
        });
    }; 

    var _get = function(type){
        
        if (type === "path"){
            return _storagePoints;
        } else{
            return _storageLines;
        }        

    };

    return {

        set: _set,
        get: _get
    
    };
})();


var Plot = {
    // Line : function(R){
    //     var el = R.path("M0 0 L40 0 Z").attr({ "stroke-width" : "5", "stroke" : "#000" }).transform("t10, 10"),
    //         points, config;
            
    //         points = this.addPointsToLine(el);
    //         config = {
    //             type: "path",
    //             name: "Line",
    //             coords: [0, 0, 40, 0],
    //             path: points
    //         }

    //         el.data(config);
    //         Storage.set(config);

    //     return el;
    // },

    // CurveUp : function(R){
    //     var curveUpPath  = "M0 0 C0 40 40 40 40 40",
    //         el = R.path(curveUpPath).attr({ "stroke-width" : "5", "stroke" : "#000" }).transform("t10, 50"),
    //         config, points;
            
    //         points = this.addPointsToLine(el);
    //         config = {
    //             type: "path",
    //             name: "CurveUp",
    //             coords: [0, 0, 40, 40],
    //             path: points
    //         }

    //         el.data(config);
    //         Storage.set(config);

    //     return el;
    // },

    // CurveDown : function(R){
    //     var curveDownPath  = "M0 0 C0 -40 40 -40 40 -40";
    //         el = R.path(curveDownPath).attr({ "stroke-width" : "5", "stroke" : "#000" });
    //         el.transform("t10, 130");
    //         el.data("name", "CurveDown");
    //         el.click(this.addPoints);
    //     return el;
    // },

    // addPointsToLine : function(el){
    //     var path = el.attr("path"),
    //         p0, p1;

    //     p0 = Plot.R.circle(path[0][1], path[0][2], 6);   
    //     p1 = Plot.R.circle(path[1][1], path[1][2], 6);

    //     Plot.R.set(p0, p1)
    //         .attr({ "fill" : "red" })
    //         .transform("t10 10")
    //         .data("path", el)    
    //         .drag(Plot.pointMove, Plot.pointStart, Plot.pointUp)
    //         .hide();

    //     return [p0, p1];
    // },

    // moveLineTo: function(x, y, path, flag){
    //   var path = path,
    //       coords = path.attr("path"),
    //       pathX,
    //       pathY;
    //     if (flag){
    //         pathX = coords[0][1];
    //         pathY = coords[0][2];
    //         path.attr({path: "M" + pathX + " " + pathY + " L" + x + " " + y});  
    //     }else{
    //         pathX = coords[1][1];
    //         pathY = coords[1][2];
    //         path.attr({path: "M" + x + " " + y + " L" + pathX + " " + pathY});  
    //     };  
    // },

    // moveCurveTo: function(dx, dy, path, flag){
    //   var path = path,
    //       coords = path.attr("path"),
    //       pathX,
    //       pathY;

    //      if (flag){
    //         path.attr({path: "M" + coords.x0 + " " + coords.y0 + " C" + Plot.coords.x0 + " " + Plot.coords.y1 + " "+ Plot.coords.x1 + " " + Plot.coords.y1+ " " + dx + " " + dy});    
    //     }else{
    //         path.attr({path: "M" + dx + " " + dy + " C" + Plot.coords.x0 + " " + Plot.coords.y1 + " "+ Plot.coords.x1 + " " + Plot.coords.y1+ " " + coords.x1 + " " + coords.y1});    
    //     };  
    // },

    // pointStart: function(){
    //   var path = this.data("path").attr("path"),
    //       pathX = path[0][1],
    //       pathY = path[0][1],
    //       pointX = this.attr("cx"),
    //       pointY = this.attr("cy");

    //       Plot.coords = {
    //         x0: path[0][1],
    //         y0: path[0][2],
    //         x1: path[1][1],
    //         y1: path[1][2]
    //       }


    //       if (pointX == pathX){
    //             this.data("point", 0);
    //       } else{
    //             this.data("point", 1);
    //       }
    // },

    // pointMove: function(dx, dy, x , y){
    //    var flag = this.data("point"),
    //        path = this.data("path");

    //        if(this.data("path").data("name") === "Line"){
    //             Plot.moveLineTo(x , y, path, flag);     
    //         } else{
    //             Plot.moveCurveTo(x , y, path, flag);  
    //         };           
           
    //        this.attr({
    //             cx : x,
    //             cy : y
    //         });
    // },

    // pointUp: function(){

    // },

	init: function(){
        var R = Raphael(0, 0, 500, 500);
            Plot.R = R;
        var line = this.Line(R),
	    	cUp = this.CurveUp(R),
	    	cDown = this.CurveDown(R);

    	 // var start = function () {

      //          var el = Plot[this.data("name")](R); 
      //              this.p = el.attr("path");
      //              R.set(el).drag(move, start, up);
        	
      //       },
      //       move = function (dx, dy, x , y) {
      //           var coords = {
      //               x0: this.p[0][1] + dx,
      //               y0: this.p[0][2] + dy,
      //               x1: this.p[1][1] + dx,
      //               y1: this.p[1][2] + dy,
      //           },
      //               d = 0;

      //           if (this.data("name") === "Line"){
      //               this.attr({path: "M" + coords.x0 + " " + coords.y0 + " L" + coords.x1 + " " + coords.y1});    
      //           } else{
      //               coords.x1 = this.p[1][5] + dx;
      //               coords.y1 = this.p[1][6] + dy;
      //               d = coords.y1 - coords.y0;
      //               this.attr({path: "M" + coords.x0 + " " + coords.y0 + " C" + coords.x0 + " " + coords.y1 + " "+ coords.x1 + " " + coords.y1+ " " + coords.x1 + " " + coords.y1});    
      //           }
                
      //           this.data("path")[0].attr({
      //               cx: coords.x0,
      //               cy: coords.y0 + d
      //           });

      //           this.data("path")[1].attr({
      //               cx: coords.x1,
      //               cy: coords.y1 + d
      //           });

      //   	},
      //       up = function () {
      //           R.set(this.data("path")).show();
      //           this.undrag();
      //       };	
       
         //   R.set(line, cUp, cDown).drag(move, start, up);
	}
}

Plot && define(Plot);
