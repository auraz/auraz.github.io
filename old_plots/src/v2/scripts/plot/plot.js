(function(reguirejs, require, define){

define([
    'jquery', 
    'src/v2/scripts/plot/toolbar'
], 
function($, Toolbar) {

    var Plot = function(){
        LibCanvas.extract();
        
        this.helper = new App.Light( new Size(800, 500), {
            'appendTo': document.getElementById('plot-v2') 
        } );
        this.toolbar = new Toolbar(this);
        this.count = 0; 
        this.buttons = [];    
        this.dragStop = false;
        this.helper.mouse.events.add('click', this.clickHandler.bind(this));
        this.drawCanvas();
    };

    Plot.prototype = {
        clickHandler : function(event){
            if(!this.dragStop){   
                if (this.lastPoint) {
                    this.toolbar.show(arguments);
                } else{
                    this.draw.apply(this, arguments);    
                }
            } else{
                this.dragStop = false;
            }
        },

        draw: function(){
            var vector, 
                oldOnStop,
                self = this,
                point = this.helper.mouse.point.clone();
                
            vector = this.helper.createVector(new Circle(point, 5), { zIndex: ++this.count })
                .setStyle(               { fill: '#300', stroke: '#600', lineWidth: 5 })
                .setStyle( 'hover' ,     { fill: '#600', stroke: '#900' })
                .setStyle( 'active',     { fill: '#060', stroke: '#090' });

            vector.clickable.start();
            vector.draggable.start();

            oldOnStop = vector.draggable.onStop;
            vector.draggable.onStop = function(){
                self.dragStop = true;
                oldOnStop.apply(this, arguments);
            }

            if (this.lastPoint) {

                switch(this.toolbar.type){
                    case "Curve": 
                        this.curve(point);
                        break;
                    default:
                        this.line(point);
                        break;
                }
            }

            this.lastPoint = point;  
        },

        line: function(point){
            this.helper
                .createVector(new Line(point, this.lastPoint), { zIndex: 0 })
                .setStyle({ stroke: '#600', lineWidth: 5 });
        },

        curve: function(point){

            var self = this,
                path, vector,
                to = point,
                from = this.lastPoint,
                cpTo = to.clone().move(new Point(0, -50), true ),
                cpFr = from.clone().move(new Point(0, 50), true );

            path = new Path()
                .moveTo(from)
                .curveTo( to , cpFr, cpTo)
                .curveTo( from , cpTo, cpFr);

            vector = self.helper.createVector(path)
                .setStyle({ stroke: '#600', lineWidth: 5 });
            
            vector.zIndex = 0;

            [cpFr, cpTo].forEach(function (point, i) {
                var oldOnStop,
                    vector = self.helper.createVector( new Circle(point, 6), { zIndex: ++this.count })
                    .setStyle({ opacity: 0.8, fill: '#090' });
                
                vector.draggable.start();

                oldOnStop = vector.draggable.onStop;
                vector.draggable.onStop = function(){
                    self.dragStop = true;
                    oldOnStop.apply(this, arguments);
                };

            });

            [ new Line(from, cpFr), new Line(to, cpTo) ].forEach(function (line) {
                var vector = self.helper.createVector( line, { zIndex: ++this.count })
                    .setStyle({ opacity: 0.5, stroke: '#f66' , lineWidth: 2 });
            });

        },
        
        drawCanvas: function(){
            var BB = {
                    'TOP': 0,
                    'RIGHT': 800,
                    'BOTTOM': 500,
                    'LEFT': 0
                },
                CENTER = {
                    'x': 0.5*BB.RIGHT,
                    'y': 0.5*BB.BOTTOM
                },
                axisX, axisY;
                
            axisX = this.helper.createVector(
                new Line(
                    new Point(CENTER.x, BB.TOP), 
                    new Point(CENTER.x, BB.BOTTOM)
                ), {zIndex: 0}
            );
                
            axisY = this.helper.createVector(
                new Line(
                    new Point(BB.LEFT, CENTER.y), 
                    new Point(BB.RIGHT, CENTER.y)
                ), {zIndex: 0}
            );
            
            [axisX, axisY].forEach(function(item){
                item.setStyle({
                    stroke: 'rgba(0, 0, 0, .7)', 
                    lineWidth: 1                        
                });
            });

            (function(self){
                var p1, p2;
                
                for( var i = CENTER.y; i < BB.BOTTOM; i += 25){
                    p1 = new Point(BB.LEFT, i),
                    p2 = new Point(BB.RIGHT, i);
                    
                    self.helper.createVector(
                        new Line(p1, p2), {zIndex: 0}
                    )
                    .setStyle({
                        'stroke': 'rgba(0, 0, 0, .3)', 
                        'lineWidth': .25,
                        'lineCap': 'round'
                    });    
                }   
                
                for( var j = CENTER.y; j > BB.TOP; j -= 25){
                    p1 = new Point(BB.LEFT, j),
                    p2 = new Point(BB.RIGHT, j);
                    
                    self.helper.createVector(
                        new Line(p1, p2), {zIndex: 0}
                    )
                    .setStyle({
                        'stroke': 'rgba(0, 0, 0, .3)', 
                        'lineWidth': .25,
                        'lineCap': 'round'
                    });       
                }
                
                for( var k = CENTER.x; k > BB.LEFT; k -= 25){
                    
                    p1 = new Point(k, BB.TOP),
                    p2 = new Point(k, BB.BOTTOM);

                    self.helper.createVector(
                        new Line(p1, p2), {zIndex: 0}
                        )
                    .setStyle({
                        'stroke': 'rgba(0, 0, 0, .3)', 
                        'lineWidth': .25,
                        'lineCap': 'round'
                    });      
                }
                
                for( var m = CENTER.x; m < BB.RIGHT; m += 25){
                    p1 = new Point(m, BB.TOP),
                    p2 = new Point(m, BB.BOTTOM);
                    self.helper.createVector(
                        new Line(p1, p2), {zIndex: 0}
                    )
                    .setStyle({
                        'stroke': 'rgba(0, 0, 0, .3)', 
                        'lineWidth': .25,
                        'lineCap': 'round'
                    });      
                }
                
            }(this));
            
        }
    };
 
    return Plot;
});

})(window.reguirejs, window.require, window.define);


