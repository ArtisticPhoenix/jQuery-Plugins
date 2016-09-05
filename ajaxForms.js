(function($){
	/**
     * PLUGIN BRAINS
     *  
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
	var NAMESPACE = 'ajaxForms';

	/**
	 * Generic plugin wrapper class ( for scope/data resolution && data saving/loading -via- $(el).data(Plugin))
	 */
	var Plugin = function ( target, methodOrOptions, index) {
		/**
		* back reference to jQuery object
		*/
		this.$this = $(target);
		
		/**
		* public option collection, accessible outside of this instance by $(el).pluginName({param:value}); (not shared across plugins)
		* options can be set on _init or during runtime
		*/
		this._options = {
			beforeInit			: function(){},
			afterInit			: function(){},
			method				: 'auto',
			url					: 'auto',
			done				: function(data, textStatus, jqXHR){ return true;},	//must return true to fire submit(callback)
			failure				: function(jqXHR, textStatus, errorThrown){
									$.error(
										"The following error occured: "+
										textStatus, errorThrown
									);
								},
			always				: function(data, textStatus, jqXHR){ return true;}, //must return true to fire submit(callback)
			dotFix				: "-",
			_collection			: {}, //the html form elements collection
			_clean_values	 	: {}, //the html form elements clean data
			_iframe				: false,
			iframeCookie		: 'ajaxForms',
		//	_iframe_live		: false,
			_callback			: false,
			_event_prefix		: 'ajaxForms.',  //ajaxForms.beforeSubmit
			onClean				: function(data){  }, //callback when the data is clean - regardless of submitClean value and before before submit callback
			beforeSubmit		: function(data){ return data; },
			beforeAutoSubmit	: function(){ return true; },
			beforeSubmitDelete  : function(data){ return data; },
			afterGetData		: function(data){ return data; }, //callback after getting data from form elements, used for data isClean
			submitClean			: true, //submit even when the form is clean
			eventSubmit			: true, //callback when the form is submitted - through other events
			exitBlock			: true,
			autoSave			: false, //save when the form is dirty
			autoTimeout			: 1500, //timout for saving delay
			_autoTimer			: false, //autosave timout
			/*
			readyState Description
			0      The request is not initialized
			1      The request has been set up
			2      The request has been sent
			3      The request is in process
			4      The request is complete
			*/
			_request			: false, //request object
			model				: "#ajax-loading-model"
		
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
	* these exist across multiple plugin instance access by simply _defaults.propname
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
			var self = this;
			//callback to options beforeInit
			self._options.beforeInit.apply(self,  arguments );
				
			//extend the option array on _init
			self._update(options); // deep extend	
			
			var collection = self.$this.find('input, select, textarea').not('input[type="button"], input[type="submit"], input[type="reset"]');
			
			if($(self.$this).is('form')){
				if(self._options.method == 'auto'){
					self._options.method = 'get';
					if($(target).attr('method') !== undefined && $.trim($(target).attr('method')) != ''){
						self._options.method = $(target).attr('method');
					}
					
					if($(target).attr('action') !== undefined && $.trim($(target).attr('action')) != ''){
						self._options.url = $(target).attr('action');
					}
				}
				
				if($(target).attr('enctype') == 'multipart/form-data' ){
					self._options._iframe = 'ajaxForms_iframe_' + Date.now();
				}
				/*if($(target).attr('enctype') == 'multipart/form-data' ){
					
					//	IMPORTANT - when using this option, multipart/form-data iframe substitution,
					//	you must have a <input type="submit"/> in the form, for it to submit to the iframe

					//&& $(target).find('input[type="file"]')
					self._options._iframe = 'ajaxForms_iframe_' + Date.now();
					$(target).after('<iframe id="'+self._options._iframe+'" name="'+self._options._iframe+'" style="display:none;" ></iframe>');
					$('#'+self._options._iframe).load(function(event){
						var contents = $(this).contents().find("body").text();
						console.log(contents);
						$(this).contents().find("body").text('')
						if(self._options._iframe_live){
							self._options._iframe_live = false;
							$(self._options.model).css('display', 'none');
							//--------------
							//var _callback_active = self._options.done(data, textStatus, jqXHR);
							//self._options.failure(jqXHR, textStatus, errorThrown);
							
							// callback handler that will be called regardless
							// if the request failed or succeeded
							var data = {
								responseText : contents
							};
								
							self._options.done(data, "success");
								
							if(self._options.always(data, "success") && typeof self._options._callback === 'function' ){
								self._options._callback(self, data, "success");
								self._options._callback = false;
							}
						}
						//-------------
					});
				}*/
				
				/*if(self._options.eventSubmit){
					//not compattable yet
					self.$this.bind('submit', function(event){
						event.preventDefault();
						self.submit();
						return false;
					});
				}*/
				
			}else{
				if(self._options.method == 'auto'){
					self._options.method = 'get';
				}
			}
			
			if(self._options.url == 'auto'){
				$.error('A url must be set for ajaxForms to work correctly');
			}
			
			$.each(collection, function(i,v){
				self.add(v);
			});
			
			self.resetCleanValues();
			
			
			
			
			$(target).on('change', 'input, textarea, select', function(e){
				self._triggerChange( e );
			});

			//callback to options afterInit
			self._options.afterInit.apply(self,  [target, self._options, index] );
		},
		_triggerChange : function( e ){
			var self = this;
			var element = $(e.target);
			if( self._options.autoSave ){
				clearTimeout( self._options._autoTimer );
				
				var timeout = self._options.autoTimeout;
				if( typeof self._options._request == 'object' ){
					//request already sent, so just send the new one which will cancel the old instead of waiting.
					self._options._request.abort();
				}
				
				self._options._autoTimer = setTimeout( function(){
					if( self._options.beforeAutoSubmit(self.getData()) ){
						self._submit();
					}
				}, timeout);
			}
		},
		_submit : function(callback, dirty, type){
			//console.log(this);
			var self = this;
			var _callback = false;
			var _callback_active = true;
	
			if(typeof callback === 'function'){
				_callback = callback;
			}
			var data = self._options.beforeSubmit(self.getData());
			if(type){
				data[type] = type;
			}else{
				data['submitSave'] = 'submitSave';
			}
			
			//console.log(type);
			var _data = self.$this.triggerHandler(self._options._event_prefix + "beforeSubmit", data);
			if(_data != undefined){
				//use _data only when its defined
				data = _data;
			}

			if(false !== data){
				if(self._options.model){
					$(self._options.model).css('display', 'block');
				}
				
				//abort previous saves
				if( typeof self._options._request == 'object' ){
					self._options._request.abort();
				}

				self._options._request = $.ajax({
					url: self._options.url,
					type: self._options.method,
					data : data
				});
				
				self._options._request.done(function (data, textStatus, jqXHR){
					_callback_active = self._options.done(data, textStatus, jqXHR);
				});
				
				// callback handler that will be called on failure
				self._options._request.fail(function (jqXHR, textStatus, errorThrown){
					self._options.failure(jqXHR, textStatus, errorThrown);
				});

				// callback handler that will be called regardless
				// if the request failed or succeeded
				self._options._request.always(function (data, textStatus, jqXHR) {
					$(self._options.model).css('display', 'none');
					if( self._options.always(data, textStatus, jqXHR) && _callback_active ){
						if(false !== _callback){
							_callback(self, data, textStatus, jqXHR);
						}else{
							//do nothing
						}
					}
					self.$this.triggerHandler(self._options._event_prefix + "afterSubmit", data, textStatus, jqXHR);
					self._options._request = false;
				});
			}
		},
		_submitIframe : function(callback, dirty){
			var self = this;
			var data = self._options.beforeSubmit(self.getData());
			if(false !== data){
				//console.log('_submitIframe');
				if((self._options.submitClean && !dirty) || dirty){
					//console.log('_submitIframe1');
					if(typeof callback === 'function'){
						self._options._callback = callback;
					}
					//	IMPORTANT - when using this option, multipart/form-data iframe substitution,
					//	you must have a <input type="submit"/> in the form, for it to submit to the iframe
					//  you cannot prevent the form submission using e.preventDefault
					
					if(self._options.model){
						$(self._options.model).css('display', 'block');
					}
					
					//use cookie method to trigger response when downloading using post
					//set Cookie {self._options.iframeCookie} when downloads are complete
					//mainly for use with chrome
					//document.cookie = self._options.iframeCookie + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
					var iframeInterval = setInterval(function(){
						var value = "; " + document.cookie;
						var parts = value.split("; " + self._options.iframeCookie + "=");
						if (parts.length == 2){
							clearInterval(iframeInterval);
							var contents = parts.pop().split(";").shift();
							contents = decodeURIComponent(contents);
							//url decode contents.
							document.cookie = self._options.iframeCookie + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
							$('#'+self._options._iframe).remove();
							$(self._options.model).css('display', 'none');
							//--------------
							// callback handler that will be called regardless
							// if the request failed or succeeded
							var data = {
								responseText : contents
							};
							//console.log('cookie');
							self._options.done(data, "success");
								
							if(self._options.always(data, "success") && typeof self._options._callback === 'function' ){
								self._options._callback(self, data, "success");
								self._options._callback = false;
							}
							
						}					
					}, 1000);
					
					if($('#'+self._options._iframe).length == 0){
						//console.log('_submitIframe1');
						$('<iframe id="'+self._options._iframe+'" name="'+self._options._iframe+'" style="display:none;" ></iframe>')
						.appendTo('body')
						.load(function(event){
							//console.log('on load');
							clearInterval(iframeInterval);
							var contents = $(this).contents().find("body").text();
							//------------- added ------------//
							$('#'+self._options._iframe).remove();
							//console.log(contents);
							//$(this).contents().find("body").text('')
							$(self._options.model).css('display', 'none');
							//--------------
							//var _callback_active = self._options.done(data, textStatus, jqXHR);
							//self._options.failure(jqXHR, textStatus, errorThrown);
							
							// callback handler that will be called regardless
							// if the request failed or succeeded
							var data = {
								responseText : contents
							};
								
							self._options.done(data, "success");
								
							if(self._options.always(data, "success") && typeof self._options._callback === 'function' ){
								self._options._callback(self, data, "success");
								self._options._callback = false;
							}
						});
					}
					//@todo dotfix not working in iframes, could rename all elements submit name them back?
					
					//console.log('sent');
					self.$this.attr('target', self._options._iframe).submit();
				}else{
					if(typeof callback === 'function'){
						callback(self, data);
					}
				}
			}
		},
		_update : function(options){
			var self = this;
			self._options = $.extend(true, this._options, options); // deep extend
			if(self._options.exitBlock){
				self.exitBlock();
			}
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
			/* remove event listners */
			$(window).unbind('beforeunload', $.proxy(this.onBeforeUnload, this));
			//this.$this.unbind(this._options._event_prefix); -- recusion problem
			if(this._options._iframe){
				$('#'+this._options._iframe).unbind('load').remove();
			}
			
			this.$this.removeData(NAMESPACE);
			return;
		},
		add : function(element){
			var self = this;
			var name = $(element).attr('name');
			
			if(name){
				if(self._options.dotFix){
					name = name.replace(/\./g, self._options.dotFix);
				}
				
				
				
				
				if (this._options._collection.hasOwnProperty(name)) {
					this._options._collection[name] = $.makeArray(this._options._collection[name]);
					this._options._collection[name].push(element);
				}else {
					this._options._collection[name] = element;
				}
			}else{
				//console.log(element);
			}
		},
		getData : function(){
			var data={};
			var self = this;
			var arr_data = this.$this.serializeArray();
			$.each(arr_data, function(i, v){
				var name = v.name;
				if(self._options.dotFix){
					name = name.replace(/\./g, self._options.dotFix);
				}
				
				if (data.hasOwnProperty(name)) {
					data[name] = $.makeArray(data[name]);
					data[name].push(v.value);
				}else {
					data[name] = v.value;
				}
			});	
			return self._options.afterGetData(data);
		},
		getCleanData : function(){
			return this._options._clean_values;
		},
		resetCleanValues : function(){
			this._options._clean_values = this.getData();
		},
		setDirty : function(data, parent){
			this._options._clean_values = '';
		},
		clear : function(){
			
		
		},
		setData : function(data, parent){
			var self = this;
			$.each(data, function(i, v){
				if(v === null){
					v = '';
				}
				var name = i;
				if(parent){
					name = parent + '.' + i;
				}
				if(typeof v === 'object'){
					self.setData(v, name);
				}else{
					var element = self.$this.find('input[name="'+name+'"], textarea[name="'+name+'"], select[name="'+name+'"]');
					if(element.size() > 0){
						$.each(element, function(){
							//@todo test
							if($(this).is('input[type="checkbox"], input[type="radio"]')){
								if(typeof v === 'boolean'){
									$(this).prop('checked', v);
								}else{
									if($(this).val() == v.toString()){
										$(this).prop('checked', true);
									}else{
										$(this).prop('checked', false);
									}
								}
							}else if($(this).is('select')){
								if(typeof v === 'boolean'){
									if(v){
										v = '1';
									}else{
										v = '0';
									}
								}
								$(this).val(v);
							}else if($(this).is('textarea')){
								//console.log(v);
								$(this).val(v);
							}else if($(this).is('input[type="file"]')){
								var link = $(this).parent('td').prev('td').find('a');
								if(link.size() > 0){
									link.text(v);
								}
							}else{
								$(this).val(v);
							}
						});
					}
				}
			});
		},
		exitBlock : function(){	
			$(window).bind('beforeunload', $.proxy(this.onBeforeUnload, this));	
		},
		onBeforeUnload : function(){
			var self = this;
			if(self.isDirty()){
				return "This page is asking you to confirm that you want to leave - data you have entered may not be saved.";
			}
		},
		isBusy : function(){
			var self = this;
			if( typeof self._options._request != 'object' ){
				return false;
			}
			if( typeof self._options._request.readyState != 'undefined' ){
				switch( self._options._request.readyState ){
					case 0:		;//The request is not initialized
						return false;
					case 1:		 ;//The request has been set up
						return false;
					case 2:		 ;//The request has been sent
						return true;
					case 3:		;//The request is in process
						return true;
					case 4:		;//The request is complete
						return false;
				}
			}
		},
		isDirty : function(){
			//if(this.$this)
		
			var dirty_values = this.getData();
			var clean_values = this._options._clean_values;
			if(JSON.stringify(clean_values) !== JSON.stringify(dirty_values)){
				return true; //it is dirty
			}
			return false; //it is clean
		},
		submit : function(callback){
			var self = this;
			//submit if isDirty or if !isDirty and submit clean option
			var dirty = self.isDirty();

			if(!dirty){
				this._options.onClean();
			}
			//console.log(self._options._iframe);
			if(self._options._iframe){
				return self._submitIframe(callback, dirty, 'submitSave');
			}
			
			self._submit(callback, dirty, 'submitSave');
			
			return self
		},
		submitReload : function(callback){
			var self = this;
			self._submit(callback, true, 'submitReload');
		},
		submitDelete : function(callback){
			var self = this;
			self._submit(callback, true, 'submitDelete');
		},
		options : function( options ){
			var self = this;
			self._update( options );
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
					instance = new Plugin( _this, methodOrOptions, index); // ok to overwrite if this is a re-init
					$(_this).data( NAMESPACE, instance);
				}else{
					$.error( 'Plugin must be initialised before using method: ' + methodOrOptions );
				}
			}else{			
				if( typeof methodOrOptions === 'string' && methodOrOptions.charAt(0) == '_' && instance[ methodOrOptions ]){
					//a little hack to get private protection on methods
					$.error( NAMESPACE + ' Method ' + methodOrOptions + ' is private!' );
				}else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
					//instance._update.call(instance, methodOrOptions);
				}else if (instance[ methodOrOptions ] && typeof( instance[ methodOrOptions ] ) == 'function' ) {
					_return = instance[ methodOrOptions ].apply(instance,  Array.prototype.slice.call(args, 1 ) ); 
				}else {
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