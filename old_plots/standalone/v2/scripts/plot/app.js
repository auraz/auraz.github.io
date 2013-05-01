(function(reguirejs, require, define){

define(['jquery', 'plot/toolbar'], function($, Toolbar) {

    var Plot = function(){
        LibCanvas.extract();
        
        this.helper = new App.Light( new Size(600, 400) );
        this.toolbar = new Toolbar(this);
        this.count = 0; 
        this.buttons = [];    
        this.dragStop = false;
        this.helper.mouse.events.add('click', this.clickHandler.bind(this));
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

        }
    };
 
    return Plot;
});

})(window.reguirejs, window.require, window.define);


