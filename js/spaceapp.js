// eo-events
var eoNetServer = "http://eonet.sci.gsfc.nasa.gov/api/v2.1";
var eoNetLimit  = 120;	
var eoNetOffset = 0;
var eoNetGrouping = 6;
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
         //var eoSize = eoNetData.events.size(); 
         var eoSize = 0;
         var eoItem = "<div class='item active'>";
	$.each( eoNetData.events, function( key, event ) {
              eoSize += 1;
              var category = getCategoryData(event);
		 eoItem += "<div class='side-box col-md-4 col-xs-4' style='min-height:170px'><h5>"+category.title+"</h5>"; 
		 eoItem += "<a href='#' data-key="+key+" data-param="+category.param+">";
                 eoItem += "<div style='margin-bottom: 2px;' class='thumbnail'>";  
                 eoItem += "<img src='./images/"+category.image+"' style='height:80px; width:100%'>";
                 eoItem += "</div>";
                 eoItem += "</a>";              

                 eoItem += "<div class='caption small'>";
                 eoItem += "<p class='boxed'>";
                 eoItem += "<span>"+event.title+"</span>";
                 eoItem += "</p>";
                 eoItem += "</div>";

			   
			eoItem +="</div>";
if (eoNetGrouping-1 == key % eoNetGrouping ) {
 //eoItem += "<span>"+key+"/"+eoSize+"</span>"
		        eoItem += "</div>"; // item

		   $( ".eo-events" ).append(eoItem);

                    eoItem = "<div class='item'>";
}

    });
if (eoNetGrouping-1 != (eoSize-1) % eoNetGrouping ) {
eoItem += "</div>";

	$( ".eo-events" ).append(eoItem);
	}


}


function getCategoryData(event)
{
  var image = "unknown.jpg";
  var title = "Unknown";
  var param = ""; 
  {
     var category = event.categories[0];
       if (category.hasOwnProperty('id') && category.hasOwnProperty('title')) 
{
    var title = category.title; 
    switch(category.id) {
    case 6:
        param = "c[va]=82,86";
        image = "drought.jpg";
        break;
    case 7:
        param = "c[nd]=558,563,566,30";
        image = "sandstorm.jpg";
        break;
    case 8:
        param = "c[nd]=90";
        image = "fire.jpg";
        break;
    case 9:
        param = "c[nd]=356,519,520,521,522";
        image = "flood.jpg";
        break;
    case 10:
        param = "c[va]=10,11,12";
        image = "storm.jpg";
        break;
    case 12:
        param = "c[nd]=89";
        image = "volcano.jpg";
        break;
    case 13:
        param = "c[nd]=74";
        image = "color.jpg";
        break;
    case 14:
        param = "c[nd]=309";
        image = "landslide.jpg";
        break;
    case 15:
        param = "c[nd]=637,638,648";
        image = "ice.jpg";
        break;
    case 16:
        param = "c[nd]=298";
        image = "earthquake.jpg";
        break;
    case 17:
        param = "c[nd]=116";
        image = "snow.jpg";
        break;
    case 18:
        param = "c[va]=4,7,5,6";
        image = "extremes.jpg";
        break;
    case 19:
        param ="c[nd]=4";
        image = "manmade.jpg";
        break;
} 

}

  }

  return {
      param: param,
      image: image,
      title: title
      };
}


