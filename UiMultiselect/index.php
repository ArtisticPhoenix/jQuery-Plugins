<!doctype html>
<html>
	<head>
		<link rel="stylesheet" href="jquery-ui/jquery-ui.min.css" />
		<script src="jquery-ui/jquery.js"></script>
		<script src="jquery-ui/jquery-ui.min.js"></script>
		
		<link rel="stylesheet" href="ui-multiselect/ui-multiselect.css" />
		<script src="ui-multiselect/ui-multiselect.js"></script>
		
		<script type="text/javascript">
		 	( function($) {
       	  		$(document).ready(function($){
           	  		$('select[name="foo"]').multiselect(

                   	 );

                 	 $('.ui-multiselect-search').keypress(function(){
						var parent = $(this).closest('span');
						var ruler = $(this).next('span');
						ruler.text($(this).val());
						var width = ruler.width()+10;
						
						if($('.ui-multiselect-selections').width() >= width){
							parent.css('width', width+'px');
						}
                 	 });
       	  		});
		 	})(jQuery);
		</script>
		
		<!--  <link rel="stylesheet" href="chosen/chosen.css" />
		<script src="chosen/chosen.jquery.js"></script> -->
		
		<!--  https://jqueryui.com/autocomplete/ -->
		<!--  https://harvesthq.github.io/chosen/ -->
		
    	<!--  <script>
          $( function() {
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
                    $( "#tags" ).autocomplete({
                       source: availableTags
                    });
        	  });
          } );
    </script> -->
	</head>
	<body>
        <!-- <div class="ui-widget">
          <label for="tags">Tags: </label>
          <input id="tags">
        </div> -->
        
        <select name="foo" multiple="multiple" >
        	<optgroup label="Theropods">
                <option>Tyrannosaurus</option>
                <option>Velociraptor</option>
                <option>Deinonychus</option>
            </optgroup>
            <optgroup label="Sauropods">
                <option>Diplodocus</option>
                <option>Saltasaurus</option>
                <option>Apatosaurus</option>
            </optgroup>
        </select>
        
        <div class="ui-widget ui-multiselect">
        	<div class="ui-multiselect-selections ui-corner-all ui-widget-content" >
                <div class="ui-corner-all ui-state-active ui-multiselect-selected" >Tyrannosaurus<span class="ui-button-icon ui-icon ui-icon-closethick ui-multiselect-close"></span></div>
                <div class="ui-corner-all ui-state-active ui-multiselect-selected" >Velociraptor<span class="ui-button-icon ui-icon ui-icon-closethick ui-multiselect-close"></span></div>
                <div class="ui-corner-all ui-state-active ui-multiselect-selected" >Deinonychus<span class="ui-button-icon ui-icon ui-icon-closethick ui-multiselect-close"></span></div>
                <span><input type="text" class="ui-multiselect-search" /><span style="display:none;"></span></span>
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
        
	</body>
</html>