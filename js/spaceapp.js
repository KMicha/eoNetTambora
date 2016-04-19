$(document).ready(function() {
   loadEoNetEvents("closed");	
});

function buildEoNetEvent(key, event) {
 eoItem = "<div class='side-box col-md-4 col-xs-4' style='height:170px;'>";
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
 return eoItem;
}

function redrawEoNetEvents() {
	
  $( ".eo-events" ).html('');
  var eoSize = 0;
  var sliderItem = "<div class='item active'>";
  var eoData = getEoNetData();
  $.each( eoData.events, function( key, event ) {
    eoSize += 1;
    sliderItem += buildEoNetEvent(key, event);
    if (eoNetGrouping-1 == key % eoNetGrouping ) {
       sliderItem += "</div>"; // end item
       $( ".eo-events" ).append(sliderItem);
       sliderItem = "<div class='item'>";
    }

  });
  if (eoNetGrouping-1 != (eoSize-1) % eoNetGrouping ) {
    sliderItem += "</div>";
    $( ".eo-events" ).append(sliderItem);
  }
	
  $('.eo-events a').bind('click', selectEoEvent);
}

function selectEoEvent() {
  var element = $(this);
  var key = parseInt(element.attr("data-key"));	
  var eoEvent = getEoNetEventByKey(key);
  adjustCamera(eoEvent.longitude, eoEvent.latitude);
  loadTmbEvents(eoEvent.longitude, eoEvent.latitude, eoEvent.param, eoEvent.color);
}


