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
	
	/**
     * PLUGIN BoilerPlate
	 */
	 
	/* Don't forget to name the plugin here */
	var pluginName  = 'multiselect',
		defaults = {
			beforeInit : function( args ){}, 
			afterInit : function( args ){},
			propertyName: "value"
		};

	//plugin constructor
	function Plugin( target, options ) {
		this.element = target;
		
		//set our internal optons
		this.settings = defaults;
		
		//extend the internal options
		this.options( options );
		
		//localize defaults
		this._defaults = defaults;
		
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
		}
		
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

		return pluginControler( options, this, args );
	};
	
} ) ( jQuery, window, document );