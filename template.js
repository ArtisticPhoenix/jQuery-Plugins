(function($){
	
	/**
     * PLUGIN BOILERPLATE
	 */
	 
	/* Don't forget to name the plugin here */
	var NAMESPACE = 'BoilerPlate';

	/**
	 * Generic plugin wrapper class ( for scope/data resolution && data saving/loading -via- $(target).data(NAMESPACE)
	 */
	var Plugin = function ( target, methodOrOptions) {
		/**
		* back reference to jQuery object
		*/
		this.element = $(target);
		
		/**
		* public option collection, accessible outside of this instance by $(target).pluginName({param:value}); (not shared across multiple plugin instances)
		* options can be set on _init or during runtime
		*/
		this._options = {
			/**
			*	because we use .apply( this, .. ) scope resolution,
			*	it's premissible to use this to refer to the plugin within callback
			*/
			beforeInit : function( arguments ){}, 
			afterInit : function( arguments ){}
		};	

		/**
		* run the plugin (_init)
		*/
		this._init( target, methodOrOptions); 	
		
		return this; 
	}; //end plugin class
	/**
	* GLOBAL PLUGIN SPACE
	* all data in this area is shared between plugin instances
	* declare static vars here - normal in _options(public) _defaults(private)
	*/
	
	/** STATIC PROPERTIES - or shared props,
	* these exist across multiple plugin instance access by simply STATIC.propname
	* (are not accessible in global scope) 
	*/
	Plugin.prototype._defaults = {

	};

	/**
	* PRIVATE METHODS -
	* these are accessed this._methodName();
	* no external access (outside plugin)
	*/
	var _private = {
		_init : function(target, options){
			//callback to options beforeInit
			this._options.beforeInit.apply(this,  [arguments] );
				
			//extend the option array on _init
			this._update(options); // deep extend	
				
			//callback to options afterInit
			this._options.afterInit.apply(this,  [arguments] );
		},
		_update : function(options){
			//console.log(options);
			this._options = $.extend(true, this._options, options); // deep extend
			//console.log(_options);
		},
		_privateMethod : function (arg){
			console.log("Private method scope(arg,this,_private(method collection), $(element),self,STATIC,_options,_defaults)");			
			console.log(arg); //pass through arg
			console.log(this); 
			console.log(this._private); //scope of this._private
			console.log(this.$element); //$(element)
			console.log(this._options); //user modified options
			console.log(this._defaults); //property collection
		}
		
	};		
	$.extend( Plugin.prototype, _private);
	
	/**
	* PUBLIC METHODS -
	* these are accessed as this.methodName()
	* the same as above, with external access granted by the control section $(element).pluginName('methodName', arg);
	* as noted on the method wrappers scope you should return this.$element to maintain chainablillity from public methods
	*/
	var _public = {
		/**
		* set options
		* @param object args - an object with key value pairs to set in _options
		*/
		options : function ( args ){
			this._update( args );
		},
		/**
		* destroy the plugin instance
		*/
		destroy : function () {
			this.element.removeData(NAMESPACE);
			return this;
		},
		/**
		* get a value from the _options object
		* @param mixed params - an array of nested params ['top','middle','bottom'] or a string selector such as 'top.middle.bottom'
		* @param boolean silent - false to throw errors for undefined params
		* @param mixed defultValue - a value to return when paramm is undefined ( with silent=true )
		*/
		getParam : function( params, silent, defaultValue ){
			if(!defaultValue){
				//muh default is a keyword
				defaultValue = '';
			}
			
			if( typeof params === 'string'){
				var params = params.split('.');
			}

			var value = this._options;
			var checked = [];
			$.each(params, function(index, param){
				checked.push(param);
				if( value.hasOwnProperty( param )){
					value = value[param];
				}else{
					if( !silent ){
						throw checked.join('.') +' is undefined in ' + NAMESPACE;
					}
					value = defaultValue;
				}
			});

			return value;	
		}
	};	
		
	$.extend( Plugin.prototype, _public);
	
	/**
     * THE brains of the operation
	 */
	$.fn[NAMESPACE] = function( methodOrOptions ) { 	
		//if no elements in selector return (html node not found in dom)
		var args = arguments;
		var controler = function ( methodOrOptions, self, args){
			//get stored copy of the class - prevent mutiple instantiation
			var instance = $(self).data(NAMESPACE);
			var _return = $(self);
			if(!instance){
				if ( typeof methodOrOptions === 'object' || !methodOrOptions) {
					//create the plugin instance
					instance = new Plugin( self, methodOrOptions);
					$(self).data( NAMESPACE, instance);
				}else{
					//calling a function on a non instanced plugin
					throw 'Plugin must be initialised before using method: ' + methodOrOptions;
				}
			}else{			
				if( typeof methodOrOptions === 'string' && methodOrOptions.charAt(0) == '_' && instance[ methodOrOptions ]){
					//a little hack to get private protection on methods
					//console.log('CASE: invalid method (private)');
					throw NAMESPACE + ' Method ' + methodOrOptions + ' is private!';
				}else if ( typeof methodOrOptions === 'object' || !methodOrOptions ) {
					//console.log('CASE: instance and (argument is options object or empty) maintain runtime access to options');
					//instance._update.call(instance, methodOrOptions);
				}else if (instance[ methodOrOptions ] && typeof( instance[ methodOrOptions ] ) == 'function' ) {
					//console.log('CASE: public method (in protype space or the ( function($){}(jQuery); scope ) ');
					//console.log(methodOrOptions); 
					_return = instance[ methodOrOptions ].apply(instance,  Array.prototype.slice.call(args, 1 ) ); 
				}else {
					//console.log('CASE: invalid method (not exists)');
					throw 'Method ' + methodOrOptions + ' does not exist.';
				}
			}
			return _return;
		};
		
		
		if (!$(this).length) {
			return $(this);
		}else if($(this).length == 1){
			return controler( methodOrOptions, this, args);
		}else{
			return $.each(this, function(){	
				//not returning a actual value from a function with multiple objects assigned
				return controler( methodOrOptions, this, args);
			});
		}
	};
})(jQuery);