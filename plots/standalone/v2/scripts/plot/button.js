(function(reguirejs, require, define){

define(['jquery'], function($) {

	var Button = function(plot, toolbar, type){
		var html;
		this.type    = type;
	    this.plot = plot;
	    this.toolbar = toolbar;
	    this.popup = this.toolbar.popup;

	    html = [
	    	'<span class="btn btn-',
	    	this.type.toLowerCase(),
	    	'">',
	    	this.type,
	    	'</span>'
	    ].join('');

	    this.btn = jQuery(html)
	    			.data("type", this.type)
	    			.bind("click", this.clickHandler.bind(this));
		this.popup.append(this.btn);
	};

	Button.prototype = {

		clickHandler: function(e){
			this.toolbar.type = jQuery(e.currentTarget).data("type");
			this.plot.draw.apply(this.plot, this.toolbar.args);
			this.toolbar.hide();
		},
	};
	 
    return Button;
});

})(window.reguirejs, window.require, window.define);


