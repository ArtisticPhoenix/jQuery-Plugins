
//http://jshint.com/
/*
@todo sincronize mapValues to the ui better, events chains?
*/
(function($){
	 "use strict";
	/* Don't forget to name the plugin here */
	var NAMESPACE = 'jQpagerToolbar';

	var Plugin = function ( target, methodOrOptions) {
		/**
		* back reference to jQuery object
		*/
		this.element = $(target);

		if( !this.element.is('div') ){
			throw NAMESPACE + ' can only be assigned to div tags ';
		}
		
		//var self = this;
		/**
		* public option collection, accessible outside of this instance by $(target).pluginName({param:value}); (not shared across multiple plugin instances)
		* options can be set on _init or during runtime
		*/
		this._options = {
			/**
			*	because we use .apply( this, .. ) scope resolution,
			*	it's premissible to use this to refer to the plugin within callback
			*/
			/*also fires an jQpagerToolbar.beforeInit event on the plugin wrapper element*/
			beforeInit		: function( args ){},
			/*also fires an jQpagerToolbar.afterInit event on the plugin wrapper element*/
			afterInit		: function( args ){},
	//		clone			: false, // a selector to clone this plugin for, for example $('.foo').jQpager({clone:'.foo'}), this clone the html for performance
			/* width default is px or supply it as text such as '100%' `'500px' */
			width			: false,
			/* wrappers font size, because we use em for sizes, simply change this to alter the size of the toolbar :) */
			fontSize 		: 24,
			/* applies to the text-align css of the wapper, inline-block will ceter, left, or right align the toolbar */
			align			: 'center',
			/* list of classes to apply to the main top level html ( not the wrapper ) */
			classes 		: 'ui-widget-header ui-corner-all',
			/* jQuery element for the main top level html ( not the wrapper ) */
			element			: false,
			/* parsed url as obj */
			urlParams		: {},
			/* a url to map to instead of window.location ( current page url ) useful for ajax */
			url				: false,
			/* allows for remaping of the url query parameters, these values should be unique within the urlMap object */
			urlMap			: {
				currentPage		: 'currentPage',	//current page
				sortIndex		: 'sortIndex',		//sort column
				sortOrder		: 'sortOrder',		//sort order
				rowsPerPage		: 'rowsPerPage',	//rows shown per page
				totalRows		: 'totalRows' 		//total number of records
			},
			/**
			* used internally for ease of access to the values that are mapped, 
			* @example ~ assume currentPage is mapped to page in urlMap
			* [ 'page', 'sortIndex', ... ] ~ because Object.values() has limited support, and we cant $.inArray() we need to store this
			* for performance reasons we can do this only when update is called
			*/
			_mappedValues 	:	[],
			/* url mapped values, -note- this will overide init { options } */
			currentPage		: 1,		//current page
			sortIndex		: '',		//sort column
			sortOrder		: 'asc',	//sort order [asc,desc]
			rowsPerPage		: 25,		//rows shown per page
			totalRows		: 0, 		//total number of records @todo: allow this to be an array or object for slicing

			sortFields		: [],
			totalPages		: 0, /*calculated based of totalRows / rowsPerPage */
			/* called whenever the plugins UI is used ( clicking button etc.)  also fires an jQpagerToolbar.onCallback event on the plugin wrapper element unless this function returns false */
			callback 		: function(item, value){},
			/* rows to show per page */
			maxRowsPerPage	: 200,
			rowsPerPageStep	: 25,
			rowsPerPageTemplate	: '[i] Rows',
			/**
			*  [optional] - otherwise required, [type] - applies to these types
			* Items {
			*	ID { - used in data-id, and in combination of the wrapper id for the element id  [parentID]-ID, name when required
			*  			id must be unique per instance, not per DOM
			*		@param string type - type of item [input_button,input_text,input_select] 
			*		@param string title [optional] - title attribue for the tag ( help text )
			*		@param mixed icon - 
			*			string [input_button, input_select] - the FontAwesome icon minus the 'fa-' prefix
			*			object [input_button]- for toggle button support @todo add support for select
			*				example {
			*						value : {
			*							icon : icon,
			*							value : value, -value to set on click 
			*							title : title [optional]
			*						}, value : { .. } } 
			*				requires the use of a mapValue for state change, if item.value is set it will have no effect
			*		@param string placeholder [optional][input_text] - template with [param] values you can use '.' for array access
			*			placeholder is always shown on blur, swaps back to value on focus
			*		@param string mapValue [optional in most cases] - values are mapped to a _options.* param, and can use ''param.one' array accessor
			*				it is permissible to also use the urlMap names for these, or to set custom _options.params
			*				input_button - it makes no sense to use this for value ( the click value would always be the same as mapValue ),
			*							instead value is appled to mapValue param when clicked
			*				input_select - applied to the option that is selected, and updated when option is clicked
			*				input_text - input valu appled to mapValue on change
			*		@param array bindTo - additonal change binds  NAMESPACE.change.* - these events are triggered on the inner plugin wrapper
			*		@param string value [optional] - set value, you cannot use mapValue in conjuction with this on [input_select, input_text]
			*				input_button - as described above this type uses the value to set the mapValue param, [--] and [++] can be used as value
			*					to decrement and increment, such as the previous and next buttons.  you can also doubleMap the value by
			*					including map:param, as the value where param is the _options.* param as mapValue would ( used for last )
			*		@param array options -  [ input_select ] 
			*			array is used to populate the options,
			*			for ease of use arrays are structured like this [  ['value','text'], ['value','text'] ]
			*		@param object classes [optional]-
			*					base :
			*					state*:
			*		@param object iconClasses [optional][ input_select ]
			*					base :
			*					state*:
			*		@param function callback - function( item ){ triggered with scope resolution for this }
			*				returning false from the callback prevents the onCallback event from firing
			*		@param string before / after - add this item before or after another item ( value should be the item key  _options.items.{key} or item.ID )
			*				obviously the item must exist in the DOM for this to work correctly
			*			------------------- below are added by plugin, no need to supply them, they are for ease of access ----------------
			*		@param string ID  - ( added by the plugin ) _options.items.{key} 
			*		@param string selector - ( added by the plugin )  items selector ( plugin_wrapper ID + item.ID)
			*		@param jQuery Object - object created in the DOM for the item
			*
			*	}
			* }
			*/
			itemClass  :  NAMESPACE+'-item', //Class to apply to all items main element
			items		: {
				first : {
					_init		: 	function( plugin ){ 
						//this.bind( )
						$(this).bind('jQpagerToolbar.change.currentPage', function(event, plugin, index){
							if( plugin._options.currentPage <= 1 ){
								//console.log( 'setState:disabled');
								plugin.setItemState($(this), 'disabled');
								$(this).data('disabled', true);
							}else{
								//console.log( 'setState:default');
								plugin.setItemState($(this), 'default');
								$(this).data('disabled', false);
							}
						});
					},
					type		:	'input_button',
					title		: 	'First Page',
					icon		:	'angle-double-left',
					mapValue	:   'page',
					value		:	'1',
					classes		: 	{
						base : 'ui-corner-left'
					}
					//callback 		: function(item){},
					//element : added after creating
					//selector : added after creating
				},
				previous : {
					_init		: 	function( plugin ){ 
						 this.bind('jQpagerToolbar.change.currentPage', function(event, plugin, index){
							if( plugin._options.currentPage  <= 1 ){
								plugin.setItemState($(this), 'disabled');
								$(this).data('disabled', true);
							}else{
								plugin.setItemState($(this), 'default');
								$(this).data('disabled', false);
							}
						 });
					},
					type		:	'input_button',
					title		: 	'Previous Page',
					icon		:	'angle-left',
					mapValue	:   'currentPage',
					value		:	'--'
				},
				pageText : {
					_init		: 	function( plugin ){ },
					type		:	'input_text',
					title		: 	'Enter a page to jump to',
					placeholder	: 	'Showing Page [currentPage] of [totalPages]', //placeholder text false to ignore placeholder	
					mapValue	:   'currentPage',
					bindTo		:	['totalPages']
				},
				rowSelect : {
					_init		: 	function( plugin ){
						 this.bind('jQpagerToolbar.change.rowsPerPage', function(event, plugin, index){
							 plugin.caculateTotalPages();
						 });
						
					},
					type		:	'input_select',
					title		: 	'Select number of rows per page',
					icon		:	'angle-down',
					options		: 	function( item ){ 
										var max = this._options.maxRowsPerPage;
										var step = this._options.rowsPerPageStep ;
										var template = this._options.rowsPerPageTemplate;
										var options = [];
										
										for( var i = step; i <= max; i += step ){
											var option = [];
											option.push(i);
											option.push(template.replace(/\[i\]/, i));
											options.push(option);
										}
										
										return options;
									},
					mapValue	:   'rowsPerPage'
					//@todo upage totalPages
				},
				sortSelect : {
					_init		: 	function( plugin ){},
					type		:	'input_select',
					title		: 	'Select sort field',
					icon		:	'angle-down',
					options		: 	function( item ){ return this._options.sortFields; },
					mapValue	:   'sortIndex'
				},
				sortOrder : {
					_init		: 	function( plugin ){
						if( plugin._options.sortFields.length === 0){
							$(this).css('display', 'none');
						}
					},
					type		:	'input_button',
					title		: 	'Sort Order',
					icon		: 	{
								asc	: {
									icon : 'sort-alpha-asc',
									title : 'Click to Sort Descending',
									value : 'desc'
								},
								desc : {
									icon : 'sort-alpha-desc',
									title : 'Click to Sort Ascending',
									value : 'asc'
								}
					},
					mapValue	:   'sortOrder'
				},
				next : {
					_init		: 	function( plugin ){ 
						 this.bind('jQpagerToolbar.change.currentPage jQpagerToolbar.change.totalPages', function(event, plugin, index){
							if( parseInt( plugin.getParam('currentPage') ) >= parseInt( plugin.getParam('totalPages') ) ){
//								console.log( plugin.getParam('currentPage')+' >= '+plugin.getParam('totalPages') );
								plugin.setItemState($(this), 'disabled');
								$(this).data('disabled', true);
							}else{
								plugin.setItemState($(this), 'default');
								$(this).data('disabled', false);
							}
						 });
					},
					type		:	'input_button',
					title		: 	'Next Page',
					icon		:	'angle-right',
					mapValue	:   'currentPage',
					value		:	'++',
					bindTo		:	['totalPages']
				},
				last : {
					_init		: 	function( plugin ){ 
						 this.bind('jQpagerToolbar.change.currentPage jQpagerToolbar.change.totalPages', function(event, plugin, index){
							if( parseInt( plugin.getParam('currentPage') ) >= parseInt( plugin.getParam('totalPages') ) ){
								plugin.setItemState($(this), 'disabled');
								$(this).data('disabled', true);
							}else{
								plugin.setItemState($(this), 'default');
								$(this).data('disabled', false);
							}
						 });
					},
					type		:	'input_button',
					title		: 	'Last Page',
					icon		:	'angle-double-right',
					classes		: 	{ base : 'ui-corner-left' },
					mapValue	:   'currentPage',
					value		:	'map:totalPages',
					bindTo		:	['totalPages']
				}
			},
			/*
			* types should corispond to the types in items, this is for per-type configuration
			* types.classes is appended to items.classes
			*
			*/
			types	: {
				input_button : {
					classes		:	{
						base 			: 'ui-widget-header',
						stateDefault 	: false,
						stateHover		: 'ui-state-hover',
						stateActive		: false,
						stateDisabled	: 'ui-state-disabled'
					}
				},
				/*
				* event change is fired when input_select is changed, or when input_button is a toggle button
					@example
						$('#one-rowSelect').change( function( event, data ){
							console.log( data );
						});
				*/
				input_select :	{
					classes		:	{
						base 			: 'ui-widget-content',
						stateDefault 	: '',
						stateHover		: 'ui-state-hover',
						stateActive		: false,
						stateDisabled	: false
					},
					iconClasses	:	{
						base 			: 'ui-widget-header',
						stateDefault 	: false,
						stateHover		: 'ui-state-hover',
						stateActive		: false,
						stateDisabled	: 'ui-state-disabled'
					}
				},
				input_text	:	{
					classes		:	{
						base 			: 'ui-widget-content',
						stateDefault 	: false,
						stateHover		: false,
						stateActive		: false,
						stateDisabled	: false
					}
				}
			},
			buttons : {/* just like items .. seprate so we can position them, which requires items to be created first */}
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
	Plugin.prototype._defaults = {};

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
			
			this.element.trigger(
				NAMESPACE+'.beforeInit', 
				[this, arguments]
			);

			//map url values to the options in urlMap
			this.element.css({
				'font-size'		: this._options.fontSize,
				'text-align'	: this._options.align
			});
			
			this._create_plugin();
			

			
			this._map_values_from_url(this._options.url);
			
//			console.log(this.element);

			//callback to options afterInit
			this._options.afterInit.apply(this,  [arguments] );
			this.element.trigger(
				NAMESPACE+'.afterInit', 
				[this, arguments]
			);
		},
		/**
		* this is the private part of the options function
		*/
		_update : function(options){
			this._options = $.extend(true, this._options, options); // deep extend

			if( options.hasOwnProperty( 'width' )){
				//if width was supplied in the options update it.
				this.element.find('.'+NAMESPACE).css('width', this._options.width);
			}

			if( options.hasOwnProperty( 'urlMap' )){
				//if urlMap was supplied in options update our _mappedValues array
				this._options._mappedValues = []; //reset
				for( var index in this._options.urlMap){
					if( this._options.urlMap.hasOwnProperty( index ) ){
						var value = this._options.urlMap[index];
						if($.inArray(value, this._options._mappedValues) != -1 ){
							throw 'urlMap values must be unique, duplicate:'+value;
						}
						this._options._mappedValues.push(value);
					}
				}
			}
			
		},
		/**
		* convert a mapped name to its orignal
		*/
		_convert_from_url_map_name : function( index ){
			var i = $.inArray(index ,this._options._mappedValues);
			if(  i != -1 ){
				//look through mapUrl for value
				//index = this._options._mappedValues[i];
				for( var key in this._options.urlMap ){
					if(this._options.urlMap[key].toLowerCase() == index.toLowerCase() ){
						index = key;
						break;
					}
				}
			}
			return index;
		},
		/**
		* convert a mappable name to its mapped name
		*/
		_convert_to_url_map_name : function( index ){
			if(  this._options.urlMap.hasOwnProperty( index ) ){
				return this._options.urlMap[index];
			}
			return index;
		},		
		/**
		* create plugin html!
		*/
		_create_plugin : function(){
			var classes = this._options.hasOwnProperty('classes') ? this._options.classes +' ' : '';
			classes += NAMESPACE;
			
			var ID = this.element.prop('id') ? this.element.prop('id')+'-'+NAMESPACE : this.element.uniqueId()+'-'+NAMESPACE;
			this.element.append('<div id="'+ID+'" class="'+classes+'" ></div>'); //add the plugin inner wrapper
	
			/* set the plugin inner wrapper element now that its added to the DOM */
			this._options.element = this.element.find('>div:first');
			//this.element is the outerwrapper in the page when plug is init
			//this._options.element  is the inner wrapper we just added above.
			
			for( var item_id in this._options.items){
				if( this._options.items.hasOwnProperty( item_id ) ){
					this._add_item( item_id, this._options.items[item_id] );
				}
			}
			
			/** plugin or global binds **/
			//close open selects when clicking outside of them
			$(document).on('mouseup.'+this._options.itemClass, function( event ){
				var inside = true;
				try{
					if( $(event.target).closest( '.jQpagerToolbar-input_select').find('dd' ).filter(':visible').length === 0 ){
						inside = false;
					} 
				}catch( e ) {
					//target is html, or false etc..
					inside = false;
				}
				if(!inside){
					$( '.jQpagerToolbar-input_select dd' ).filter(':visible').css('display', 'none');
				}
			});
		},
		/**
		* create an item
		* @param string item id - this is the key : { ... } of the item, here for convience
		* @param object item - the item object from _opotions
		*/	
		_add_item : function( item_id, item ){	
			/*switch( item_id ){
				case 'sortSelect':
				case 'sortOrder':
					if( !this._options.sortFields || (  typeof this._options.sortFields == 'object' && this._options.sortFields.length === 0) ){
						return;
					}
				break;
			}*/
			
			item.ID = item_id;

			switch( item.type ){
				case 'input_text' :
					//this._options.element.append(  );
					this._add_to_DOM( this._generate_input_text( item_id, item ), item );
				break;
				case 'input_select' :
					//this._options.element.append( this._generate_input_select( item_id, item ) );
					this._add_to_DOM( this._generate_input_select( item_id, item ), item );
					item.element.css('width', item.element.find('dd').width());
					if( item.element.find('dd > div').size() === 0){
						item.element.css('display', 'none');
					}
				break;
				case 'input_button' :
					//this._options.element.append( this._generate_input_button( item_id, item ) );
					this._add_to_DOM( this._generate_input_button( item_id, item ), item );
				break;
			}
			
			item.selector = '#'+item.element.prop('id');
			
			/* events for this item */
			this._bind_events( item );
			
			if( item.hasOwnProperty('_init') && typeof item._init == 'function' ){
				item._init.apply(item.element,  [this] );
			}
		},
		_add_to_DOM : function( html, item ){
			var target;
			if( item.hasOwnProperty('before') && this._options.items.hasOwnProperty( item.before ) && this._options.items[item.before].hasOwnProperty( 'element' )){
				this._options.items[item.before].element.before( html );
				item.element = this._options.items[item.after].element.prev('.'+this._options.itemClass).last();				
			}else if( item.hasOwnProperty('after') && this._options.items.hasOwnProperty( item.after ) && this._options.items[item.after].hasOwnProperty( 'element' )){
				this._options.items[item.after].element.after( html );
				item.element = this._options.items[item.after].element.next('.'+this._options.itemClass).last();
			}else{
				this._options.element.append( html );
				item.element = this._options.element.find('.'+this._options.itemClass).last();
			}
		},
		/**
		* create an input type html
		* @param string item id - this is the key : { ... } of the item, here for convience
		* @param object item - the item object from _opotions
		*/
		_generate_input_text : function(item_id, item){
			var html = [];
			var ID = this.element.prop('id')+'-'+item_id;
			
			var classes = this._options.itemClass+' '+NAMESPACE +'-'+item.type+' ';
			classes += this._generate_classes( item, 'base' );
			classes += this._generate_classes( item, 'stateDefault' );

			var placeholder = '';
			var has_placeholder = false;
			if(item.hasOwnProperty('placeholder')){
				placeholder += 'data-placeholder="'+item.placeholder+'" ';
				has_placeholder = true;
			}else{
				placeholder = 'data-placeholder="false" ';
			}
			
			var value = '';
			var real_value = '';
			var mapto = '';

			if(item.hasOwnProperty('mapValue')){
				real_value = this.getParam( item.mapValue, true, item.mapValue );
				var mapIndex = this._convert_from_url_map_name( item.mapValue );
				mapto = 'data-mapto="'+mapIndex+'" '; //used to map trigger state changes to this item
				mapto += 'data-'+mapIndex+'="true" ';
			}else if(item.hasOwnProperty('value')){
				real_value = item.value;
			}
			
			if( item.hasOwnProperty( 'bindTo' )){
				var len = item.bindTo.length;
				for( var i = 0; i < len; i++){
					mapto += 'data-'+item.bindTo[i]+'="true" ';	
				}
			}
			
			if( has_placeholder ){
				value += 'data-value="'+real_value+'" ';
				value += 'value="" ';
			}else{
				value += 'data-value="false" ';
				value += 'value="'+real_value+'" ';
			}
			
			var title = '';
			if(item.hasOwnProperty('title')){
				title='title="'+item.title+'" ';
			}
			
			html.push('<input id="'+ID+'" class="'+classes+'" name="'+item_id+'" type="text" data-id="'+item_id+'" '+value+placeholder+title+mapto+'/>');
			
			return html.join("\n");
		},
		/**
		* create a select type html
		* @param string item id - this is the key : { ... } of the item, here for convience
		* @param object item - the item object from _opotions
		*/
		_generate_input_select : function(item_id, item){
			if(!item.hasOwnProperty('options')){
				throw 'item.options is required for item '+item_id;
			}
			
			var html = [];
			var ID = this.element.prop('id')+'-'+item_id;
			
			/* value */
			var _value = false;
			var mapto = '';
			
			if(item.hasOwnProperty('mapValue')){
				_value = this.getParam( item.mapValue );
				var mapIndex = this._convert_from_url_map_name( item.mapValue );
				mapto = 'data-mapto="'+mapIndex+'" '; //used to map trigger state changes to this item
				mapto += 'data-'+mapIndex+'="true" ';
			}else if(item.hasOwnProperty('value')){
				_value = item.value;
			}
			
			if( item.hasOwnProperty( 'bindTo' )){
				var len = item.bindTo.length;
				for( var i = 0; i < len; i++){
					mapto += 'data-'+item.bindTo[i]+'="true" ';	
				}
			}
			
			/* options*/
			var options;
			var options_type = typeof item.options;
			if( options_type == 'object' ){
				options = item.options;	
			}else if(options_type == 'function' ){
				options = item.options.apply( this, [item] );
				if( typeof options != 'object' ){
					throw 'item.options callback function for item '+item_id+'must return an object or an array';
				}
			}else{
				throw 'item.options for item '+item_id+'must be an object, array or a function';
			}

			var title = '';
			if(item.hasOwnProperty('title')){
				title='title="'+item.title+'" ';
			}
			if(!item.hasOwnProperty('name')){
				item.name = item_id;
			}
			
			var classes = '';
			classes += this._generate_classes( item, 'base' );
			classes += this._generate_classes( item, 'stateDefault' );
			
			var iconClasses = this._generate_classes( item, 'stateDefault', 'iconClasses' );
			iconClasses += this._generate_classes( item, 'base', 'iconClasses' );

			html.push('<dl id="'+ID+'" class="'+this._options.itemClass+' '+NAMESPACE +'-'+item.type+'" data-id="'+item_id+'" '+mapto+'>');
				html.push('<dt>');
					html.push('<i class="fa fa-'+item.icon+' '+iconClasses+'">&nbsp;</i>');
					if( options.length ){
						html.push('<div data-value="'+options[0][0]+'" id="'+ID+'-label" class="'+classes+'" >'+options[0][1]+'</div>');
					}else{
						html.push('<div data-value="" id="'+ID+'-label" class="'+classes+'" ></div>');
					}
				html.push('</dt>');
				html.push('<dd class="'+classes+'" >');
				
				html.push( this._generate_select_options( options ) );
				
				html.push('</dd>');
			html.push('</dl>');

			return html.join("\n");
		},
		/**
		* create the options html for the select
		* @param array options - [ [value, text], [value, text ] ]
		*/
		_generate_select_options : function( options ){
			var html = [];
			var options_length = options.length;

			for(var i = 0; i < options_length; ++i){
				html.push("\t"+'<div data-value="'+options[i][0].toString()+'" >'+options[i][1].toString()+'</div>');
			}
			return html.join("\n");
		},
		/**
		* create a button type html
		* @param string item id - this is the key : { ... } of the item, here for convience
		* @param object item - the item object from _opotions
		*/
		_generate_input_button : function(item_id, item){
			var html = [];
			var ID = this.element.prop('id')+'-'+item_id;
			//item generic class and item specific class
			var classes = this._options.itemClass+' '+NAMESPACE +'-'+item.type+' ';
			classes += this._generate_classes( item, 'base' );
			classes += this._generate_classes( item, 'stateDefault' );

			var title = '';
			if(item.hasOwnProperty('title')){
				title='title="'+item.title+'" ';
			}
			
			var icon = '';
			var value = 'false';
			var mapto = '';
			
			if( item.hasOwnProperty( 'mapValue' )){
				var mapIndex = this._convert_from_url_map_name( item.mapValue );
				mapto = 'data-mapto="'+mapIndex+'" '; //used to trigger state changes
				mapto += 'data-'+mapIndex+'="true" ';
			}
			
			if( item.hasOwnProperty( 'bindTo' )){
				var len = item.bindTo.length;
				for( var i = 0; i < len; i++){
					mapto += 'data-'+item.bindTo[i]+'="true" ';	
				}
			}
			
			if( typeof item.icon == 'object' ){
				if( !item.hasOwnProperty( 'mapValue' )){
					throw 'The use of toggle [icon object] requires item.mapValue is set';
				}
				var currentValue = this.getParam( item.mapValue );
				if( item.icon.hasOwnProperty( currentValue ) ){
					var mapIcon = item.icon[currentValue];
					icon = mapIcon.icon;
					if(!mapIcon.hasOwnProperty('value')){
						throw 'The use of toggle [icon object] requires icon[currentValue].value is set';
					}
					value = mapIcon.value;
					
					if(mapIcon.hasOwnProperty('title')){
						title='title="'+mapIcon.title+'" ';
					}
				}else{
					throw 'The use of toggle input_button [icon object] requires mapValue['+currentValue+'] keys in the icon object';				
				}
			}else{
				if(item.hasOwnProperty('value')){
					value = item.value;
				}
				
				icon = item.icon;
			}
				
			html.push('<div id="'+ID+'" class="'+classes+'" data-id="'+item_id+'" data-value="'+value+'" '+title+mapto+'>');
				html.push('<i class="fa fa-'+icon+'">&nbsp;</i>');
			html.push('</div>');
			
			return html.join("\n");
		},
		/**
		* @todo update this for hover state change etc.
		* @param item - the item object from _options
		* @param state - the state [base|stateDefault|stateHover|stateActive|stateDisabled]
		*/		
		_generate_classes : function( item, state, class_key ){
			if( !state ){
				state = 'stateDefault';
			}
			if( !class_key ){
				class_key = 'classes';
			}
			
			var conf = this.getItemConf( item );

			var classes =  (conf[class_key ] && conf[class_key][state]) ? ' '+conf[class_key][state] : '';
			classes += (item[class_key ] && item[class_key][state]) ? ' '+item[class_key][state] : '';
			return classes;
		},
		/**
		* same as above except this gets all classes except this state
		*/
		_generate_anti_classes : function( item, state, class_key ){
			if( !state ){
				state = 'stateDefault';
			}
			if( !class_key ){
				class_key = 'classes';
			}
			
			var conf = this.getItemConf( item );
			
			var classTypes = conf[class_key];
			
			var antiClasses = [];
			
			for( var confState in classTypes ){
        if( classTypes.hasOwnProperty( confState ) ){
          if( confState == 'base' || confState == state ){
            continue;
          }
          if( classTypes[confState] ){
            
            antiClasses.push( classTypes[confState] );
          }
        }
			}
			return (antiClasses.length > 0 )?antiClasses.join(' '): '';
		},
		/**
		* bind events
		* @todo update this per item, then we can bind  to  - this.bind('jQpagerToolbar.change.sortIndex
		*
		*/
		_bind_events : function(item){
			
			var data = {
				plugin : this,
				item	: item,
				conf : this._options.types[item.type]
			};
	
			switch( item.type ){
				case 'input_text':
					this._bind_input_text( data );
					this._bind_change_sync( data );
				break;
				case 'input_select':
					this._bind_input_select( data );
					this._bind_input_options( data );
					this._bind_change_sync( data );
				break;
				case 'input_button':
					this._bind_input_button( data );
					this._bind_change_sync( data );
				break;	
			}
		},
		/**
		* @param object data - event data { plugin :... , item:...	conf:... }
		*/
		_bind_input_text : function( data ){

			this._options.element.on({
				focus : function( event ){
					if( $(this).data('placeholder') ){
						$(this).val( $(this).data('value') ).select();
					}
				}, blur : function( event ){
					if( $(this).data('placeholder') ){
						$(this).data('value', $(this).val() );
						$(this).val( '' );
					}
				},change : function( event ){
					var plugin = event.data.plugin;
					var element = $(this);
					plugin.setTextValue( element, element.val() );
				}
			}, data.item.selector, data );				
		},
		_bind_input_select : function( data ){

			/* icno hover event */
			this._options.element.on({
				mouseenter : function( event ){
					var plugin = event.data.plugin;
					plugin.setItemState( $(this), 'stateHover' );
				},mouseleave : function( event ){
					var plugin = event.data.plugin;
					plugin.setItemState( $(this), 'stateDefault' );
				}
			}, data.item.selector+' > dt > i', data );

			/*  close when select is changed the select wrapper */
			this._options.element.on({
				change : function(event){
					$(this).find('dd').css('display', 'none');
				}
			}, data.item.selector );

			/*  toggle dropdowns on the DT */
			this._options.element.on({
				click : function( event ){					
					$(this).parent().find('dd').toggle(); /* @todo allow animate this 	*/
				}
			}, data.item.selector+' dt ', data );
		},
		_bind_input_options : function( data ){
			/* hover and Click on the DD > DIV  */
			this._options.element.on({
				mouseenter : function( event ){
					var plugin = event.data.plugin;
					plugin.setItemState( $(this), 'stateHover' );
				},mouseleave : function( event ){
					var plugin = event.data.plugin;
					plugin.setItemState( $(this), 'stateDefault' );
				},click	:	function( event ){
					var plugin = event.data.plugin;
					var element = $(this).closest('dl');
					plugin.setSelectValue( element, $(this).data('value') );
					$(this).closest('dd').css('display', 'none');
				}
			}, data.item.selector+' dd > div ', data );
			
		},
		_bind_input_button : function( data ){
			this._options.element.on({
				mouseenter : function( event ){
					if( !$(this).data('disabled') ){
						var plugin = event.data.plugin;
						plugin.setItemState( $(this), 'stateHover' );
					}
				},mouseleave : function( event ){
					if( !$(this).data('disabled') ){
						var plugin = event.data.plugin;
						plugin.setItemState( $(this), 'default' );
					}
				},click	:	function( event ){
					if( !$(this).data('disabled') ){
						var plugin = event.data.plugin;
						var element = $(this);
						var value = element.data('value');
						plugin.setButtonValue( element, value );
					}
				}
			}, data.item.selector, data );					
		},
		_bind_change_sync : function( data ){
			var changeBind = [];
			if( data.item.hasOwnProperty('bindTo') ){
				changeBind = [data.item.bindTo];
			}
			if( data.item.hasOwnProperty('mapValue') ){
				changeBind.push( data.item.mapValue);
			}
			var bind_len = changeBind.length;
			
			for( var i = 0; i < bind_len; i++ ){
//				console.log( data.item.element.data('id')+' bind: '+changeBind[i] );
				data.item.element.bind(NAMESPACE+'.change.'+changeBind[i], function(event, plugin, index, value){
					//update when currentPage is changed or totalpages syncInputText
//					console.log('caught: '+index+' change event with v: '+value );
					plugin.sync( $(this), index, value );
				});	
			}
		},
		/**
		* Parse and map a url ( or object ) to the plugins urlParams
		* @param string url - [optional] a url to map from
		* @param Object params - [optional] an obj to map to the url  ( array query params should be  {key[] : value, key1[] : [ value1, value2 ] })
		*/
		_map_values_from_url : function( url, params ){
			if( typeof params == 'undefined' ){
				if( typeof url == 'undefined'){
					url = this._options.url;
					if( !url ){
						url = window.location.href;
					}
				}
				params = this._unserialize_url( url );
			}


			//console.log( this._options.urlParams );
			this._options.urlParams = $.extend(true, this._options.urlParams, params);
			//console.log( this._options.urlParams );
			
			
			
			var events = [];
			//mearge values for mapped url params to top level actions
			for( var realIndex in this._options.urlMap ){
				//get the keys from url map
				if( this._options.urlMap.hasOwnProperty( realIndex ) ){
					var urlIndex = this._options.urlMap[realIndex];
					//value is the key in the url
					if( this._options.urlParams.hasOwnProperty( urlIndex ) ){
						//set the plugin param ( key in url map ) to the url param ( value in url map )
						this._options[realIndex] = this._options.urlParams[ urlIndex ];					
						events.push( realIndex );
					}
				}
			}
		
			var len = events.length;
			for( var i = 0; i<len; i++){
				this.triggerChangeEvent(events[i]);
			}	
			
			this.caculateTotalPages();
		},
		/**
		* @
		*/
		_map_values_to_url : function( url, exclude ){
			if( typeof url == 'undefined' ){
				url = this._options.url;
			}
			if( typeof exclude == 'undefined' || typeof exclude != 'object' ){
				exclude = [];
			}
			
			if( !this._options.urlParams ){
				//console.log( this._options.urlParams );
				this._options.urlParams = this._unserialize_url( url );
				//console.log( this._options.urlParams );
			}
			
			//console.log( this._options.urlParams );
			
			//mearge values for mapped url params to urlParams
			for( var index in this._options.urlMap ){
				if( this._options.urlMap.hasOwnProperty( index ) && $.inArray(index, exclude) == -1 ){
					var value = this._options.urlMap[index];
					//console.log( value +'::'+this._options[index]);
					this._options.urlParams[value] = this._options[index];
					//console.log( this._options.urlParams );
				}
			}
			//console.log( this._options.urlParams );
			return this._options.urlParams;
		},
		/**
		* Convert an object to a url with query params
		* @param Object params - [optional] an obj to map to the url  ( array query params should be  {key[] : value, key1[] : [ value1, value2 ] })
		* @param string url - [optional] a url to map to
		* @param Array exclude - list of url params to ignore ( obj params to not include in the url string )
		*/
		_serialize_url : function( obj, url, exclude ) {
			if( typeof obj == 'undefined' ){
				obj = this._options.urlParams;
			}
			if( typeof url == 'undefined' ){
				url = this._options.url;
			}
			if( !url ){
				url = window.location.href;
			}
			
			if( typeof exclude == 'undefined' || typeof exclude != 'object' ){
				exclude = [];
			}

			var query = [];
			var v;

			for(var index in obj) {
				if (obj.hasOwnProperty(index) && $.inArray( index, exclude) == -1){					
					if( typeof obj[index] == 'object' ){
						var l = obj[index].length;
						for( var i =0; i<l; i++){
							v = index + '=' +  encodeURIComponent(obj[index][i]);
							query.push( v  );
						}
					}else{
						v = index + '=' +  encodeURIComponent(obj[index]);
						query.push( v  );
					}
				}
//				console.log( v );
			}
			
			var a = url.split('?')[0]+'?'+query.join('&');

			return a;
		},
		/**
		* for our purposes we wont worry about all the hash type url mess ( for eg. url?param[key]=value& )
		*  these will just be unserialized as  { 'param[key]' : value } or  'param[key]' : [value,value] } in the case of duplicates
		*/
		_unserialize_url : function( url ) {
			if( typeof url == 'undefined' ){
				url = this._options.url;
			}
			
			if( !url ){
				url = window.location.href;
			}
			
			var query = url.split('?');
			
			if( query.length == 1 ){
				return {};
			}
			var map   = {},
			decode = function (v) { return decodeURIComponent(v).replace(/\+/g, " "); },
			i,
			a,
			k,
			l;
			
			query = query[1].split('&');
			for( i in query ){
				a = query[i].split('=');
				l = a.len;
				k = a[0];			
				
				if( a == 1 ){
					map[k] = ''
				}else{
					if(map.hasOwnProperty(k)){
						if( typeof map[k] != 'object' ){
							map[k] = [ map[k] ];
						}
						map[k].push( decode(a[1]) );
					}else{
						map[k] = decode(a[1]);
					}	
					
				}	
			}
			return map;
		}, _triggerCallback : function(item, value){
			
			if( false !== this._options.callback.apply(this,  [item, value] ) ){
				this.element.trigger(NAMESPACE+'.onCallback', [this, item, value] );
			}
		}, _triggerItemCallback : function( element, item ){
			if( item.hasOwnProperty('callback') && typeof item.callback == 'function' ){
				if( false !== item.callback.apply(this,  [ item ] ) ){
					element.trigger(NAMESPACE+'.onCallback', [this, item ] );
				}
			}
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
			return this;
		},
		/**
		* destroy the plugin instance - removes its html
		*/
		destroy : function () {
			this.element.removeData(NAMESPACE); //remove the data-NAMESPACE 
			this.element.html('');  //remove the html we added
			this.element.removeUniqueId();
			return this;
		},
		/**
		* hide the pager - hides the inner plugin wrapper - ie the one added by the plugin
		*/
		hide : function(){
			this._options.element.css('display' , 'none' );
			return this;
		},
		/**
		* show the pager - hides the inner plugin wrapper - ie the one added by the plugin
		*/
		show : function(){
			this._options.element.css('display' , '' );
			return this;
		},
		/**
		*
		* @param string index - the _options. to update ( currently only works on top level params )
		* @param mixed value - the value to set
		*/
		setParam : function( index, value, silentChange, silent ){
			if( typeof silentChange == 'undefined') {
				silentChange == false;
			}
			var realIndex = this._convert_from_url_map_name(index);
			if( this._options.hasOwnProperty( realIndex ) ){
				this._options[realIndex] = value;
				
//				console.log( this._options[realIndex] );
//				console.log( realIndex );
				
				if( realIndex == 'totalRows' || realIndex == 'totalPages' || realIndex == 'rowsPerPage' ){
					this.caculateTotalPages( silentChange );
				}else if( !silentChange ){
					this.triggerChangeEvent( realIndex );
				}
						
			}else if( !silent ){
				throw 'Unknown param '+index;
			}
			return this;
		},
		/**
		* get a value from the _options object
		* @param mixed params - an array of nested params ['top','middle','bottom'] or a string selector such as 'top.middle.bottom'
		* @param boolean silent - false to throw errors for undefined params
		* @param mixed defultValue - a value to return when paramm is undefined ( with silent=true )
		* @return mixed - the value of the param
		*/
		getParam : function( selector, silent, defaultValue ){
			var self = this;
			if(!defaultValue){
				//muh default is a keyword
				defaultValue = '';
			}
			
			if( typeof selector === 'string'){
				selector = selector.split('.');
			}

			var value = self._options;
			var checked = [];
			var error = false;
			var i = 0;
			$.each(selector, function(index, param){
				++i;
				checked.push(param);
				if( value.hasOwnProperty( param )){
					value = value[param];
				}else if( checked.length == 1 ){
					
					param = self._convert_from_url_map_name(param);
					if( value.hasOwnProperty( param )){
						value = value[param];
					}else{
						error = true;
					}
				}else{
					error = true;	
				}
				
				if( error ){
					if( !silent ){
						throw checked.join('.') +' is undefined in ' + NAMESPACE;
					}
					return defaultValue;
				}
			});

			return value;	
		}, 
		/**
		* get the _options.types[item.type] config
		* @param object item - the _options.item
		* @param boolean silent - silence excptions
		* @return bool|object - false on falure or the config on success
		*/
		getItemConf : function( item, silent ){
			if( this._options.types.hasOwnProperty( item.type ) ) {
				return this._options.types[ item.type ];
			}else if( !silent ){
				throw 'Could not find item type:'+item.type;
			}
			return false;
		},
		/**
		* sync is fired whenever a ui item that is mapped is changed ( set[type]Vallue(), or when the url is mapped to the plugin mapValuesFromUrl()
		*
		* @param jQuery Object element - the DOM element
		* @param string index - the param to sysnc can be a mapped name
		* @param mixed value - the value to set
		* @param boolean silent - silence excptions
		*/
		sync : function( element, index, silent ){

			
			var item = this._options.items[element.data('id')];
			switch( item.type ){
				case 'input_text':
//					console.log('syncInputText: '+element.data('id')+' v:'+value );
					this.syncInputText( item, index, silent );
				break;
				case 'input_select':
//					console.log('syncInputText: '+element.data('id')+' v:'+value );
					this.syncInputSelect( item, index, silent );
				break;
				case 'input_button':
//					console.log('syncInputText: '+element.data('id')+' v:'+value );
					this.syncInputButton( item, index, silent );
				break;		
			}
			return this;
		},
		/**
		* Sync item_text types
		* @param item - the item
		* @param string value - the value to use for the update
		* @param boolean silent - throw error when value is not present in options
		*/
		syncInputText : function ( item, index, silent ){	
			var realIndex = this._convert_from_url_map_name( index );
			if( item.hasOwnProperty('mapValue') &&
				( item.element.attr( 'data-'+index ) || item.element.attr( 'data-'+realIndex ))
			){
				var data_placeHolder = item.element.data('placeholder');
				if( data_placeHolder ){
					item.element.data('value', this.getParam( item.mapValue ));
					item.element.attr('placeholder', this.parseParamTemplate(item.element.data('placeholder') ));
				}else{
					item.element.val( this.getParam( item.mapValue ));
				}		
			}
			return this;
		},
		/**
		*  Sync item_select types - select value from the options - ie. update the DT labels text and value
		* @param item - the item
		* @param string value - the value to use for the update
		* @param boolean silent - throw error when value is not present in options
		*/
		syncInputSelect : function( item, index, silent ){
			var realIndex = this._convert_from_url_map_name( index );
			if( item.hasOwnProperty('mapValue') &&
				( item.element.attr( 'data-'+index ) || item.element.attr( 'data-'+realIndex ))
			){
				
				var value = this.getParam( item.mapValue );
				var label = item.element.find('>dt>div');
				if( label.data('value') != value ){
					var options = item.element.find('>dd>div');
					var notFound = true;
					$.each(options, function(i,v){
						//$(this) the options scope - this is the value of the option not the item
						var data_value = $(this).data('value');
						if( data_value ==  value ){
							label.data('value', data_value);
							label.text( $(this).text() );
							notFound = false; //false to escape $.each
						}				
						return notFound; //exit each loop
					});
					
					if( notFound && !silent ){
						throw 'could not find value '+value+' for select item #'+item.element.prop('id');
					}
				}
			}
			return this;	
		},
		/**
		* Sync item_button types
		* @param item - the item
		* @param string value - the value to use for the update
		* @param boolean silent - throw error when value is not present in icon keys
		*/
		syncInputButton : function ( item, index, silent ){
			var realIndex = this._convert_from_url_map_name( index );
			
			//only change icon[object] type ( toggle buttons ) and only if they have index as their mapValue
			if( typeof item.icon == 'object' &&
				(	item.hasOwnProperty('mapValue') &&
					(  item.mapValue == index  || item.mapValue == realIndex )
				)
			){
				if( this._options.hasOwnProperty( realIndex ) ){
					var value = this._options[realIndex];
					if( item.icon.hasOwnProperty( value ) ){
						var newIcon = item.icon[value];
						var iconElement = item.element.find('i');
						if( !iconElement.hasClass( newIcon.icon ) ){
							//remove any fa-* classes
							iconElement.attr('class', function(i,c){
								return c.replace(/fa-[^\s]+/, '');
							});
							iconElement.addClass( 'fa-'+newIcon.icon );
							item.element.data('value', newIcon.value );
							if(newIcon.hasOwnProperty('title')){
								item.element.attr('title', newIcon.title);
							}
						}
					}else{
						throw 'The use of toggle input_button [icon object] requires key['+value+'] in the icon object';
					}
				}else{
					throw 'unknown options index '+realIndex;
				}
			}	
			return this;
		},
		/**
		* get an item givin its element
		*/
		getItem : function( element ){
			var itemID = element.data('id');
			if( this._options.items.hasOwnProperty(itemID) ){
				return this._options.items[itemID];
			}
			return false;
			
		},
		/**
		* get an element given its item
		*/
		getElement : function( item ){
			return item.element;
		},
		/**
		* parse a string for template tags such as 
		* [param] or [param.inner.deeper], will map to urlMap custom params too
		*
		*/
		parseParamTemplate : function( content ){
			var self = this;
			
			return content.replace(/\[\s*([a-zA-Z][a-zA-Z\_\.]*)?\s*\]/g, function (match) {
				var key = match.replace(/^\[\s*|\s*\]$/g, ''); //remove the brackets [ ] from the param
				
				
				var value = self.getParam( key, true, '#'+match+'#' );  //# # to indicate default value
				if( value == '#'+match+'#'){
					value = match;
				}else{
					var value_type = typeof value;
					value = value.toString();
					if( $.inArray(value_type, ['string','number','boolean']) == -1){
						value = '['+value+']';
					}
				}
				return value;
			});
		},
		/**
		* trigger a state change on an element
		*/
		setItemState : function(element, state){
			//normalize ie.. stateDefault and default
			if(!state.match(/^state/)){
				state = 'state' + state.replace(/^[a-z]/, function(match){ return match.toUpperCase();});
			}
			
			var itemElement = element;
			
			if( !itemElement.hasClass( this._options.itemClass ) ){
				itemElement = element.closest( "."+this._options.itemClass );
			}
			
			var item = this.getItem( itemElement );
			if( !item ){
				throw 'could not find item for item '+element.prop('nodeName');
			}			
			
			var addClasses = '';
			var removeClasses = '';
			
			switch( item.type ){
				case 'input_button':
				case 'input_text':
					addClasses = this._generate_classes( item, state );
					removeClasses = this._generate_anti_classes( item, state );
					itemElement.addClass( addClasses );
					itemElement.removeClass( removeClasses );
				break;
				case 'input_select':
					if( element.is('i') ){
						addClasses = this._generate_classes( item, state, 'iconClasses' );
						removeClasses = this._generate_anti_classes( item, state, 'iconClasses' );						
					}else{
						addClasses = this._generate_classes( item, state );
						removeClasses = this._generate_anti_classes( item, state );
					}
					element.addClass( addClasses );
					element.removeClass( removeClasses );
				break;
			}

		},
		/*
		*  calculate the total pages
		*/
		caculateTotalPages : function(  silentChange ){
			if( typeof silentChange == 'undefined') {
				silentChange == false;
			}
			var rowsPerPage = parseInt( this._options.rowsPerPage );
			var totalRows = parseInt( this._options.totalRows );
			if( isNaN(rowsPerPage) ){
				throw 'Rows Per Page is NaN';
			}
			if( isNaN(totalRows) ){
				throw 'Total Rows is NaN';
			}

			var totalpages = this._options.totalpages;
			var _totalpages;
			
			if( totalRows > 0 ){
				_totalpages =  Math.ceil( totalRows / rowsPerPage );
			}else{
				_totalpages = 0;
			}

			
			if(_totalpages != totalpages){
				this._options.totalPages = _totalpages;
				if(!silentChange){
					this.triggerChangeEvent('totalPages');	
				}					
				
				if(this._options.totalPages <= this._options.currentPage ){
					this._options.currentPage = this._options.totalPages > 0 ? this._options.totalPages : 1; 
//					console.log( this._options.totalPages +' < '+ this._options.currentPage);
					if(!silentChange){
						this.triggerChangeEvent('currentPage');
					}
				}/*else if( this._options.currentPage == 0 && this._options.totalPages > 0 ){
					this._options.currentPage = 1;
					this.triggerChangeEvent('currentPage');
				}*/
			}
			
			return this;
		},
		/*
		*  return the value of total pages
		*/
		getTotalPages : function(){
			return this._options.totalpages;
			/**/
		},
		/**
		* set params to reflect url values
		* @todo update UI componates
		* @todo: update this to take url as an argument
		*/
		mapValuesFromUrl : function( url ){
//			console.log(JSON.parse(JSON.stringify(this._options.urlParams)));
			/* always unSerializ the url here */
			var obj = this._unserialize_url( url );	
//			console.log(JSON.parse(JSON.stringify(this._options.urlParams)));			
			this._map_values_from_url( false, obj );
//			console.log(JSON.parse(JSON.stringify(this._options.urlParams)));		
			return this;
		},
		mapValuesFromParams : function( urlParams ){
//				console.log(JSON.parse(JSON.stringify(this._options.urlParams)));		
			this._map_values_from_url( false, urlParams );
//				console.log(JSON.parse(JSON.stringify(this._options.urlParams)));		
		},
		/**
		* get a url string based off the current url and our internal params
		* @todo: update this to take url as an argument
		*/
		mapValuesToUrl : function( url, exclude ){	
//				console.log(JSON.parse(JSON.stringify(this._options.urlParams)));		
			var obj = this._map_values_to_url( url, exclude );	
//				console.log(JSON.parse(JSON.stringify(this._options.urlParams)));			
			var a = this._serialize_url( obj, url, exclude );
//				console.log(JSON.parse(JSON.stringify(this._options.urlParams)));		
			return a;
		},
		/**
		* return an url based off an object - does not alter the state of the plugin
		* @todo: update this to take url as an argument
		*/	
		serializeUrl : function(obj, url, exclude ){
//				console.log(JSON.parse(JSON.stringify(this._options.urlParams)));		
			var a = this._serialize_url( obj, url, exclude  );
//				console.log(JSON.parse(JSON.stringify(this._options.urlParams)));		
			return a;
		},
		/**
		* parse an object from the url - does not alter the state of the plugin
		* @todo: update this to take url as an argument
		*/
		unSerializeUrl : function( url ){
//				console.log(JSON.parse(JSON.stringify(this._options.urlParams)));		
			var a = this._unserialize_url( url );
//				console.log(JSON.parse(JSON.stringify(this._options.urlParams)));		
			return a;
		},
		/**	
		* set the url - usefull for ajax paging
		* @param object stateObj - save in the history
		* @param string - title of the page
		*/
		pushHistoryState : function(url, stateObj, title, exclude){
			if( !exclude ){
				exclude = [];
			}

			var current_url = window.location.href;
//				console.log(JSON.parse(JSON.stringify(this._options.urlParams)));		
			var query = this.mapValuesToUrl(url, exclude);
			
			if( current_url != query){
				//dont change the current url if its the same
				history.pushState(stateObj, title, query);
			}
//				console.log(JSON.parse(JSON.stringify(this._options.urlParams)));		
			return this;
		},
		/**
		* set the url - usefull for ajax paging
		* @param object stateObj - save in the history
		* @param string - title of the page
		*/
		replaceHistoryState : function(url, stateObj, title, exclude){
			if( !exclude ){
				exclude = [];
			}
//				console.log(JSON.parse(JSON.stringify(this._options.urlParams)));		
			var query = this.mapValuesToUrl(url, exclude);
			history.replaceState(stateObj, title, query);
///				console.log(JSON.parse(JSON.stringify(this._options.urlParams)));		
			return this;
		},
		/**
		*
		*
		*
		* triggers the namespaced change event on:
		* jQpagerToolbar.change.[index]
		*
		*/
		triggerChangeEvent : function( index ){		
			var realIndex = this._convert_from_url_map_name( index );
			var item_selector = '.'+this._options.itemClass+'[data-'+realIndex+']';
			var event = NAMESPACE+'.change.'+realIndex;
			
//			console.log( 'trigger: '+item_selector+'event '+event);
			
			//trigger on the items
			this.element.find(item_selector).trigger(
				event,
				[this, realIndex]
			);
			
			//console.log( 'trigger: '+this._options.element.prop('id')+'event '+event);
			
			//trigger on the plugin internal wrapper
			this._options.element.trigger(
				NAMESPACE+'.change.'+realIndex, 
				[this, realIndex]
			);
				
		},
		/**
		* change an items value without triggering the callback function, will still sync the UI via change events
		*
		*
		*/
		setItemValue : function( item, value ){
			if( item.hasOwnProperty('mapValue')){
				var mapIndex = item.mapValue;
				var realIndex = this._convert_from_url_map_name( mapIndex );
				var resValue = value;
				
				if( item.hasOwnProperty('mapValue') ){
					var mapIndex = item.mapValue;
					var mappedValue = this.getParam( mapIndex );
					if( value == '--'){
						resValue = parseInt( mappedValue); //convert back to number
						if( !isNaN(resValue) ){
							--resValue;
						}else{
							is_nan = true;
						}
					}else if( value == '++'){
						resValue = parseInt( mappedValue );  //convert back to number
						if( !isNaN(resValue) ){
							++resValue;
						}else{
							is_nan = true;
						}
					}else if( value.substr(0, 4) == 'map:' ){
						resValue = this.getParam( value.substr(4) );
					}	
				}

				if( this._options.hasOwnProperty( realIndex ) ){
					this._options[realIndex] = resValue;
				}	
				//trigger update on each item for this mapValue @todo consoldate this to a single funtion
				this.triggerChangeEvent(realIndex);
			}
			
			return this;
		},
		/**
		* set the value of an input_text and update stuff
		*/
		setTextValue : function(element, value ){
			var itemID = element.data('id');
			var item = this._options.items[itemID];
			
			if( typeof value != 'undefined' ){
				if(!this._options.items.hasOwnProperty( itemID ) ){
					throw 'could not find item #'+element.prop('id');
				}

				this.setItemValue( item, value);

				element.val(value); //insure this is set when programaticaly setting the value
				
				this._triggerCallback( item, value );
			}
			
			this._triggerItemCallback( element, item );
			// --- do not trigger change on this element it's an input so we use the change to get here
			return this;
		},
		/**
		* set the value of an input_select and update stuff
		*/
		setSelectValue : function( element, value, silent ){
			var itemID = element.data('id');
			var item = this._options.items[itemID];
			
			if( typeof value != 'undefined' ){
				
				if(!this._options.items.hasOwnProperty( itemID ) ){
					throw 'could not find item #'+element.prop('id');
				}
				
				var label = element.find( 'dt > div' );
				value = value.toString();
				
				var currentValue = label.data('value').toString();
				
				if( currentValue != value ){
					this.setItemValue( item, value);
					this._triggerCallback( item, value );
				}
				
			}			
			
			this._triggerItemCallback( element, item );
			
			return this;
		},
		/**
		* set the value of an input_button and update stuff
		*/
		setButtonValue : function(element, value ){
			var itemID = element.data('id');
			var item = this._options.items[itemID];
			
			if( typeof value != 'undefined' ){
				//convert to string for consistancy
				value = value.toString();

				if(!this._options.items.hasOwnProperty( itemID ) ){
					throw 'could not find item #'+element.prop('id');
				}

				this.setItemValue( item, value);
				this._triggerCallback( item, value );
			}

			this._triggerItemCallback( element, item );
			
			return this;
		},
		addItem : function( item ){
			//@todo
			
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
					throw  'Plugin must be initialised before using method: ' + methodOrOptions ;
				}
			}else{			
				if( typeof methodOrOptions === 'string' && methodOrOptions.charAt(0) == '_' && instance[ methodOrOptions ]){
					//a little hack to get private protection on methods
					throw  NAMESPACE + ' Method ' + methodOrOptions + ' is private!' ;
				}else if ( typeof methodOrOptions === 'object' || !methodOrOptions ) {
					//instance._update.call(instance, methodOrOptions);
				}else if (instance[ methodOrOptions ] && typeof( instance[ methodOrOptions ] ) == 'function' ) {
					_return = instance[ methodOrOptions ].apply(instance,  Array.prototype.slice.call(args, 1 ) ); 
				}else {
					throw  'Method ' + methodOrOptions + ' does not exist.' ;
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