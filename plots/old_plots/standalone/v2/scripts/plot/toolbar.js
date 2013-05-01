(function(reguirejs, require, define){

define(['jquery', 'plot/button'], function($, Button) {

    var Toolbar = function(plot){ 

        this.plot = plot;    
        this.count = 0;
        this.buttons = [];
        this.type = "Line";
        this.popup = jQuery(".popup");

        this.buttons.push(new Button(plot, this, "Line"));
        this.buttons.push(new Button(plot, this, "Curve"));

    };

    Toolbar.prototype = {
        show : function(args){
            this.popup
                .css({
                    top: args[0].y,
                    left: args[0].x
                })
                .show();
            this.args = args;
        },
        hide : function(){
            this.popup.hide();
        }
    };
 
    return Toolbar;
});

})(window.reguirejs, window.require, window.define);


