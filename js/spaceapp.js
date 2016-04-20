$(document).ready(function() {
   loadEoNetEvents("all");	
});


function checkForSubstrings(test, subStrList)
{
  testString = test.toLowerCase(); 
  for (subIndex in subStrList) {
    substring = subStrList[subIndex].toLowerCase(); 
    if (testString.indexOf(substring) > -1) {
      return true;
    }
  }
  return false;
}

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
  handleActiveEoEvent(eoEvent);
}

function handleActiveEoEvent(eoEvent) {
  adjustCamera(eoEvent.longitude, eoEvent.latitude);
  adjustMap(eoEvent.longitude, eoEvent.latitude);
  adjustToBox(eoEvent.ll,eoEvent.ur);
  loadEoNetLayers(eoEvent.catId, eoEvent); 
  loadTmbEvents(eoEvent.longitude, eoEvent.latitude, eoEvent.param, eoEvent.color);
}

{
var currTab = '#globe';

var getCurrentTabId = function(data) {
	return currTab;
}

$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
  currTab = $(e.target).attr("href") // activated tab
  $(currTab).change();
});	
}
