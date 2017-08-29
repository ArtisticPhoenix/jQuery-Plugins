(function($){
	/**
     * PLUGIN BOILERPLATE
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
			text : 'Copy to clipboard',
			name : false,
			id		: false, //leave false to auto generate a index based on the below prefix and instance count
			prefix : NAMESPACE,  //jqClipboard  ( id prefix + instance eg. jqClipboard-1, jqClipboard-2)
			title : false,
			class : '',
			style : {},
			html : '<button></button>',
			beforeInit : function( arguments ){}, 
			onInitFail : function(){
				console.log( NAMESPACE + ' unsuported browser' );
			},
			beforeCopy : function(element){
				if( element.is('input') ){
					return element.val();
				}else{
					return element.text();
				}
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
		this._defaults = {
			button : false,
			my_instance : 0
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
	Plugin.prototype._shared = {
		instances : 0
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
			
			this._defaults.button = $(this._options.html);
			
			this.element.after( this._defaults.button );
	
			this._defaults.my_instance = this._shared.instances; //store this for prosterity, if we dont do this then updating the options will use the last instance recorded before that.	
				
			//extend the option array on _init
			this._update(options); // deep extend	
	
			++this._shared.instances; //inc the instance count ( 0 based so after the fact ), this is for the next instance to use.
			
			var self = this;
			this._defaults.button.click(function(event) {
				self._copy();
			});
				
			//callback to options afterInit
			this._options.afterInit.apply(this,  [arguments] );
		},
		_update : function(options){
			this._options = $.extend(true, this._options, options); // deep extend
			
			this._defaults.button.text(this._options.text);
			
			if( this._defaults.button.is('input') ){
				return this._defaults.button.val();
			}else{
				return this._defaults.button.text();
			}
			
			if( this._options.id ){
				this._defaults.button.attr('id', this._options.id);
			}else{
				this._defaults.button.attr('id', this._options.prefix +'-'+this._defaults.my_instance);
			}
			
			if( this._options.name ){
				this._defaults.button.attr('name', this._options.name);
			}
			
			if( this._options.title ){
				this._defaults.button.attr('title', this._options.title);
			}
			
			if( this._options.class ){
				this._defaults.button.attr('class', this._options.class);
			}
			
			if( this._options.style ){
				this._defaults.button.css( this._options.style );
			}
	
		},
		_copy : function (arg){
			var textArea = $( '<textarea></textarea>');
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
				'background' : 'transparent',
			});

			textArea.val( this._options.beforeCopy.apply(this,  [this.element] ) );

			$('body').append( textArea );
			
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
		/**
		* destroy the plugin instance
		*/
		destroy : function () {
			$.remove(this._defaults.button);
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

/*
function copyTextToClipboard(text) {
  var textArea = document.createElement("textarea");

  //
  // *** This styling is an extra step which is likely not required. ***
  //
  // Why is it here? To ensure:
  // 1. the element is able to have focus and selection.
  // 2. if element was to flash render it has minimal visual impact.
  // 3. less flakyness with selection and copying which **might** occur if
  //    the textarea element is not visible.
  //
  // The likelihood is the element won't even render, not even a flash,
  // so some of these are just precautions. However in IE the element
  // is visible whilst the popup box asking the user for permission for
  // the web page to copy to the clipboard.
  //

  // Place in top-left corner of screen regardless of scroll position.
  textArea.style.position = 'fixed';
  textArea.style.top = 0;
  textArea.style.left = 0;

  // Ensure it has a small width and height. Setting to 1px / 1em
  // doesn't work as this gives a negative w/h on some browsers.
  textArea.style.width = '2em';
  textArea.style.height = '2em';

  // We don't need padding, reducing the size if it does flash render.
  textArea.style.padding = 0;

  // Clean up any borders.
  textArea.style.border = 'none';
  textArea.style.outline = 'none';
  textArea.style.boxShadow = 'none';

  // Avoid flash of white box if rendered for any reason.
  textArea.style.background = 'transparent';


  textArea.value = text;

  document.body.appendChild(textArea);

  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Copying text command was ' + msg);
  } catch (err) {
    console.log('Oops, unable to copy');
  }

  document.body.removeChild(textArea);
}


var copyBobBtn = document.querySelector('.js-copy-bob-btn'),
  copyJaneBtn = document.querySelector('.js-copy-jane-btn');

copyBobBtn.addEventListener('click', function(event) {
  copyTextToClipboard('Bob');
});


copyJaneBtn.addEventListener('click', function(event) {
  copyTextToClipboard('Jane');
});
*/


/*
Is it supported?

    document.queryCommandSupported('copy') should return true if the command "is supported by the browser".
    and document.queryCommandEnabled('copy') return true if the document.execCommand('copy') will succeed if called now. Checking to ensure the command was called from a user-initiated thread and other requirements are met.
*/