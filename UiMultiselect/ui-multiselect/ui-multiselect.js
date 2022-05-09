;( function( $, window, document, undefined ) {
	$.widget( "ui.multiselect", {
		version: "1.0.0",
		body:null, menu:null, searchWrapper:null,
		source:null,
		keyCallback: null,
	    options: {
	    	id				: null,
	    	classes			: null,  //single value, space seperated classes, or array
			width			: 'auto',
			hideElement		: true, //hide the select element - for testing
			hideEmptyOption : true, //hide options with an empty string value - this is usefull when nothing is selected
			loadSrcOnInit	: 'auto', //load the source when initally creating the plugin ( usefull when using fixed data)
			//auto =  load for everything but this.options.source = function
			minLength		: 1,    //min lenth to search on
			delay			: 1300, //keypress delay for searching
			minSearchWidth	: 100,  //minimum with of the search box
			menuHeight		: 300,	//max height of the dropdown menu
			created			: function(){},
	    	open 			: function(event, ui){}, //function ran before opening the menu
	  		close 			: function(event, ui){}, //function ran before closing the menu
	  		source 			: null, //source of the menu data
			clearOnChoose   : true, //clear the text from the search input when an item is chosen
			afterChoose		: function(value, resize, event){},
	  		sort			: function(data, order){ //sort function for data
	  			data = typeof data == 'object' ? [].slice.call(data) : data;
	  			
	  			order = !order || order.toLowerCase() == 'asc' ? -1 : 1;
	 
	  			return data.sort(
	  				function(a,b){ 
	  					
	  					if(typeof a == 'string') a = {label:a, value:a, optgroup:false};
	  					if(typeof b == 'string') b = {label:b, value:b, optgroup:false};
	
						var res = 0;
						if(a.optgroup && b.optgroup){
							res = (b.optgroup).localeCompare(a.optgroup);
						}else if(a.optgroup && !b.optgroup){
							res = 1;
						}else if(b.optgroup && !a.optgroup){
							res = -1;
						}
						
						if(!res){
							a_label = a.label || a.value;
							b_label = b.label || b.value;
							res = (a_label).localeCompare(b_label);
						}
	
						return res * order;
	  				}
	  			);
	  		}
	    },
	    _create: function() {
	    	
	    	if(!this.element.is('select')){
	    		$.error('May only be used on select elements');
	    	}
	    	
	    	if(!this.element.prop('multiple')){
	    		$.error('Select element must have attribute multiple');
	    	}
	
	        this._createBody();
	        this._initSource();

			this._initEvents();
			
			if(this.options.hideElement) this.element.css('display','none');
			
			this.options.created(this);
				
			this.element.data('multiselect', true);
	    },
	    _createBody: function(){
	    	var id = this.options.id ? ' id="'+this.options.id+'"' : '';
	    	
	    	var classes = '';
			if(this.options.classes){
				if( typeof this.options.classes != 'array' ){
					classes = this.options.classes.join(' ');
				}else{
					classes = this.options.classes;
				}
			}
	    	
	    	var html = [
				'<div '+id+' class="ui-widget ui-multiselect '+classes+'" >',
					'<div class="ui-multiselect-selections ui-corner-all ui-widget-content" >',
						'<span class="ui-multiselect-search-wrapper" >',
							'<input type="text" class="ui-multiselect-search" style="border:none;outline:none;margin:0;padding:0"/>',
						'</span>',
						'<div class="clear-fix" ></div>',
					'</div> <!--\.ui-multiselect-selections -->',
					'<div class="ui-multiselect-choices ui-selectmenu-menu ui-front'+(this.options.autoOpen ? ' ui-selectmenu-open' : '' )+'" >',
						'<ul class="ui-menu ui-corner-bottom ui-widget ui-widget-content overflow" ></ul>',
					'</div> <!--\.ui-multiselect-choices -->',
				'</div> <!--\.ui-multiselect -->'
			].join("\n");
			
			this.body = $(html).insertAfter(this.element);
			
			if(this.options.width) this.body.css('width', this.options.width);
			
			
			
			this.menu = this.body.find('.ui-menu');
			this.searchWrapper = this.body.find('.ui-multiselect-search-wrapper');
			
			this.searchWrapper.css('overflow', 'hidden');
	    },
	    /**
		 * 
		 * @param obj el - the $(<option>) you want
		 */
	    _createSelection : function(el, resize){
	    	if(resize == undefined) resize = true;
	    	
	    	if(!this.body.find('.ui-multiselect-selected[data-value="'+el.attr('value')+'"]').length){
		
				var ui_state = 'ui-state-active';
				if(this.element.prop('disabled')){
					ui_state = 'ui-state-disabled';
				}else if(this.element.prop('readonly')){
					ui_state = 'ui-state-readonly';
				}

		    	this.searchWrapper.before([
		    		'<div data-value="'+el.attr('value')+'" class="ui-corner-all ui-multiselect-selected '+ui_state+'">',
		    			el.text(),
		    			'<span class="ui-button-icon ui-icon ui-icon-closethick ui-multiselect-close" title="remove" ></span>',
		    		'</div>'
		    	].join("\n"));
		    	
		    	if(resize) this._resizeSearch();
	    	}
	    }, 
	    /**
		 * 
		 * @param obj el - the $(<option>) you want
		 */
	    _deleteSelection : function(el, resize, event){
	    	if(resize == undefined) resize = true;
	    	
	    	this.body.find('.ui-multiselect-selected[data-value="'+el.attr('value')+'"]').remove();
	    	if(resize) this._resizeSearch();
	    },
	    _createMenu: function(data){
			var self = this;
			
			if(self.options.menuHeight) self.menu.css('max-height', self.options.menuHeight);
	
			//sort the data
	    	data = typeof self.options.sort == 'function' ?  self.options.sort(data) : data;
	
	    	//find the next item in the list to add an element after
	    	var getLastSibling = function(el, selector){
	    		
	    		var siblings = el.nextAll();
	    		var len = siblings.length;
	    		var next;
	    		for(var i=0; i<len; i++){
	    			next = $(siblings[i]);
	    			if(next.hasClass('ui-selectmenu-optgroup')){
	    				if(i==0) return el;
	    				
	    				return next.prev();
	    			}
	    		}
	   
	    		return el;    		
	    	}
	    	
	    	$.each(data, function(i,v){    		
	    		if('' === v.value && self.options.hideEmptyOption) return true; //continue the loop
	    		
	    		var html = [
					'<li class="ui-menu-item" data-value="'+v.value+'" >',
						'<div class="ui-menu-item-wrapper"  >'+v.label+'</div>',
				    '</li>'
			    ].join("\n");
	    		
	    		if(v.optgroup){
					var optclass = v.optgroup;
					optclass = optclass.replace(/[^-0-9a-zA-z_]/g, '');
					
	    			var optgroup = self.menu.find('.optgroup-'+optclass);
	    			
	    			if(!optgroup.length){
	    				self.menu.append('<li class="ui-selectmenu-optgroup ui-menu-divider optgroup-'+optclass+'" >'+v.optgroup+'</li>');
	    				optgroup = self.menu.find('.optgroup-'+optclass);
	    			}
	    			
	    			var sibling = getLastSibling(optgroup, '.ui-menu-item');
	    			//if there is an OPTGroup - add html after last sibling
	    			sibling.after(html);
	    		}else{
	    			var firstOptGroup = self.menu.find('li.ui-selectmenu-optgroup:first');
	    				
	    			if(firstOptGroup.length){
	    				//if this doesn't have an OPTGroup but we have other OPTGroups in the menu - find the first optgroup and add element before it
	    				firstOptGroup.before(html);
	    			}else{
	    				self.menu.append(html);
	    			}
	    		}
	    		
	    		var item = self.menu.find('.ui-menu-item[data-value="'+v.value+'"]');
	    		
	    		if(v.disable){
					item.removeClass('ui-state-active');
					item.addClass('ui-state-disabled');
					return;
	    		}else if(v.readonly){
					item.removeClass('ui-state-active');
					item.addClass('ui-state-readonly');
					return;
				}
	    		
	    		var el = self.element.find('option[value="'+v.value+'"]');
	    		if(!el.length) el = false;
	
	    		if(el && el.is(':selected')){
					item.removeClass('ui-state-active');
					item.addClass('ui-state-disabled');
					self._createSelection(el);	
				}
	    	});

	    	this.searchWrapper.find('.ui-multiselect-loader').remove();
		},
		_deleteMenu : function(){
			this.menu.html('');	
		},
		_createLoader : function(){
			this.searchWrapper.append('<div class="ui-multiselect-loader"> <div></div> <div></div> <div></div> <div></div> </div>');
		},
		/*_setOption: function( key, value ) {
			this._super( key, value );
			if ( key === "source" ) {
				this._initSource();
			}
			if ( key === "appendTo" ) {
				this.menu.element.appendTo( this._appendTo() );
			}
			if ( key === "disabled" && value && this.xhr ) {
				this.xhr.abort();
			}
		},*/
		_initEvents : function(){
			var self = this;
			
			this.body.on('mouseenter', '.ui-menu-item', function(){
				if(!$(this).hasClass('ui-state-disabled') && !$(this).hasClass('ui-state-readonly')) $(this).addClass('ui-state-active');
			});
	
			this.body.on('mouseleave', '.ui-menu-item', function(){
				$(this).removeClass('ui-state-active');
			});
	
			this.body.on('click', '.ui-menu-item', function(event){
				if(self.element.prop('disabled') || self.element.prop('readonly')) return;
				
				self.choose($(this).data('value'), true, event);	
				self.close();
			});	
			
			this.body.on('click', '.ui-multiselect-close', function(event){
				if(self.element.prop('disabled') || self.element.prop('readonly')) return;
				
				self.dismiss($(this).closest('.ui-multiselect-selected').data('value'), true, event);
			});	
			
			this.body.on('click', '.ui-multiselect-selections', function(event){
				if($(event.target).is($(this))){
					self.body.find('.ui-multiselect-search').focus();
				}
			});
			
			this.body.on('keyup', '.ui-multiselect-search', function(event){
				var term = $(this).val();
				if(self.element.prop('disabled') || self.element.prop('readonly') || term.length <= self.options.menLength) return;
	
				clearTimeout(self.keyCallback);
				
				self.keyCallback = setTimeout(function(){
					self.search(term);
					self.open();
				}, self.options.delay);
	
			});
			
			this.element.trigger('change');	
			
			this.body.on('blur', '.ui-multiselect-search', function(event){
				if(!self.menu.is(':hover')) self.close();
			});
			
			this.body.on('focus', '.ui-multiselect-search', function(event){
				if(self.element.prop('disabled') || self.element.prop('readonly')) return;
				
				if(!self.menu.find('.ui-menu-item').length){
					clearTimeout(self.keyCallback);
					
					self.keyCallback = setTimeout(function(){
						self.search(self.searchWrapper.find('.ui-multiselect-search').val());
					}, self.options.delay);
				}else{
					self.open();
				}
	
				
			});
		},
	    _initSource: function() {
	    	var self = this;
	    	/*
	    	 [
	    	 	{
	    	 	 	'label'	   		: label,
	    			'value'	   		: value,
	    			'optgroup' 		: opt_group
	    			'selectAlso' 	: [],
	    			'disabled'		: true
	    	 	}, {...}
	    	 ]
	    	 
	    	 [value, value]
	    	*/	
	    	var src_type = (typeof self.options.source);
	
	    	if(src_type == 'function'){
	    		this.source = self.options.source;   		
	    	}else if(src_type == 'string'){
	    		url = this.options.source;
				this.source = function(search) {
					var data = {};
	        		
	        		if(undefined !== search && null !== search){
	        			data.s = search;
	        		}
					
					$.ajax({
	        			url: "action",
	        			dataType: "json",
	        		        mehtod: "get",
	        		        data: data,
	        		        success: function (response)
	        		        {      		        	
	        		            self.results(response);
	        		        },
							error: function(e)
							{
								self.results([]);
								$.error(e);
							}
	        		});
				};
	    	}else if($.isArray(self.options.source)){
	    		//@todo do for strict arrays ['one','two']  -vs- currently  [{value:foo,title:bar},{...}]
	    		this.source = function(search){
		    		var result = self.options.source;
		    		
		    		if(search && search.length >= self.options.minLength ){
		    			result = $.ui.multiselect.filter(search, result);
		    		}
		    		
		    		self.results(result);
		    	};
	    	}else{
	    		//default source is the html
		    	this.source = function(search){
		    		var result = self.searchSelectOptions(search);	 	    		
		    		self.results(result);
		    	};
	    	}
	    	
	    	var initLoad = this.options.loadSrcOnInit;
	    	if(typeof initLoad == 'string'){
	    		initLoad = initLoad.toLowerCase();
	    		switch(initLoad){
	    			case 'true':
	    				initLoad = true;
	    			break;
	    			case 'false':
	    				initLoad = false;
	    			break;
	    			default:
	    				if($.inArray(src_type,['function','string']) !== -1){
	    					initLoad = false;
	    				}else{
	    					initLoad = true;
	    				}
	    			break;
	    		}
	    	}
	 
	    	if( initLoad && this.source){
	    		this._createLoader();
	    		this.source();
	    	}
		},
		search : function(search){	
	    	if(this.element.prop('disabled') || this.element.prop('readonly')) return;
	    	this._deleteMenu();
	    	this._createLoader();
	
	    	this.source(search);
		},
	    _resizeSearch : function(){
	    	this.searchWrapper.css('margin-top', '');
	    	
			var searchHeight = this.searchWrapper.outerHeight(); 
	    	
	    	//measure without this element - its not as simple as just subtracting the search height from total because
	    	//the search may be on the same line as selected items or not.
			this.searchWrapper.css('display', 'none');
	    	var selectionsHeight = this.body.find('.ui-multiselect-selections').height();
	    	this.searchWrapper.css('display', '');
	    	
	    	var diff = selectionsHeight - searchHeight;
	    	if(diff < 0) diff = 0;
	
	    	//correct for line heights if possible
	    	var sel_height = this.body.find('.ui-multiselect-selected:first').outerHeight(true);
			var lines = sel_height ? Math.floor(diff / sel_height) : 0;
	
	    	diff = sel_height * lines;
	    	this.searchWrapper.css('margin-top', diff+'px');
	    	
	    	if(this.searchWrapper.width() < this.options.minSearchWidth){
	    		diff += sel_height;
	    		this.searchWrapper.css('margin-top', diff+'px');
	    	}
	    	
	    },
		results : function(data){
			this._createMenu(data);
		},
		searchSelectOptions(search){
			var options = this.element.find('option');
			var result = [];
			var opt_group, value;
	
			$(options).each(function(){
				opt_group = $(this).closest('optgroup');
				value = $(this).attr('value');
				
				result.push({
				    'label'	   : $(this).text(),
				    'value'	   : value,
					'optgroup' : opt_group.length ? opt_group.attr('label') : false,
					'selected' : $(this).is(':selected')
				});
			});
			
			if(search && search.length >= this.options.minLength ){
				result = $.ui.multiselect.filter(search, result);
			}
			return result;
		},
		destroy : function(){
			this.body.remove();
		},
		disable : function(disabled){	
			if(disabled){
				this.setState('disabled');	
			}else{
				this.setState('active');
			}
			
		},
		isDisabled : function(){
			return this.element.prop('disabled');
		},
		readonly : function(readonly){	
			if(readonly){
				this.setState('readonly');	
			}else{
				this.setState('active');
			}	
		},
		isReadonly : function(){
			return this.element.prop('readonly');
		},
		setState : function( state ){
			var selections = this.body.find('.ui-multiselect-selected');
			var search_element = this.searchWraper.find('.ui-multiselect-search');
				
			switch(state){
				case 'disabled':
					this.element.prop('readonly', false);
					this.element.prop('disabled', true);
					
					this.body.removeClass('ui-state-active');
					this.body.removeClass('ui-state-readonly');
					this.body.addClass('ui-state-disabled');
					
					selections.removeClass('ui-state-active');
					selections.removeClass('ui-state-readonly');
					selections.addClass('ui-state-disabled');
					
					this.element.prop('readonly', false);
					search_element.prop('disabled', true);
				
				break;
				case 'readonly':
					this.element.prop('readonly', true);
					this.element.prop('disabled', false);
					
					this.body.removeClass('ui-state-active');
					this.body.removeClass('ui-state-disabled');
					this.body.addClass('ui-state-readonly');
					
					selections.removeClass('ui-state-active');
					selections.removeClass('ui-state-disabled');
					selections.addClass('ui-state-readonly');
					
					this.element.prop('readonly', true);
					search_element.prop('disabled', false);
				break;
				case 'active':
				default:
					this.element.prop('readonly', false);
					this.element.prop('disabled', false);
					
					this.body.removeClass('ui-state-disabled');
					this.body.removeClass('ui-state-readonly');
					this.body.addClass('ui-state-active');
					
					selections.removeClass('ui-state-disabled');
					selections.removeClass('ui-state-readonly');
					selections.addClass('ui-state-active');
					
					this.element.prop('readonly', false);
					search_element.prop('disabled', false);
				break;
			}		
		},
		/**
		 * @param string value
		 * @return return object|boolean - return the <option> assocated with a given value or false
		 */
		getOptionElementByValue : function( value ){
			var op = this.element.find('option[value="'+value+'"]');
			
			return op.length ? op : false;
		},
		getElement : function(){
			return this.element;
		},
		/**
		 * 
		 * @param obj el - the $(<option>) you want
		 */
		choose : function(value, resize, event){
			if(resize == undefined) resize = true;
			
			var el = this.element.find('option[value="'+value+'"]');
	
			if(!el.length){
				//if element dosent exist in select - create it (we dont really care if it's in the optgroup or has correct text as it's never seen
				this.element.append('<option value="'+value+'">'+value+'</option>');
				el = this.element.find('option[value="'+value+'"]');
			}
			
			var item = this.menu.find('.ui-menu-item[data-value="'+el.attr('value')+'"]');
			item.removeClass('ui-state-active');
			item.addClass('ui-state-disabled');
			el.prop('selected', true);
			this._createSelection(el);	

			//deselect the empty element if something else is selected
			if(this.element.find('option[value=""]:selected').lenght && this.element.find('option:selected').lenght > 1){
				var em = this.getOptionElementByValue('');
				if(em) em.prop('selected', false);
			}
			
			if(this.options.clearOnChoose) this.searchWrapper.find('.ui-multiselect-search').val('');
			
			this.options.afterChoose.apply(this,  arguments );
		},
		selected : function (selected){
			var self = this;
			var type = typeof selected;
			
			if(type == 'string' ){
				selected = selected.split(",");
			}else if(type == 'number'){
				selected = [selected];
			}
			
			$.each(selected, function(i,v){
				var v_type = typeof v;
				
				switch(v_type){
					case 'string': 
						if(v == '') break;
					case 'number':
						self.choose(v, false);
					break;
					case 'object':
						self.choose(v.value, false);
					break;
				}
			});
			
			this._resizeSearch();
		},
		/**
		 * 
		 * @param obj el - the $(<option>) you want to dismiss
		 */
		dismiss : function(value, resize, event){
	    	if(resize == undefined) resize = true;
	
			var item = this.menu.find('.ui-menu-item[data-value="'+value+'"]');
			item.removeClass('ui-state-active');
			item.removeClass('ui-state-disabled');
			var el = this.getOptionElementByValue(value);
			el.prop('selected', false);
			
			//auto select the empty element if nothing else is selected
			if(!this.element.find(':selected').length){
				var em = this.getOptionElementByValue('');
				if(em) em.prop('selected', true);
			}
			
			this._deleteSelection(el, resize, event);
		},
		dismissAll : function(){
			var self = this;
			
			self.body.find('.ui-multiselect-selected').each(function(){
				self.dismiss($(this).data('value'), false);
			});
			
			this._resizeSearch();
		},
		close : function(){
			this.body.find('.ui-multiselect-choices').removeClass('ui-selectmenu-open');
		},
		open : function(){
			if(this.menu.find('.ui-menu-item').length)
				this.body.find('.ui-multiselect-choices').addClass('ui-selectmenu-open');
		}
	 
	});
	
	$.extend( $.ui.multiselect, {
		escapeRegex: function( value ) {
			return value.replace( /[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&" );
		},
		filter: function( needle, haystack  ) {
			var matcher = new RegExp( '^'+this.escapeRegex( needle ), "i" );
			
			return $.grep( haystack, function( item ) {
	
				if(typeof item == 'object'){
					if(undefined != item.label &&  matcher.test(item.label)) return true;
					if(undefined != item.value &&  matcher.test(item.value)) return true;
					if(undefined != item.optgroup &&  matcher.test(item.optgroup)) return true;
				}else{
					return matcher.test(item);
				}
				
				return false;
			});
		}
	});
} ) ( jQuery, window, document );