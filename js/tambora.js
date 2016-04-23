// tmb-events
var tmbBase   = "https://tambora-test.ub.uni-freiburg.de/tambora-dev/index.php/";
var tmbServer = tmbBase + "grouping/event/eonet";
var tmbSearch = tmbBase + "grouping/event/list";
var tmbViewEvent = tmbBase + "grouping/event/show?event_id="; 
var tmbLimit  = 120;
var tmbDistance = 2000; // km	
var tmbGrouping = 6;
var tmbData = null;



// http://tambora-test.ub.uni-freiburg.de/tambora-dev/index.php/grouping/event/eonet?s[lng]=20&s[lat]=10

function getEoNetData() {
  return eoNetData;
}

function getEoNetDataByKey(key) {
  return eoNetData[key];
}

function adjustTmbSearchUrl(longitude, latitude, param, colorParent) {
  var url = tmbSearch + "?" + param + "&s[lng]=" + longitude + "&s[lat]=" + latitude;
  $("a.tmbSearch").attr('href', url);
}

function loadTmbEvents(longitude, latitude, param, colorParent) {

    $.getJSON( tmbServer + "?" + param, {
        's[lng]': longitude,
        's[lat]': latitude,
	's[mxd]': tmbDistance,
        limit: tmbLimit
        })
    .done(function( data ) {
        tmbData = data;
		$('#tmbCount').html(data.total);
	processTmbEvents(colorParent);
        //redrawTmbEvents();	
        addEventsToGlobe(tmbData.events);	

		addEventsToMap(tmbData.events);
		updateChartData(tmbData.events);	//bug!!	
    });
	
}

function processTmbEvents(colorParent) {
  $.each( tmbData.events, function( key, event ) {
    //var category = getCategoryData(event);
    //eoNetData.events[key].type = category.title;
    //eoNetData.events[key].color = category.color;
    tmbData.events[key].from = 'tambora';
    tmbData.events[key].color = colorParent;
    //eoNetData.events[key].param = category.param;
    //eoNetData.events[key].image = category.image;	
    var geometry = getGeometryData(event);	
    if (geometry) {
      tmbData.events[key].latitude = geometry.latAvg;
      tmbData.events[key].longitude = geometry.longAvg;
      tmbData.events[key].timeStart = geometry.timeMin;
      tmbData.events[key].timeEnd = geometry.timeMax;
      tmbData.events[key].days = (geometry.timeMax - geometry.timeMin) / (1000 * 60 * 60 * 24);
      tmbData.events[key].year = geometry.timeMin.getFullYear();
      tmbData.events[key].month = 1 + geometry.timeMin.getMonth();
    }
  });
}

