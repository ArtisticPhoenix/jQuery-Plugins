(function($){
	
	/**
     * PLUGIN BRAINS
     *  
     * INSTRUCTIONS:
     * 
     * $(body).jqKeyEvents({listen:'keyup'});
     * 
     * $(body).bind('jqKeyEvents.keyup.backspace',function(event, jqKeyEvents, key, mods){
     *   //event
     *   //jqKeyEvents = this
     *   //key = backspace
     * 	 //mods = mods.altKey | mods.ctrlKey | shiftKey
     * });
     * 
	 */
	 
	/* Don't forget to name the plugin here */
	var NAMESPACE = 'jqKeyEvents';

	var Plugin = function ( target, methodOrOptions, index) {
		/**
		* back reference to target object
		*/
		this.$this = $(target);

		this._options = {
			listen			: ['keyup', 'keydown', 'keypress'],
			eventPrefix		: {keyup : '.keyup.', keydown : '.keydown.', keypress : '.keypress.'},
			timer			: {keyup : {}, keydown : {}, keypress : {}},
			//delay			: {keyup : 0, keydown : 0, keypress : 0},
			beforeTrigger	: function(event, target){ return true; }, //return false to prevent trigger
			beforeInit		: function(target, options, index){}, //scope resolution exposed in this function
			afterInit		: function(target, options, index){} //scope resolution exposed in this function
		};	

		/**
		* run the plugin (_init)
		*/
		this._init( target, methodOrOptions, index); 	
		
		return this; 
	} //end plugin class

	Plugin.prototype._defaults = {
		keyboardKeys	: {
		/*	1 : "mouseLeft", 2 : "mouseMiddle", 3 : "mouseRight", */
			8 : "backspace",9 : "tab",13 : "enter",16 : "shift",17 : "ctrl",18 : "alt",19 : "pauseBreak",20 : "capsLock",27 : "escape",33 : "pageUp",
			34 : "pageDown",35 : "end",36 : "home",37 : "left",38 : "up",39 : "right",40 : "down",45 : "insert",46 : "delete",48 : "0",49 : "1",50 : "2",
			51 : "3",52 : "4",53 : "5",54 : "6",55 : "7",56 : "8",57 : "9",65 : "a",66 : "b",67 : "c",68 : "d",69 : "e",70 : "f",71 : "g",72 : "h",73 : "i",
			74 : "j",75 : "k",76 : "l",77 : "m",78 : "n",79 : "o",80 : "p",81 : "q",82 : "r",83 : "s",84 : "t",85 : "u",86 : "v",87 : "w",88 : "x",89 : "y",
			90 : "z",91 : "leftWindow",92 : "rightWindow",93 : "selectKey",96 : "numpad_0",97 : "numpad_1",98 : "numpad_2",99 : "numpad_3",
			100 : "numpad_4",101 : "numpad_5",102 : "numpad_6",103 : "numpad_7",104 : "numpad_8",105 : "numpad_9",106 : "multiply",107 : "add",109 : "subtract",
			110 : "decimal",111 : "divide",112 : "f1",113 : "f2",114 : "f3",115 : "f4",116 : "f5",117 : "f6",118 : "f7",119 : "f8",120 : "f9",121 : "f10",
			122 : "f11",123 : "f12",144 : "numLock",145 : "scrollLock",186 : "semiColon",187 : "equal",188 : "comma",189 : "dash",
			190 : "period",191 : "forwardSlash",192 : "graveAccent",219 : "openBracket",220 : "backSlash",221 : "closeBraket",222 : "singleQuote"
		},
		events : ['keyup', 'keydown', 'keypress']
	};

	var _private = {
		_init : function(target, options, index){
			//callback to options beforeInit
			this._options.beforeInit.apply(this,  arguments );
			//extend the option array on _init
		
			this._update(options); //shallow extend
			this._attachEvents();
			
			//callback to options afterInit
			this._options.afterInit.apply(this,  [target, this._options, index] );
		},
		_update : function(options){
			this._options = $.extend(this._options, options); //shallow
		},
		_getCode : function( event ){
			return (event.keyCode ? event.keyCode : event.which);
		},
		_getKeyFromEvent  : function( event ){
			var code = this._getCode(event);
			return this._defaults.keyboardKeys[code];
		},
		_getKeyFromCode  : function( code ){
			return this._defaults.keyboardKeys[code];
		},
		_attachEvents	: function(){
			var self = this;
			var $this = self.$this;

			$.each(this._defaults.events, function(i,v){
				$this.on(v, function( event ){
					self.doKey(event);
				});
			});
		}
		
	};	
	
	$.extend( Plugin.prototype, _private);
	
	var _public = {
			destroy : function () {
				var $this = this.$this;
				$this.unbind(NAMESPACE);
				$this.off(NAMESPACE);
				$this.removeData(NAMESPACE);
				this.$this = null;
				return this;
			},
			doKey	: function(event){
				var self = this;
				var $this = self.$this;
				var key = self._getKeyFromEvent( event );
				var mods = {};
				if(event.altKey){
					mods['altKey'] = true;
				}
				
				if(event.ctrlKey){
					mods['ctrlKey'] = true;
				}
				
				if(event.shiftKey){
					mods['shiftKey'] = true;
				}
				
				if($.inArray(event.type, self._options.listen) != -1){	
					if(self._options.beforeTrigger(event, $this, key)){
						var eventName = NAMESPACE+self._options.eventPrefix[event.type]+key;
						//$this.trigger(eventName, [event, $this, key, mods]);
						//console.log(event);
						$(event.target).trigger(eventName, [event, $this, key, mods]);
					}
				}
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