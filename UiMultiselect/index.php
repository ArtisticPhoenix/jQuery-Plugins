<?php shell_exec('php C:\UniServerZ\www\SCSS\index.php  --config="C:\UniserverZ\www\jQuery-Plugins\UiMultiselect\ui-multiselect\scss\scss-config.php"') ?>
<?php 

copy('C:\UniserverZ\www\DataEditor\public\js\ui-multiselect\ui-multiselect.js', __DIR__.'/ui-multiselect/ui-multiselect.js');


?>



<!doctype html>
<html>
	<head>
		<link rel="stylesheet" href="jquery-ui/jquery-ui.min.css" />
		<script src="jquery-ui/jquery.js"></script>
		<script src="jquery-ui/jquery-ui.min.js"></script>
		
		<link rel="stylesheet" href="ui-multiselect/ui-multiselect.css" />
		<script src="ui-multiselect/ui-multiselect.js"></script>
		
		<link rel="stylesheet" href="chosen/chosen.css" />
		<script src="chosen/chosen.jquery.js"></script>
		
		<script type="text/javascript">
		 	( function($) {
       	  		$(document).ready(function($){
                    var availableTags = [
                      "ActionScript",
                      "AppleScript",
                      "Asp",
                      "BASIC",
                      "C",
                      "C++",
                      "Clojure",
                      "COBOL",
                      "ColdFusion",
                      "Erlang",
                      "Fortran",
                      "Groovy",
                      "Haskell",
                      "Java",
                      "JavaScript",
                      "Lisp",
                      "Perl",
                      "PHP",
                      "Python",
                      "Ruby",
                      "Scala",
                      "Scheme"
                    ];
           	  		
           	  		$('select[name="foo"]').multiselect({
           	  			width : '300px'
           	  		});

               	 	/*$('select[name="bar"]').multiselect({
           	  			width : '300px',
               	  		source : [
               	  		    {'label' : 'Pick one', 'value' : ''},
               	  		    {'label' : 'Tyrannosaurus', 'value' : 'tyrannosaurus', 'optgroup' : 'Theropods'},
               	  		    {'label' : 'Velociraptor', 'value' : 'velociraptor', 'optgroup' : 'Theropods'},
               	  		    {'label' : 'Diplodocus', 'value' : 'diplodocus', 'optgroup' : 'Sauropods'},
               	  		    {'label' : 'Apatosaurus', 'value' : 'apatosaurus', 'optgroup' : 'Sauropods'},
               	  		    {'label' : 'Deinonychus', 'value' : 'deinonychus', 'optgroup' : 'Theropods', 'selected' : true},
               	  		    {'label' : 'Saltasaurus', 'value' : 'saltasaurus', 'optgroup' : 'Sauropods'}
               	  		]
           	  		});*/

           	  		

           	  	$('select[name="biz"]').multiselect({
               	  	width : '300px',
                    source : function (search){
                        var self = this;
                        var data;

						setTimeout(function(){
							var data = [
    							{'label' : 'Pick one', 'value' : ''},
                   	  		    {'label' : 'Tyrannosaurus', 'value' : 'tyrannosaurus', 'optgroup' : 'Theropods'},
                   	  		    {'label' : 'Velociraptor', 'value' : 'velociraptor', 'optgroup' : 'Theropods'},
                   	  		    {'label' : 'Diplodocus', 'value' : 'diplodocus', 'optgroup' : 'Sauropods'},
                   	  		    {'label' : 'Apatosaurus', 'value' : 'apatosaurus', 'optgroup' : 'Sauropods'},
                   	  		    {'label' : 'Deinonychus', 'value' : 'deinonychus', 'optgroup' : 'Theropods', 'selected' : true},
                   	  		    {'label' : 'Saltasaurus', 'value' : 'saltasaurus', 'optgroup' : 'Sauropods'}
                   	  		 ]

               	  		 	self.results(data);
               	  		 	
						},500);
						return false;
                    }
                  });

           	  		/*$('select[name="bar"]').chosen({
						width : '400px'
           	  		});

           	  		//size fixer
                 	 /*$('.ui-multiselect-ruler').css('font', $('.ui-multiselect-search').css('font'));

                 	 $('.ui-multiselect-search').keypress(function(){
						var parent = $(this).closest('.ui-multiselect-search-wrapper');
						var ruler = $(this).next('.ui-multiselect-ruler');
						ruler.text($(this).val());
						var width = ruler.width()+10;
						console.log(width);
						console.log($('.ui-multiselect-selections').width());
						if($('.ui-multiselect-selections').width()-10 >= width){
							parent.css('width', width+'px');
						}
                 	 });*/

                      $( "#tags" ).autocomplete({
                    	open : function(event, ui){
                        	console.log('---------------- open ------------------');
                  			console.log(event);
                  			console.log(ui);
                  		},
                  		close : function(event, ui){
                        	console.log('---------------- close ------------------');
                  			console.log(event);
                  			console.log(ui);
                  		},
                  		destroy : function (event, ui) {
                        	console.log('---------------- destroy ------------------');
                  			console.log(event);
                  			console.log(ui);
                  		},
                  		disable : function(event, ui){
                        	console.log('---------------- disable ------------------');
                  			console.log(event);
                  			console.log(ui);
                  		},
                  		enable : function(event, ui){
                        	console.log('---------------- enable ------------------');
                  			console.log(event);
                  			console.log(ui);
                  		},
                  		search : function(event, ui){
                        	console.log('---------------- search ------------------');
                  			console.log(event);
                  			console.log(ui);
                  		},
                  		select : function(event, ui){
                        	console.log('---------------- select ------------------');
                  			console.log(event);
                  			console.log(ui);
                  		},
                  		source : function(term, ui){
                        	console.log('---------------- source ------------------');
                  			console.log(event);
                  			console.log(ui);
                  			return availableTags;
                  		}

                         
                      });
       	  		});
		 	})(jQuery);
		</script>
		

		
		<!--  https://jqueryui.com/autocomplete/ -->
		<!--  https://harvesthq.github.io/chosen/ -->
		

	</head>
	<body>

        <div class="ui-widget">
          <label for="tags">Tags: </label>
          <input id="tags">
        </div>
        
         <hr/>
        
        <select name="foo" multiple="multiple" >
        	<option value="" >Pick one</option>

                <option value="tyrannosaurus" >Tyrannosaurus</option>
                <option value="velociraptor">Velociraptor</option>
                <option value="deinonychus">Deinonychus</option>

            <optgroup label="Sauropods">
                <option value="diplodocus">Diplodocus</option>
                <option value="saltasaurus">Saltasaurus</option>
                <option value="apatosaurus" selected="selected" >Apatosaurus</option>
            </optgroup>   
        </select>
        
        <hr style="margin-bottom: 200px;" />
        
        <select name="bar" multiple="multiple" ></select>
        
        <hr style="margin-bottom: 200px;" />
        
        <select name="biz" multiple="multiple" >
        	  
        </select>
        
        <!-- 
        <select name="bar" multiple="multiple" >
        	<optgroup label="Theropods">
                <option value="Tyrannosaurus" >Tyrannosaurus</option>
                <option value="Velociraptor">Velociraptor</option>
                <option value="Deinonychus">Deinonychus</option>
            </optgroup>
            <optgroup label="Sauropods">
                <option value="Diplodocus">Diplodocus</option>
                <option value="Saltasaurus">Saltasaurus</option>
                <option value="Apatosaurus">Apatosaurus</option>
            </optgroup>
        </select>
        
        <hr/>
        
        <div style="width:400px" >
        <div class="ui-widget ui-multiselect">
        	<div class="ui-multiselect-selections ui-corner-all ui-widget-content" >
                <div class="ui-corner-all ui-state-active ui-multiselect-selected" >Tyrannosaurus<span class="ui-button-icon ui-icon ui-icon-closethick ui-multiselect-close"></span></div>
                <div class="ui-corner-all ui-state-active ui-multiselect-selected" >Velociraptor<span class="ui-button-icon ui-icon ui-icon-closethick ui-multiselect-close"></span></div>
                <div class="ui-corner-all ui-state-active ui-multiselect-selected" >Deinonychus<span class="ui-button-icon ui-icon ui-icon-closethick ui-multiselect-close"></span></div>
                <div class="ui-corner-all ui-state-active ui-multiselect-selected" >Deinonychus<span class="ui-button-icon ui-icon ui-icon-closethick ui-multiselect-close"></span></div>
                <span class="ui-multiselect-search-wrapper" ><input type="text" class="ui-multiselect-search" /><span class="ui-multiselect-ruler" ></span></span>
                <div class="clear-fix" ></div>
            </div>
        	<div class="ui-multiselect-choices ui-selectmenu-menu ui-selectmenu-open" >
                <ul class="ui-menu ui-corner-bottom ui-widget ui-widget-content" >
                	<li class="ui-selectmenu-optgroup ui-menu-divider" >Theropods</li>
                    <li class="ui-menu-item" ><div class="ui-menu-item-wrapper ui-state-active" >Tyrannosaurus</div></li>
                    <li class="ui-menu-item" ><div class="ui-menu-item-wrapper" >Velociraptor</div></li>
                    <li class="ui-menu-item" ><div class="ui-menu-item-wrapper" >Deinonychus</div></li>

                    <li class="ui-selectmenu-optgroup ui-menu-divider" >Sauropods</li>
                    <li class="ui-menu-item" ><div class="ui-menu-item-wrapper" >Diplodocus</div></li>
                    <li class="ui-menu-item" ><div class="ui-menu-item-wrapper" >Saltasaurus</div></li>
                    <li class="ui-menu-item" ><div class="ui-menu-item-wrapper" >Apatosaurus</div></li>
                </ul>
            </div>
        </div>
        </div>
        
        -->
	</body>
</html>