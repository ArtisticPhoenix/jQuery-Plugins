(function($){
	/**
     * Save to clipboard (using a hidden textarea )
	 */
	 
	/* Don't forget to name the plugin here */
	var NAMESPACE = 'jqClipboard';

	/**
	 * Generic plugin wrapper class ( for scope/data resolution && data saving/loading -via- $(target).data(NAMESPACE)
	 */
	var Plugin = function ( target, methodOrOptions) {
		/**
		* back reference to jQuery object
		*/
		this.element = $(target);
		
		/**
		* public option collection, accessible outside of this instance by $(target).pluginName({param:value}); {setting} getting $(target).pluginName('getParam', param);
		* (not shared across multiple plugin instances)
		* options can be set on _init or during runtime
		*/
		this._options = {
			/**
			*	because we use .apply( this, .. ) scope resolution,
			*	it's premissible to use this to refer to the plugin within callback
			*/
			beforeInit : function( arguments ){}, 
			onInitFail : function(){
				console.log( NAMESPACE + ' unsuported browser' );
			},
			//return false to prevent the copy ( element is the target of this plugin )
			beforeCopy : function(element){
				return true;
			},
			onGetContents : function(contents){
				return contents;
			},
			afterCopy : function(status){
				switch( status ){
					case 'success':
						console.log('Copied to clipboard');
					break;
					case 'fail':
						console.log('Failed to copy to clipboard');
					break;
					case 'error':
						console.log('Error, failed to copy to clipboard');
					break;	
				}
			},
			afterInit : function( arguments ){}
		};	
		/**
		* private varialbe collection
		*/
		this._defaults = {};

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
	Plugin.prototype._shared = {
		
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
			
			if(!document.queryCommandSupported('copy')){
				this._options.onInitFail.apply(this,  [arguments] );
				return false;
			}

			//extend the option array on _init
			this._update(options); // deep extend	

			var self = this;
				
			//callback to options afterInit
			this._options.afterInit.apply(this,  [arguments] );
		},
		_update : function(options){
			this._options = $.extend(true, this._options, options); // deep extend
		},
		_copy : function ( html ){
			var clone = this.element.clone();
			
			if( !this._options.beforeCopy.apply(this, [clone] ) ) return;
				
			var textArea = $( '<textarea></textarea>');
			
			if( !!window.chrome ){
				textArea.css({
					'width' : '100%',
					'height' : '2em',
					'padding' : 0,
					'border' : 'none',
					'outline' : 'none',
					'boxShadow' : 'none',
					'background' : 'transparent'
				});
			}else{
				textArea.css({
					'display' : '',
					'position' : 'fixed',
					'top' : 0,
					'left' : 0,
					'width' : '2em',
					'height' : '2em',
					'padding' : 0,
					'border' : 'none',
					'outline' : 'none',
					'boxShadow' : 'none',
					'background' : 'transparent'
				});

			}
			
			var contents ='';
			
			if( clone.is('input,select') ){
				contents = clone.val();	
			}else if( clone.is('textarea') ){
				contents = clone.text();	
			}else if( html ){
				contents = clone.html();	
//				console.log( contents );
			}else{
				contents = clone.text();	
			}
			
			contents = this._options.onGetContents.apply(this,  [contents, html] );
			
			$('body').append( textArea );
			
			textArea.val( contents );

			textArea.select();
	
			var status = 'success';
			
			try {
				var successful = document.execCommand('copy');
				status = successful ? 'success' : 'fail';
			} catch (err) {
				status = 'error';
			}
			
			var value = this._options.afterCopy.apply(this,  [status] );
  
			textArea.remove();
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
		copy : function( html ){
			this._copy( html );
		},	
		/**
		* destroy the plugin instance
		*/
		destroy : function () {
			this.element.removeData(NAMESPACE);
			return this;
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
					instance._update.call(instance, methodOrOptions);
				}else if (instance[ methodOrOptions ] && typeof( instance[ methodOrOptions ] ) == 'function' ) {
					//console.log('CASE: public method (in protype space or the ( function($){}(jQuery); scope ) ');
					//console.log(methodOrOptions); 
					_return = instance[ methodOrOptions ].apply(instance,  Array.prototype.slice.call(args, 1 ) );
				}else if ( instance._options[ methodOrOptions ]  ) {	
					//console.log('CASE: read option value');
					_return = instance._options[ methodOrOptions ];				
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