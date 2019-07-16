/*
 * Jquery plugin template
 * 
 * (c) 2016 ArtisticPhoenix
 *
 * For license information please view the LICENSE file included with this source code.
 * 
 */
// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly
;( function( $, window, document, undefined ) {

"use strict";

	var pluginName  = 'uiMultiselect',
		defaults = {
			beforeInit : function( args ){}, 
			afterInit : function( args ){},
			width : '100%',
//			open : function(event, ui){}, //event multiselect.open
//			close : function(event, ui){}, //event multiselect.close
//			distroy : function(event, ui){}, //event multiselect.distroy
//			disable : function(event, ui){}, //event multiselect.disable
//			enable : function(event, ui){}, //event multiselect.enable
//			option : function(event, ui){}, //event multiselect.option
//			search : function(event, ui){}, //event multiselect.search
//			select : function(event, ui){}, //event multiselect.search
//			autoFocus : false, //If set to true the first item will automatically be focused when the menu is shown.
//			classes : {}, //Specify additional classes to add to the widget's elements. Any of classes specified in the Theming section can be used as keys to override their value. To learn more about this option, check out the learn article about the classes option.
//			delay : 300, //The delay in milliseconds between when a keystroke occurs and when a search is performed. A zero-delay makes sense for local data (more responsive), but can produce a lot of load for remote data, while being less responsive.
//			disabled : false, //Disables the autocomplete if set to true.
//			minLength : 1, /The minimum number of characters a user must type before a search is performed. Zero is useful for local data with just a few items, but a higher value should be used when a single character search could match a few thousand items.
//			source : [],
			
		};

	//plugin constructor
	function Plugin( target, options ) {
		this.body,this.menu;
		
		this.element = $(target);
		
		//this.element.css('display', 'none');
		
		//set our internal optons
		this.settings = {
				beforeInit : function( args ){}, 
				afterInit : function( args ){},
//				open : function(event, ui){}, //event multiselect.open
//				close : function(event, ui){}, //event multiselect.close
//				distroy : function(event, ui){}, //event multiselect.distroy
//				disable : function(event, ui){}, //event multiselect.disable
//				enable : function(event, ui){}, //event multiselect.enable
//				option : function(event, ui){}, //event multiselect.option
//				search : function(event, ui){}, //event multiselect.search
//				select : function(event, ui){}, //event multiselect.search
//				autoFocus : false, //If set to true the first item will automatically be focused when the menu is shown.
//				classes : {}, //Specify additional classes to add to the widget's elements. Any of classes specified in the Theming section can be used as keys to override their value. To learn more about this option, check out the learn article about the classes option.
//				delay : 300, //The delay in milliseconds between when a keystroke occurs and when a search is performed. A zero-delay makes sense for local data (more responsive), but can produce a lot of load for remote data, while being less responsive.
//				disabled : false, //Disables the autocomplete if set to true.
//				minLength : 1, /The minimum number of characters a user must type before a search is performed. Zero is useful for local data with just a few items, but a higher value should be used when a single character search could match a few thousand items.
//				source : [],
				
		}
		
		//extend the internal options
		this.options( options );

		//localize plugin name
		this._name = pluginName;

		//trigger our init method
		this._init( target, options ); 		
	}; //END:Plugin
	
	//plugin methods
	$.extend( Plugin.prototype, {
		_init : function( target, options ){
			//callback to options beforeInit
			this.settings.beforeInit.apply( this,  [ arguments ] );
			
			this._build();
			this._regesterEvents();

			//callback to options afterInit
			this.settings.afterInit.apply( this,  [ arguments ] );
		},
		/**
		* set options
		* @param object args - an object with key value pairs to set in _options
		*/
		options : function ( options ){
			this.settings = $.extend(true, this.settings, options); // deep extend
		},
		/**
		* destroy the plugin instance
		*/
		destroy : function () {
			this.element.removeData(pluginName );
			return this;
		},
		/**
		 * Build the html elements
		 */
		_build : function() {
			var html = [
				'<div class="ui-widget ui-multiselect" style="width:'+this.settings.width+'" >',
					'<div class="ui-multiselect-selections ui-corner-all ui-widget-content" >',
						'<span class="ui-multiselect-search-wrapper" >',
							'<input type="text" class="ui-multiselect-search" />',
							'<span class="ui-multiselect-ruler" ></span>',
						'</span>',
						'<div class="clear-fix" ></div>',
					'</div> <!--\.ui-multiselect-selections -->',
					'<div class="ui-multiselect-choices ui-selectmenu-menu" >',
						'<ul class="ui-menu ui-corner-bottom ui-widget ui-widget-content" ></ul>',
					'</div> <!--\.ui-multiselect-choices -->',
				'</div> <!--\.ui-multiselect -->'
			].join("\n");
			
			this.body = $(html).insertAfter(this.element);
			this.menu = this.body.find('.ui-menu');
			
			this._buildMenu();
		},
		_buildMenu : function() {
			var self = this;
			var options = self.element.find('optgroup, option');
			var html = '';
			
			options.each(function(){
				if($(this).is('optgroup')){
					html += '<li class="ui-selectmenu-optgroup ui-menu-divider" >'+$(this).attr('label')+'</li>';
				}else{
					//ui-state-active
					html += '<li class="ui-menu-item" ><div class="ui-menu-item-wrapper" data-value="'+$(this).attr('value')+'" >'+$(this).text()+'</div></li>';
				}
			});

			self.menu.html(html);
		},
		_regesterEvents : function() {
			var self = this;
			
			self.element.on('focus', '.ui-multiselect-search-wrapper', function(){
				self.open();
			});
		},
		open : function(){
			
		}
		
		
		/*	self.element.find('optgroup, option').each(function(){
				if($(this).is('optgroup')){
					console.log('optgroup');
				}else{
					console.log('option');
				}
			});
			
			console.log(el.find('.ui-multiselect-selections'));
			
			
		<div class="ui-widget ui-multiselect">
        	<div class="ui-multiselect-selections ui-corner-all ui-widget-content" >
                <div class="ui-corner-all ui-state-active ui-multiselect-selected" >Tyrannosaurus<span class="ui-button-icon ui-icon ui-icon-closethick ui-multiselect-close"></span></div>
                <div class="ui-corner-all ui-state-active ui-multiselect-selected" >Velociraptor<span class="ui-button-icon ui-icon ui-icon-closethick ui-multiselect-close"></span></div>
                <div class="ui-corner-all ui-state-active ui-multiselect-selected" >Deinonychus<span class="ui-button-icon ui-icon ui-icon-closethick ui-multiselect-close"></span></div>
                <span class="ui-multiselect-search-wrapper" ><input type="text" class="ui-multiselect-search" /><span class="ui-multiselect-ruler" ></span></span>
                <div class="clear-fix" ></div>
            </div>
        	<div class="ui-multiselect-choices ui-selectmenu-menu ui-selectmenu-open" >
                <ul class="ui-menu ui-corner-bottom ui-widget ui-widget-content" >
                	<li class="ui-selectmenu-optgroup ui-menu-divider" >Theropods</li>
                    <li class="ui-menu-item" ><div class="ui-menu-item-wrapper ui-state-active" >Tyrannosaurus</div></li>
                    <li class="ui-menu-item" ><div class="ui-menu-item-wrapper" >Velociraptor</div></li>
                    <li class="ui-menu-item" ><div class="ui-menu-item-wrapper" >Deinonychus</div></li>

                    <li class="ui-selectmenu-optgroup ui-menu-divider" >Sauropods</li>
                    <li class="ui-menu-item" ><div class="ui-menu-item-wrapper" >Diplodocus</div></li>
                    <li class="ui-menu-item" ><div class="ui-menu-item-wrapper" >Saltasaurus</div></li>
                    <li class="ui-menu-item" ><div class="ui-menu-item-wrapper" >Apatosaurus</div></li>
                </ul>
            </div>
        </div>
			 */	
	}); //END: $.extend
	
	/**
     * THE brains of the operation
	 */
	$.fn[ pluginName ] = function( options ) { 	
		//if no elements in selector return (html node not found in dom)
		var args = arguments;
		function pluginControler( options, self, args ){
			//get stored copy of the class - prevent mutiple instantiation
			var instance = $(self).data( pluginName );
	
			if( !instance ){
				if ( typeof options === 'object' || !options ) {
					//create the plugin instance
					instance = new Plugin( self, options);
					$(self).data( pluginName , instance);
					return $(self);
				}else{
					//calling a function on a non instanced plugin
					throw 'Plugin must be initialised before using method: ' + options;
				}
			}else{			
				if( typeof options === 'string' && options.charAt(0) == '_' && instance[ options ] ){
					//a little hack to get private protection on methods
					throw pluginName  + ' Method ' + options + ' is private!';
				}else if ( typeof options === 'object' || !options ) {
					//options object or empty, this maintain runtime access to options;
					return $(self);
				}else if (instance[ options ] && typeof( instance[ options ] ) == 'function' ) {
					//call to a public method
					//console.log(options); 
					return instance[ options ].apply( instance,  Array.prototype.slice.call( args, 1 ) ); 
				}else {
					//no method matchs
					throw 'Method ' + options + ' does not exist.';
				}
			}
		};

		//return pluginControler( options, this, args );
		if (!$(this).length) {
			return $(this);
		}else if($(this).length == 1){
			return pluginControler( options, this, args);
		}else{
			return $.each(this, function(){	
				//not returning a actual value from a function with multiple objects assigned
				return pluginControler( options, this, args);
			});
		}
	};
	
} ) ( jQuery, window, document );