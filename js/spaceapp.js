// eo-events
var eoNetServer = "http://eonet.sci.gsfc.nasa.gov/api/v2.1";
var eoNetLimit  = 100;	
var eoNetOffset = 0;
var eoNetData = null;

$(document).ready(function() {
   	loadEoNetEvents("closed");	
});

function loadEoNetEvents(mode) {
    $.getJSON( eoNetServer + "/events", {
        status: mode,
        limit: eoNetLimit
        })
    .done(function( data ) {	
        eoNetData = data;
        redrawEoNetEvents(0);		
    });
}




function redrawEoNetEvents(offset) {
	
	 $( ".eo-events" ).html('');
	$('.e2o-events').slick({
  infinite: true,
  slidesToShow: 3,
  slidesToScroll: 3
});
	
	$.each( eoNetData.events, function( key, event ) {
		var eoItem = "<div class='side-box col-md-1' ><h5>"+event.title+"</h5>" +
		           
 //<a role="" class="" href="http://eonet.sci.gsfc.nasa.gov/">
 //  <div style="min-height: 175px" class="thumbnail">
 //   <img alt="..." src="/tambora-dev/images/showroom/nasa/nasa.png" class="mydesktop-icon">
 //  </div>
 //</a>
 //<div class="caption">
 // <p class="boxed">
 //   <b>Natural Events</b>
 //<br/>curated by Nasa out of Imagery in Near Real Time
 // </p>
 //</div>

				   
			"</div>";		 
		//$('.eo-events').slick('slickAdd',eoItem);
		   $( ".eo-events" ).append(eoItem);

    });
	
	


}



