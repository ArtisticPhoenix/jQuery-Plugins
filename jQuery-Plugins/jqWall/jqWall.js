(function($){
	/**
     * PLUGIN BOILERPLATE
	 */
	 
	/* Don't forget to name the plugin here */
	var NAMESPACE = 'jqWall';

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
			id : false,
			autoResize : true,
			afterCreate : function(wrapper){ },
			autoComplete : { //set to false to disable autoComplete
				noCache : false,
				match : /(.+)/, //match should contain one capture group, this will be used as term in the search callback below
				limit : 10,
				caseInsensitive : true,
				cache : [],
				/*
				* @param string term - the search term
				* @param array matches - array of matches from the cache ( if noCache:false )
				* @param function callback - requred that this is called withing the search function
				*	 callback( matches, cache ) - matches = array of matches, cache = array to cache or undefined for no modication
				* @param array cache - the cache object
				*/
				search : function(term, matches, callback){
					//console.log(term);
					//console.log(matches);
					//console.log(callback);
					//console.log(cache);
					//this.setCache([]); //to update the cache
					callback( matches ); //requred to call this callback inside of the search function.
				},
				/*
				* @param string term - the search term
				* @param object item - the li element selected
				*/
				onSelect : function( term, item ){
					return term+' ';
					//return false for no selection, return false;
					//return modified string to modify what is put in the textarea eg. return term+' ';
				}
			},
			buttons	: [
				/*{
					name : 'Comment',
					icon : '<i class="fa fa-comment"></i>&nbsp;',
					click : function(event, jqWall){
						alert(1);
					}
				},*/
			],
			submit : function( arguments ){}, 
			beforeInit : function( arguments ){}, 
			afterInit : function( arguments ){}
		};	
		
		/**
		* private variables
		*
		*/
		this._defaults = {
			_wrapper : false,
			_textArea : false,
			_contextMenu : false,
			_buttons : false,
			_autoCompleteTimeout : false
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
		keyboardKeys	: {
			//1 : "mouseLeft", 2 : "mouseMiddle", 3 : "mouseRight", 
			8 : "backspace",9 : "tab",13 : "enter",16 : "shift",17 : "ctrl",18 : "alt",19 : "pauseBreak",20 : "capsLock",27 : "escape", 32 : "space", 33 : "pageUp",
			34 : "pageDown",35 : "end",36 : "home",37 : "left",38 : "up",39 : "right",40 : "down",45 : "insert",46 : "delete",48 : "0",49 : "1",50 : "2",
			51 : "3",52 : "4",53 : "5",54 : "6",55 : "7",56 : "8",57 : "9",65 : "a",66 : "b",67 : "c",68 : "d",69 : "e",70 : "f",71 : "g",72 : "h",73 : "i",
			74 : "j",75 : "k",76 : "l",77 : "m",78 : "n",79 : "o",80 : "p",81 : "q",82 : "r",83 : "s",84 : "t",85 : "u",86 : "v",87 : "w",88 : "x",89 : "y",
			90 : "z",91 : "leftWindow",92 : "rightWindow",93 : "selectKey",96 : "numpad_0",97 : "numpad_1",98 : "numpad_2",99 : "numpad_3",
			100 : "numpad_4",101 : "numpad_5",102 : "numpad_6",103 : "numpad_7",104 : "numpad_8",105 : "numpad_9",106 : "multiply",107 : "add",109 : "subtract",
			110 : "decimal",111 : "divide",112 : "f1",113 : "f2",114 : "f3",115 : "f4",116 : "f5",117 : "f6",118 : "f7",119 : "f8",120 : "f9",121 : "f10",
			122 : "f11",123 : "f12",144 : "numLock",145 : "scrollLock",186 : "semiColon",187 : "equal",188 : "comma",189 : "dash",
			190 : "period",191 : "forwardSlash",192 : "graveAccent",219 : "openBracket",220 : "backSlash",221 : "closeBraket",222 : "singleQuote"
		},
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
			
			if( !this._options.id ){
				var d = new Date();
				this._options.id = NAMESPACE+'-'+d.getTime() + d.getMilliseconds()+'_'+Math.ceil( Math.random() * 10000 );
			}
			
			//add HTML to the DOM
			var html = '<div id="'+this._options.id+'" class="'+NAMESPACE+'" >'+"\n";
				html += "\t"+'<textarea id="'+this._options.id+'-txt" class="'+NAMESPACE+'-txt" ></textarea>'+"\n";

			//add Autocomplete dropdown wrapper
			if(this._options.autoComplete){
				html += "\t"+'<ul id="'+this._options.id+'-ctx" class="'+NAMESPACE+'-ctx" ></ul>'+"\n";
			}
			
			//Buttonbar
				html += "\t"+'<div id="'+this._options.id+'-buttons" class="'+NAMESPACE+'-buttons" ></div>'+"\n";

			html += '</div>'+"\n";
			
			target.append(html);
			
			
			
			//cache the these objects for ease of use
			this._defaults._wrapper = $('#'+this._options.id);
			this._defaults._textArea = $('#'+this._options.id+'-txt');
			this._defaults._contextMenu = $('#'+this._options.id+'-ctx');
			this._defaults._buttons =  $('#'+this._options.id+'-buttons');
			
			var self = this;
			this._options.buttons.forEach( function( button ){
				var btnIcon = button.icon || '';
				var btnName = button.name || '';
				var btnTitle = button.title || button.name || '';
				var btnClick = button.click || function(){};
							
				self._defaults._buttons.append('<a title="'+btnTitle+'" class="'+NAMESPACE+'-button" >'+button.icon+btnName+'</a>');
				self._defaults._buttons.find('a:last').click( function(event){
					btnClick.apply(this,  [event] );
				});
				
				console.log(button);
			});
			
			//afterCreate callback
			this._options.afterCreate.apply(this,  [this._defaults._wrapper] );
			

			this._attachEvents();
		
			//callback to options afterInit
			this._options.afterInit.apply(this,  [arguments] );
		},
		_update : function(options){
			//console.log(options);
			this._options = $.extend(true, this._options, options); // deep extend
			//console.log(_options);
		},
		_getCode : function( event ){
			return (event.keyCode ? event.keyCode : event.which);
		},
		_getKeyFromEvent  : function( event ){
			var code = this._getCode(event);
			//console.log( code );
			return this._shared.keyboardKeys[code];
		},
		_getModKeys : function( event ){
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
			return mods;
		},
		/*-------------- caret code -------------*/
		_getCaretOffset : function(){
			return this._defaults._textArea.prop("selectionStart");
		},
		_setCaretOffset : function( offset ){
			this._defaults._textArea.focus();
			this._defaults._textArea.prop("selectionStart", offset);
			this._defaults._textArea.prop("selectionEnd", offset);
		},
		_getCaretPosition : function(){
			var el = this._defaults._textArea.get(0);
			var carPos = el.selectionEnd,
				div = document.createElement('div'),
				span = document.createElement('span'),
				copyStyle = getComputedStyle(el),
				pos = {};
				
			[].forEach.call(copyStyle, function(prop){
				div.style[prop] = copyStyle[prop];
			});
			div.style.position = 'absolute';
			document.body.appendChild(div);
			div.textContent = el.value.substr(0, carPos);
			span.textContent = el.value.substr(carPos) || '.';
			div.appendChild(span);
			pos = {
				top : [ span.offsetTop, el.offsetTop - el.scrollTop + span.offsetTop + 14 + 'px'],
				left : [span.offsetLeft, el.offsetLeft - el.scrollLeft + span.offsetLeft + 'px']
			};			
			document.body.removeChild(div);	
			return pos;
		},
		_getTerm : function(){
			var self = this;
			var autoComplete = self._options.autoComplete; //localize
			var contents = self.getContentToCaret();
			var match = contents.match(autoComplete.match);
			//return on no match
			if( !match ){
				return false;
			}
			//error on a match without a capture group
			if( !match[1] ) $.error('ERROR: '+NAMESPACE+' option.autoComplete.match requires a capture group');

			return match[1]; 
		},
		/*
		*@param bool noCall - do not call self._options.autoComplete.search() callback
		*/
		_search : function( noCall ){
			var self = this;
			
			var autoComplete = self._options.autoComplete; //localize

			var term = this._getTerm();
			if( !term ){
				this.hideContext();
				return;
			}
			var lwr_term = term;
			var lwr_cache = autoComplete.cache;
			
			if( autoComplete.caseInsensitive ){
				//lowercase term
				lwr_term = lwr_term.toLowerCase();
				//lowercase cache
				lwr_cache = $.map(lwr_cache, function(value) {
				  return value.toLowerCase();
				});
			}
			
			lwr_cache = $.unique( lwr_cache );
			
//			console.log( lwr_term );
//			console.log( lwr_cache );
			
			var matches = [];
			
			if( !autoComplete.noCache ){
				//check the term
				matches = $.map(lwr_cache, function (word) {
					return word.indexOf(lwr_term) === 0 ? word : null;
				});
			}
			
			var callback = function( matches, cache ){
				if( typeof cache == 'array' ){
					self.setCache( cache );
				}
				

				var html = '';
				if( matches.length ){
					matches.forEach( function(v,i){
						if( ( i + 1 ) > autoComplete.limit) return false;
						var selected = '';
						if( i == 0 ) selected = ' class="active" ';
						html += '<li'+selected+'>'+v+'</li>'+"\n";
					} );
					
					var pos = self._getCaretPosition();
					self.showContext(pos.top[1], pos.left[1], html);
				}else{
					self.hideContext();
				}
			};
			
			if( !noCall ){
				autoComplete.search.apply(this,  [term, matches, callback] );
			}else{
				callback(matches);
			}
		},
		_attachEvents	: function(){
			var self = this;
			//keydown handler
			$('#'+this._options.id).on('keypress', '#'+this._defaults._textArea.prop('id'), function(event){
				var key = self._getKeyFromEvent( event );
				var mods = self._getModKeys( event );
				
				switch( key ){
					case 'backspace':
					case 'delete':
						self.autoSize();
					break;
					case 'enter':
						event.preventDefault();
						if( !self.isContextOpen() ){
							if( mods.shiftKey ){
								//add a return when shift + enter is used
								var offset = self._getCaretOffset();
								self.setContent( self.getContentToCaret( offset )+"\n"+self.getContentFromCaret( offset ));
								self._setCaretOffset(offset+1);
								self.autoSize();			
							}else{
								self.submit();
							}
						}else{
							self.contextSelect( self.getActiveIndex() );
						}
					break;
					case "up":
						event.preventDefault();
						if( self.isContextOpen() ){
							self.contextPrev();
						}
					break;
					case "down":
						event.preventDefault();
						if( self.isContextOpen() ){
							self.contextNext();
						}
					break;
					
				}
			});

			//keyup handler
			$('#'+this._options.id).on('keyup', '#'+this._defaults._textArea.prop('id'), function(event){
				var key = self._getKeyFromEvent( event );
				var mods = self._getModKeys( event );
				
				switch( key ){
					case 'up':
					case 'down':
					case 'enter':
						//prevent these on keyup
						event.preventDefault();
					break;
					default:
						if( self._options.autoComplete ){
							var key = self._getKeyFromEvent( event );
							var content = self.getContentToCaret();
							self._search();
						}
					break;
				}
			});
			
			//hover
			this._defaults._contextMenu.on('mouseenter', 'li', function(event){
				self._defaults._contextMenu.find('li.active').removeClass('active');
				$(this).addClass('active');
			});
			
			//mouse click on menu
			this._defaults._contextMenu.on('mouseup', 'li.active', function(event){
				self.contextSelect( self.getActiveIndex() );
			});
			
			//mouse click on textarea ( move caret )
			this._defaults._textArea.click( function( event ){
				self.hideContext();
			});
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
		/*
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
		},
		/*
		* destroy the plugin instance
		*/
		destroy : function () {
			$('#'+this._options.id).remove();
			this.element.removeData(NAMESPACE);
			return this;
		},
		autoSize : function(){
			if( !this._options.autoResize ) return;
			
			this._defaults._textArea.css('height', 0+'px');
			var height = this._defaults._textArea.prop('scrollHeight') + 20;
			this._defaults._textArea.css('height', height+'px');		
		},
		/*
		* Set the contents of the textarea
		*/
		setContent : function( contents ){
			this._defaults._textArea.val( contents );
		},
		/*
		* Get the full contents of the textarea
		*/
		getContent : function(){
			return this._defaults._textArea.val();
		},
		/*
		* Get the textarea contents before the caret or offset
		* @param int offset - str pos of the caret or false to autodetect
		*/
		getContentToCaret : function( offset ){
			if( !offset ){
				offset = this._getCaretOffset();
			}
			return this.getContent().substring(0, offset) || "";
		},
		/*
		* Get the textarea contents after the caret or offset
		* @param int offset - str pos of the caret or false to autodetect
		*/
		getContentFromCaret : function( offset ){
			if( !offset ){
				offset = this._getCaretOffset();
			}
			return this.getContent().substring(offset) || "";
		},
		isContextOpen : function(){
			return this._defaults._contextMenu.hasClass('active');	
		},
		showContext : function(top, left, html){
			this._defaults._contextMenu.html(html);
			this._defaults._contextMenu.css({
				'top': top,
				'left': left
			});
			this._defaults._contextMenu.addClass('active');
		},
		hideContext : function(){
			this._defaults._contextMenu.html('');
			this._defaults._contextMenu.css({
				'top': '',
				'left': ''
			});
			this._defaults._contextMenu.removeClass('active');	
		},
		getActiveIndex : function(){
			return this._defaults._contextMenu.find('li.active').index();
		},
		contextNext : function(){
			var current = this.getActiveIndex();
			
			this._defaults._contextMenu.find('li.active').removeClass('active');
			
			++current;
			
			var items = this._defaults._contextMenu.find('li');
			if( current >= items.length ){
				current = 0;
			}
			this._defaults._contextMenu.find('li:eq('+current+')').addClass('active');	
		},
		contextPrev : function(){
			var current = this.getActiveIndex();
			
			this._defaults._contextMenu.find('li.active').removeClass('active');
			
			--current;
			
			var items = this._defaults._contextMenu.find('li');
			if( current < 0 ){
				current = items.length - 1;
			}
			this._defaults._contextMenu.find('li:eq('+current+')').addClass('active');
//			console.log(1);
			
		},
		contextSelect : function( index ){
			var selected = this._defaults._contextMenu.find('li:eq('+index+')');
			var strSelected = selected.text();
			var reSelected = this._options.autoComplete.onSelect.apply(this,  [strSelected, selected] );
			
			switch( typeof reSelected ){
				case 'boolean':
					if( !reSelected ){
						return;
					}
				break;
				case 'string':
					strSelected = reSelected;
				break;
			}
			
			var pre = this.getContentToCaret(); //text before caret
			var term = this._getTerm().replace(/[-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"); //regx escape last term before caret
	
			pre = pre.replace(new RegExp( term + '$'), '') + strSelected; //replace last term with selected text

			var post = this.getContentFromCaret(); //text after caret

			this.setContent( pre + post); //set the contents
			
			this._setCaretOffset( pre.length ); //place the caret
			
			this.hideContext();	//hide the context menu
		},
		setCache : function( items ){
			var a = items || [];
//			console.log(a);
			this._options.autoComplete.cache = items;
			
		},
		/*
		* submit the contents of the textarea
		*/
		submit : function(){
			this._options.submit.apply(this,  [this._defaults._wrapper]);
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
				}else if ( instance._options[ methodOrOptions ]  ) {	
					//console.log('CASE: read option value');
					_return = instance._options[ methodOrOptions ];
				}else{
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