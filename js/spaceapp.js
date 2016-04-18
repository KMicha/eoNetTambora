// eo-events
var eoNetServer = "http://eonet.sci.gsfc.nasa.gov/api/v2.1";
var eoNetLimit  = 1200;	
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
		processEoNetEvents();
        redrawEoNetEvents();	
        addEventsToGlobe(eoNetData.events);		
    });
}


function processEoNetEvents() {
		$.each( eoNetData.events, function( key, event ) {
        var category = getCategoryData(event);
		eoNetData.events[key].type = category.title;
		eoNetData.events[key].color = category.color;
		eoNetData.events[key].param = category.param;
		eoNetData.events[key].image = category.image;	
        var geometry = getGeometryData(event);	
		if (geometry) {
		  eoNetData.events[key].latitude = geometry.latAvg;
		  eoNetData.events[key].longitude = geometry.longAvg;
		}
		
    });
}



function redrawEoNetEvents() {
	
	$( ".eo-events" ).html('');
    var eoSize = 0;
    var eoItem = "<div class='item active'>";
	$.each( eoNetData.events, function( key, event ) {
        eoSize += 1;
		eoItem += "<div class='side-box col-md-4 col-xs-4' style='height:170px;'>";
        var glyph = "<span class='glyphicon glyphicon-record' style='color: "+event.color+";'></span> ";
        eoItem += "<h5> "+glyph+event.type+"</h5>"; 
		eoItem += "<a href='#' data-key="+key+" data-param="+event.param+">";
        eoItem += "<div style='margin-bottom: 2px;' class='thumbnail'>";  
        eoItem += "<img src='./images/types/"+event.image+"' style='height:90px; width:180px; max-width:90%'>";
        eoItem += "</div>";
        eoItem += "</a>";              

        eoItem += "<div class='caption small'>";
        eoItem += "<p class='boxed'>";
        eoItem += "<span>"+event.title+"</span>";
        eoItem += "</p>";
        eoItem += "</div>";
			   
		eoItem +="</div>";
        if (eoNetGrouping-1 == key % eoNetGrouping ) {
            eoItem += "</div>"; // end item
		    $( ".eo-events" ).append(eoItem);
            eoItem = "<div class='item'>";
        }

    });
    if (eoNetGrouping-1 != (eoSize-1) % eoNetGrouping ) {
        eoItem += "</div>";
        $( ".eo-events" ).append(eoItem);
    }
	
	$('.eo-events a').bind('click', selectEoEvent);
}

function selectEoEvent() {
    var element = $(this);
    var key = element.attr("data-key");	
	var eoEvent = eoNetData.events[key];
	//adjustCamera(eoEvent.latitude, eoEvent.longitude);
	adjustCamera(eoEvent.longitude, eoEvent.latitude);
	//adjustCamera(45, 0);
}

function getGeometryData(event) {
  var latMin = 1000.0;
  var latMax = -1000.0;
  var longMin = 1000.0;
  var longMax = -1000.0;
  var latAvg = 0.0;
  var longAvg = 0.0;  
  var offset = 1.0;
  var counter = 0.0;
	
  var calculateCoordinates = function (longitude, latitude) {
	counter += 1.0;  
    if (latitude + offset > latMax) {
     latMax = latitude + offset;
    }
    if (latitude - offset < latMin) {
     latMin = latitude - offset;
    }
    if (longitude + offset > longMax) {
     longMax = longitude + offset;
    }
    if (longitude - offset < longMin) {
     longMin = longitude - offset;
    }
	latAvg += latitude;
	longAvg += longitude;
  }	
	
  for (gIndex in event.geometries) {
    geometry = event.geometries[gIndex];	
    if('Point' == geometry.type) {
	  var point = geometry.coordinates;
	  calculateCoordinates(point[0], point[1]);
	}
    if('Polygon' == geometry.type) {
	  for (lIndex in geometry.coordinates) {
	    list = geometry.coordinates[lIndex];
	    for(pIndex in list) {
	      var point = list[pIndex];
		  calculateCoordinates(point[0], point[1]);
		}
	 }
	}	 
  }
  
  if (0.0 == counter) {
	  return null;
  }
  
  return {
      latMin: latMin,
      latMax: latMax,
      longMin: longMin,
      longMax: longMax,
	  latAvg: latAvg / counter,
	  longAvg: longAvg / counter
      };
}

function getCategoryData(event)
{
  var image = "unknown.jpg";
  var title = "Unknown";
  var param = ""; 
  var color = "#000000";
  {
     var category = event.categories[0];
     if (category.hasOwnProperty('id') && category.hasOwnProperty('title')) 
     {
       var title = category.title; 
       switch(category.id) {
       case 6:
        param = "c[va]=82,86";
        image = "drought.jpg";
        color = "#CDC673";
        break;
       case 7:
        param = "c[nd]=558,563,566,30";
        image = "sandstorm.jpg";
        color = "#FFFF00";
        break;
       case 8:
        param = "c[nd]=90";
        image = "fire.jpg";
        color = "#FF0000";
        break;
       case 9:
        param = "c[nd]=356,519,520,521,522";
        image = "flood.jpg";
        color = "#0000FF";
        break;
       case 10:
        param = "c[va]=10,11,12";
        image = "storm.jpg";
        color = "#999999";
        break;
       case 12:
        param = "c[nd]=89";
        image = "volcano.jpg";
        color = "#FF8800";
        break;
       case 13:
        param = "c[nd]=74";
        image = "color.jpg";
        color = "#00FF00";
        break;
       case 14:
        param = "c[nd]=309";
        image = "landslide.jpg";
        color = "#9932CC";
        break;
       case 15:
        param = "c[nd]=637,638,648";
        image = "ice.jpg";
        color = "#00FFFF";
        break;
       case 16:
        param = "c[nd]=298";
        image = "earthquake.jpg";
        color = "#DA70D6";
        break;
       case 17:
        param = "c[nd]=116";
        image = "snow.jpg";
        color = "#FFFFFF";
        break;
       case 18:
        param = "c[va]=4,7,5,6";
        image = "extremes.jpg";
        color = "#FF00FF";
        break;
       case 19:
        param ="c[nd]=4";
        image = "manmade.jpg";
        color = "#000000";
        break;
      } 
    }
  }

  return {
      param: param,
      image: image,
      color: color,
      title: title
      };
}
