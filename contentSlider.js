	/*
	 * Mobile multiple video creative slider.
	 * Touch slider with video support.
	 * 2014. Ebuzzing, GHogan.
	 */	
	
	
					
				
	
(function($){
	if( jQuery === undefined ){
		console.warn("jQuery required for this plugin.");
		return;
	}
		
    function SwipeCarousel(targetElement, options) {
		var self = this;
		
		this.touch = ('ontouchstart' in document.documentElement) ? true : false,
		this.event = {
			click : ( self.touch ) ? 'tap' : 'click',
			start : ( self.touch ) ? 'touchstart' : 'mousedown',
			end   : ( self.touch ) ? 'touchend' : 'mouseup',
			move  : ( self.touch ) ? 'touchmove' : 'mousemove'
		},
		this.target = {
			touching : false,
			moving : false,
			starttouch : "",
			startX : "",
			startY : "",
			endtouch : "",
			endX : "",
			endY : ""
		},
		this.variable = {
			touching : false,
			currentPosition : "",
			pageCount : 1
		},
		this.html = {
			name : ".slide",
			elem : $(targetElement),
			page : $(targetElement).find('.slide-page'),
			rail : $(targetElement).find('.slide-rail'),
		},
		this.defaults = {
			current : 0,
			delay : 5000,
			transition: 500
		};
		
		this.options = $.extend({}, self.defaults, options);
		this.checkElements();
		this.init();
    }
    SwipeCarousel.prototype = {
        init: function() {
            var self = this;
			
			console.log("Initialise slider.");
			this.setWidths();
			this.buildPageNotification();
			this.bindEvents();
        },
		checkElements : function(){
			var self = this;
			
			/* Check slide is built correctly. */
			for(var key in self.html){
				if (self.html.hasOwnProperty(key)){
					if( self.html[key].length <= 0 ){
						console.warn('Slider HTML is incorrect. Check containers and class names.');
						return;
					}
				}
			}
		},
		setWidths : function(){
			var self = this;
			
			self.variable.pageCount = self.html.page.length;
			
			self.html.rail[0].style.width = ( self.html.elem.outerWidth(true) * self.variable.pageCount ) + "px";
			for( var i=0; i < self.variable.pageCount; i++ ){
				self.html.page[i].style.width = self.html.elem.outerWidth(true) + "px";
			}
		},
        bindEvents: function() {
            var self = this;
			
			self.html.elem.on(self.event.start, self.interactStart.bind(self));
			$(document).on(self.event.move, self.interactMove.bind(self));
			$(document).on(self.event.end, self.interactEnd.bind(self));
			
			self.html.elem.find('.next').on('tap', self.clickNext.bind(self));
			self.html.elem.find('.prev').on('tap', self.clickPrev.bind(self));
			
			$(window).on('resize', self.setWidths.bind(self));
        },
		animateDrag : function(target){
			var animateTo = ( target === undefined ) ? this.current * this.width : target * this.width;
			
			// As this is for modern browsers only, we don't need to check for 3d support, awww yiss!
			this.$rail.css({
				"-webkit-transform" : "translate3d(-"+animateTo+"px,0px,0px)",
				"-moz-transform" : "translate3d(-"+animateTo+"px,0px,0px)",
				"-o-transform" : "translate3d(-"+animateTo+"px,0px,0px)",
				"transform" : "translate3d(-"+animateTo+"px,0px,0px)"
			});
		},
		animateComplete : function(){
		
		},
		difference : function (a, b){
			return Math.abs(Math.floor(a) - Math.floor(b));
		},
		setCurrentPosition : function(){
			var self = this;
			
			self.variable.calcPosition =	window.getComputedStyle(self.html.rail[0]).getPropertyValue('-webkit-transform')
						||		window.getComputedStyle(self.html.rail[0]).getPropertyValue('-moz-transform')
						||		window.getComputedStyle(self.html.rail[0]).getPropertyValue('transform');
						
			self.variable.calcPositionArray = self.variable.calcPosition.split('(')[1].split(')')[0].split(' ').join('').split(',');
			
		},
		getEventPosition : function(evt){
			var self = this,
				timestamp = evt.timeStamp,
				positionX,
				positionY;
				
				if( evt.type == self.event.end ){
					positionX = Math.floor( ( self.touch ) ? evt.originalEvent.changedTouches[0].clientX : evt.originalEvent.clientX );
					positionY = Math.floor( ( self.touch ) ? evt.originalEvent.changedTouches[0].clientY : evt.originalEvent.clientY );
				}else{
					positionX = Math.floor( ( self.touch ) ? evt.originalEvent.targetTouches[0].clientX : evt.originalEvent.clientX );
					positionY = Math.floor( ( self.touch ) ? evt.originalEvent.targetTouches[0].clientY : evt.originalEvent.clientY );
				}
			
			return [timestamp, positionX, positionY];
		},
		interactStart : function(evt){
			var self = this;
			
			self.target.starttouch	= self.getEventPosition(evt)[0];
			self.target.startX		= self.getEventPosition(evt)[1];
			self.target.startY		= self.getEventPosition(evt)[2];
			
			self.setCurrentPosition();
			
			var isIE = ( self.variable.calcPosition.indexOf("matrix3d") >= 0 );
			
			if( !$(evt.target).hasClass("next") || !$(evt.target).hasClass("prev") ){
				
				self.variable.touching = true;
			
				self.html.rail[0].style.webkitTransform = "translate3d("+(isIE)?self.variable.calcPositionArray[12]:self.variable.calcPositionArray[4]+"px,0px,0px)";
				self.html.rail[0].style.mozTransform = "translate3d("+(isIE)?self.variable.calcPositionArray[12]:self.variable.calcPositionArray[4]+"px,0px,0px)";
				self.html.rail[0].style.transform = "translate3d("+(isIE)?self.variable.calcPositionArray[12]:self.variable.calcPositionArray[4]+"px,0px,0px)";
										
				self.html.rail.removeClass('slide-animate');
				
				if( isIE ){
					self.variable.currentPosition = +self.variable.calcPositionArray[12];
				}else{
					self.variable.currentPosition = +self.variable.calcPositionArray[4];
				}
			}
			
		},
		interactMove : function(evt){
			var self = this;
			
			if( self.variable.touching == false )
				return;
				
			self.target.endtouch	= self.getEventPosition(evt)[0];
			self.target.endX		= self.getEventPosition(evt)[1];
			self.target.endY		= self.getEventPosition(evt)[2];
			
			if( self.difference( self.target.startY, self.target.endY ) <= self.difference( self.target.startX, self.target.endX ) )
				evt.preventDefault();
			else
				return;
			
			self.setCurrentPosition();
			
			var dir = -1;
			if( self.target.startX <= self.target.endX )
				dir = 1
			self.html.rail[0].style.webkitTransform = "translate3d("+(self.variable.currentPosition + (self.difference( self.target.startX, self.target.endX ) * dir))+"px,0px,0px)";
			self.html.rail[0].style.mozTransform = "translate3d("+(self.variable.currentPosition + (self.difference( self.target.startX, self.target.endX ) * dir))+"px,0px,0px)";
			self.html.rail[0].style.transform = "translate3d("+(self.variable.currentPosition + (self.difference( self.target.startX, self.target.endX ) * dir))+"px,0px,0px)";
		},
		interactEnd : function(evt){
			var self = this;
			
			if( self.variable.touching == false )
				return;
			
			self.variable.touching = false;
			
			self.target.endtouch	= self.getEventPosition(evt)[0];
			self.target.endX		= self.getEventPosition(evt)[1];
			self.target.endY		= self.getEventPosition(evt)[2];
			
			self.animateSlide();
			
			if( self.difference(self.target.startY, self.target.endY) <= 18 && self.difference(self.target.startX, self.target.endX) <= 18 && self.difference(self.target.starttouch, self.target.endtouch) <= 200 ){
				$(evt.target).trigger("tap");
			}
		},
		animateSlide : function(){
			var self = this;
			
			self.html.rail.addClass('slide-animate');
			
			if( self.difference( self.target.startX, self.target.endX ) >= (self.html.page[0].clientWidth / 6) ){
				if( self.target.startX >= self.target.endX ){
					self.options.current = self.options.current - 1;
				}else if( self.target.startX < self.target.endX ){
					self.options.current = self.options.current + 1;
				}else{
					self.options.current = self.options.current;
				}
				
			}
			
			self.updatePageNotification();
			
			if( self.options.current > 0 )
				self.options.current = ((self.html.page.length - 1) * -1);
			else if( self.options.current <= ((self.html.page.length) * -1) )
				self.options.current = 0;
			
			self.html.rail[0].style.webkitTransform = "translate3d("+(self.html.page[0].clientWidth * self.options.current)+"px,0px,0px)";
			self.html.rail[0].style.mozTransform = "translate3d("+(self.html.page[0].clientWidth * self.options.current)+"px,0px,0px)";
			self.html.rail[0].style.transform = "translate3d("+(self.html.page[0].clientWidth * self.options.current)+"px,0px,0px)";
		},
		clickPrev : function(evt){
			evt.preventDefault();
			
			var self = this;
			
			self.options.current = self.options.current + 1;
			
			self.animateSlide();
		},
		clickNext : function(evt){
			evt.preventDefault();
			
			var self = this;
			
			self.options.current = self.options.current - 1;
			
			self.animateSlide();
		},
		buildPageNotification : function(){
			var self = this,
				countItems = "";
			
			for( var i=0; i < self.variable.pageCount; i++ ){
				countItems += "<span></span>";
			}
			
			self.html.elem.append('<div class="slide-control next"></div><div class="slide-control prev"></div><div class="slide-indicator">'+countItems+'</div>');
			self.updatePageNotification();
			
			
		},
		updatePageNotification : function(){
			var self = this,
				correction = ( self.options.current * -1 ),
				current = ( correction >= self.variable.pageCount ) ? 0 : correction;
						
			self.html.elem.find(".slide-indicator span").removeClass('active').eq(current).addClass("active");
		}
    };
	
	
    $.fn.swipeCarousel = function(options) {
        return this.each(function() {
            var sc = new SwipeCarousel(this, options);
        });
    };
})(jQuery);