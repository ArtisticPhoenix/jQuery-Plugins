(function($){
	
	/**
     * PLUGIN BRAINS
     * setcookie('iDownloader', 1, null, '/');
     * INSTRUCTIONS:
     * 
     * To init, call...
     * $('selector').myPluginName(options) 
     * 
     * Some time later...  
     * $('selector').myPluginName('myActionMethod')
	 * 
	 * Some time even later... (change options during runtime)
     * $('selector').myPluginName(options) 
	 *
     * DETAILS:
     * Once init with $('...').myPluginName({options}), you can call
     * $('...').myPluginName('myAction') where myAction is a method in this
     * class.
     * 
     * The scope, ie "this", **is the object itself**.  The jQuery match is stored
     * in the property $this.  In general this value ($this) should be returned to allow
     * for jQuery chaining by the user.
     *  
     * Methods which begin with underscore are private and not 
     * publicly accessible.
     * 
     * CHECK IT OUT...
     * var mySelecta = 'DIV';
     * jQuery(mySelecta).myPluginName();
     * jQuery(mySelecta).myPluginName('publicMethod');
     * jQuery(mySelecta).myPluginName('_privateMethod'); - throws error for methods starting with "_" 
	 */
	 
	/* Don't forget to name the plugin here */
	var NAMESPACE = 'iDownloader';

	/**
	 * Generic plugin wrapper class ( for scope/data resolution && data saving/loading -via- $(el).data(Plugin))
	 */
	var Plugin = function ( target, methodOrOptions, index) {
		/**
		* back reference to jQuery object
		*/
		this.$target = $(target);
		
		/**
		* public option collection, accessible outside of this instance by $(el).pluginName({param:value}); (not shared across plugins)
		* options can be set on _init or during runtime
		*/
		this._options = {
			beforeInit			: function(){},
			afterInit			: function(){},
			onError				: function( data ){},
			onComplete			: function(){},
			url					: '',
			iframeCookie		: 'iDownloader',
			_event_prefix		: 'iDownloader.',
			_iframeName			: 'iDownloader',
			_cookieTimer		: false
		};	

		/**
		* run the plugin (_init)
		*/
		this._init( target, methodOrOptions, index); 	
		
		return this; 
	} //end plugin class
	/**
	* GLOBAL PLUGIN SPACE
	* all data in this area is shared between plugin instances
	* declare static vars here - normal in _options(public) _defaults(private)
	*/
	
	/** STATIC PROPERTIES - or shared props,
	* these exist across multiple plugin instance access by simply STATIC.propname
	* (are not accessible in global scope) 
	* - although you could easily split this (suggested PUBLIC_STATIC & PRIVATE_STATIC) and 
	* add a $.extend function as (_update) does to allow access such as $(el).pluginName('setStatic', options);
	*/
	Plugin.prototype._defaults = {

	};

	/**
	* PRIVATE METHODS -
	* these are accessed this._methodName();
	* no external access (outside plugin)
	*/
	var _private = {
		_init : function(target, options, index){
			//callback to options beforeInit
			this._options.beforeInit.apply(this,  arguments );
			//extend the option array on _init
			
			this._options._time = new Date().getTime();
			var iFrameName = this._options._iframeName;
			window.iDownloadComplete = function(){
				var $downloader = $('#' + iFrameName ).data(NAMESPACE + '-download');
				$downloader._onLoad();
			};
			this._update(options); // deep extend	
			//make sure the cookie doesn't exist to begin with
			this._removeCookie();
			//callback to options afterInit
			this._options.afterInit.apply(this,  [target, this._options, index] );
		},
		_update : function(options){
			//console.log(options);
			this._options = $.extend(true, this._options, options); // deep extend
			//console.log(_options);
		},
		_onLoad : function(){
			var self = this;
			var iFrameName = self._options._iframeName;
			var contents = $('#'+iFrameName).contents().find("body").text();
			//console.log( self._options._cookieTimer );
			if( false !== self._options._cookieTimer ){
				//not cleared by cookie checker ~ has and error or is Mozilla etc
				clearInterval(self._options._cookieTimer);
			}
			
			setTimeout( function(){
				self._removeIframe();
				self._removeCookie();
				if( contents == '' ){
					self._options.onComplete.apply( this );
				}else{
					self._options.onError.apply(this, [contents] );
				}
			},50);
		},
		_removeCookie: function(){
			var self = this;
			//setcookie('iDownloader', 1, null, '/');
			document.cookie = self._options.iframeCookie + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
		},
		_checkCookie: function(){
			var self = this;
			var value = "; " + document.cookie;
			var parts = value.split("; " + self._options.iframeCookie + "=");
			if (parts.length == 2){		
				clearInterval(self._options._cookieTimer);	
				self._options._cookieTimer = false;			
				self._onLoad();
			}
		},
		_removeIframe : function(){
			var self = this;
			var iFrameName = self._options._iframeName;
			$('#'+iFrameName).remove();
		},
		_createIframe : function (url){
			var self = this;
			var iFrameName = self._options._iframeName;
			$('#'+iFrameName).remove();
			var html = '<iframe src="'+url+'" id="'+iFrameName+'" name="'+iFrameName+'" onload="window.iDownloadComplete()" style="display:none;" ></iframe>';
			$('body').append( html );
			$('#' + iFrameName ).data(NAMESPACE + '-download', self);
			
			self._options._cookieTimer = setInterval( function(){
				self._checkCookie();
			}, 100);
		}
		
	};		
	$.extend( Plugin.prototype, _private);
	
	/**
	* PUBLIC METHODS -
	* these are accessed as this.methodName()
	* basicly the same as above, with externall access as normal $(el).pluginName('methodName', arg);
	* as noted on the method wrappers scope you should return this.$this to maintain chainablillity from public methods
	*/
	var _public = {
		destroy : function () {
			this.$this.removeData(NAMESPACE);
			return this.$this;
		},
		download : function( url ){
			var self = this;
			if( url == undefined ){
				url = self._options.url;
			}
			self._createIframe( url );
		}
	};	
		
	$.extend( Plugin.prototype, _public);
	
	/**
     * THE brains of the operation
	 */
	$.fn[NAMESPACE] = function( methodOrOptions ) { 	
		//if no elements in selector return (html node not found in dom)
		var args = arguments;
		var index = 0;
		var controler = function ( methodOrOptions, _this, args){
			//get stored copy of the class - prevent mutiple instantiation
			var instance = $(_this).data(NAMESPACE);
			var _return = $(_this);
			if(!instance){
				if ( typeof methodOrOptions === 'object' || ! methodOrOptions) {
					//console.log('CASE: no instance and (argument is options object or empty)');
					instance = new Plugin( _this, methodOrOptions, index); // ok to overwrite if this is a re-init
					$(_this).data( NAMESPACE, instance);
					//console.log(instance);
					//return instance;
				}else{
					//console.log('CASE: method called before init');
					$.error( 'Plugin must be initialised before using method: ' + methodOrOptions );
				}
			}else{			
				if( typeof methodOrOptions === 'string' && methodOrOptions.charAt(0) == '_' && instance[ methodOrOptions ]){
					//a little hack to get private protection on methods
					//console.log('CASE: invalid method (private)');
					$.error( NAMESPACE + ' Method ' + methodOrOptions + ' is private!' );
				}else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
					//console.log('CASE: instance and (argument is options object or empty) maintain runtime access to options');
					//instance._update.call(instance, methodOrOptions);
				}else if (instance[ methodOrOptions ] && typeof( instance[ methodOrOptions ] ) == 'function' ) {
					//console.log('CASE: public method (in protype space or the ( function($){}(jQuery); scope ) ');
					//console.log(methodOrOptions); 
					_return = instance[ methodOrOptions ].apply(instance,  Array.prototype.slice.call(args, 1 ) ); 
				}else {
					//console.log('CASE: invalid method (not exists)');
					$.error( 'Method ' + methodOrOptions + ' does not exist.' );
				}
			}
			++index;
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