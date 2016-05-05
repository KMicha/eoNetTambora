// eo-events
var eoNetServer = "http://eonet.sci.gsfc.nasa.gov/api/v2.1";
var eoNetLimit  = 120;	
var eoNetOffset = 0;
var eoNetGrouping = 6;
var eoNetData = null;
var eoNetLayers = null;

function getEoNetData() {
  return eoNetData;
}

function getEoNetEventByKey(key) {
  return eoNetData.events[key];
}

// http://eonet.sci.gsfc.nasa.gov/api/v2.1/categories  // :get all categories
// http://eonet.sci.gsfc.nasa.gov/api/v2.1/categories/8?status=open // :get all events of one category..
// http://eonet.sci.gsfc.nasa.gov/api/v2.1/events?status=open       // :get events of all categories..

function loadEoNetEvents(mode, category) {
	$command = 'events';
	if ('all' == mode) {
      $.getJSON( eoNetServer + "/" + $command, {
        status: 'open',
        limit: eoNetLimit
        })
      .done(function( data ) {	
        eoNetData = data;
        $.getJSON( eoNetServer + "/" + $command, {
          status: 'closed',
          limit:  (eoNetLimit - eoNetData.events.length)
        })
        .done(function( data ) {	
          eoNetData.events = eoNetData.events.concat(data.events);
	      handleNewEoEvents();		
        });	
      });
	} else {
    $.getJSON( eoNetServer + "/" + $command, {
        status: mode,
        limit: eoNetLimit
        })
    .done(function( data ) {	
        eoNetData = data;
	handleNewEoEvents();
    });
	}
}

function loadEoNetLayers(categoryId) { 
  $.getJSON( eoNetServer + "/layers/" + categoryId)
    .done(function( data ) {	
        eoNetLayers = data;
	handleNewEoLayers();
    });
}

function extractMapTime(mapTs) {
   var yyyy = mapTs.getFullYear().toString();
   var mm = (mapTs.getMonth()+1).toString(); // getMonth() is zero-based
   var dd  = mapTs.getDate().toString();
   return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]);
}

function handleNewEoLayers() { 
  var eoEvent = getActiveEoEvent();
  rememberSateliteVisibility();
  resetSateliteLayers();
  layerList = eoNetLayers['categories'][0]['layers'];
  for (layerIndex in layerList) {
    var layer = layerList[layerIndex]; 
    var mapTimeStr = extractMapTime(eoEvent.timeMap);
    var mapUrl = layer.serviceUrl + "?time=" + mapTimeStr; 
    $('#olControlDate .currentDay').html(mapTimeStr);
    var layerParam = layer.parameters[0];
    if ((layer.serviceTypeId == "WMTS_1_0_0") || (layer.serviceTypeId == "WMS_1_1_1")) {
      addSateliteLayer(mapUrl, layer.name, layerParam.FORMAT, layerParam.TILEMATRIXSET, layer.serviceTypeId);
    } else {
      console.log(layer.serviceTypeId);
      console.log(mapUrl);
      console.log(layer.name);
    }
  }
  restoreSateliteVisibility(); 
  olMapSatelite.updateSize();
}

function handleNewEoEvents() {
  processEoNetEvents();
  redrawEoNetEvents();	
  addEventsToGlobe(eoNetData.events);	
  addEventsToMap(eoNetData.events);
  activeEoEvent = eoNetData.events[0];	
  handleActiveEoEvent();
}

function processEoNetEvents() {
  $.each( eoNetData.events, function( key, event ) {
    var category = getCategoryData(event);
    eoNetData.events[key].from = 'eonet';	 
    eoNetData.events[key].type = category.title;
    eoNetData.events[key].catId = category.catId;	
    eoNetData.events[key].color = category.color;
    eoNetData.events[key].param = category.param;
    eoNetData.events[key].image = category.image;	
    var geometry = getGeometryData(event);	
    if (geometry) {
      eoNetData.events[key].latitude = geometry.latAvg;
      eoNetData.events[key].longitude = geometry.longAvg;
      eoNetData.events[key].ll = [geometry.longMin, geometry.latMin];
      eoNetData.events[key].ur = [geometry.longMax, geometry.latMax];
      eoNetData.events[key].timeStart = geometry.timeMin;
      eoNetData.events[key].timeEnd = geometry.timeMax;
      eoNetData.events[key].timeMap = geometry.timeMap;
      eoNetData.events[key].days = (geometry.timeMax - geometry.timeMin) / (1000 * 60 * 60 * 24);
      eoNetData.events[key].year = geometry.timeMin.getFullYear();
      eoNetData.events[key].month = 1 + geometry.timeMin.getMonth();
    }
  });
}

function getGeometryData(event) {
  var timeMin = 10E14;
  var timeMax = -10E14;
  var latMin = 1000.0;
  var latMax = -1000.0;
  var longMin = 1000.0;
  var longMax = -1000.0;
  var latAvg = 0.0;
  var longAvg = 0.0;  
  var offset = 1.0;
  var counter = 0.0;
	
  var calculateTimestamps = function (timestamp) {

    var dateTimeParts = timestamp.split('T');
    var timeParts = dateTimeParts[1].split(':');
    var dateParts = dateTimeParts[0].split('-');
    var newMin = new Date(dateParts[0], parseInt(dateParts[1], 10) - 1, dateParts[2], timeParts[0], timeParts[1]);
    var newMax = new Date(dateParts[0], parseInt(dateParts[1], 10) - 1, dateParts[2], timeParts[0], timeParts[1]);
    var newMap = new Date(dateParts[0], parseInt(dateParts[1], 10) - 1, dateParts[2], timeParts[0], timeParts[1]);

    if (newMax > timeMax) {
      timeMax = newMax;
    }
    if (newMin < timeMin) {
      timeMin = newMin;
    }
    if (newMap < timeMap) {
      timeMap = newMap;
    }
  }

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
    calculateTimestamps(geometry.date);	
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
      timeMin: timeMin,
      timeMax: timeMax,
      timeMap: timeMap,
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
  var catId = 0;
  {
     var category = event.categories[0];
     if (category.hasOwnProperty('id') && category.hasOwnProperty('title')) 
     {
       title = category.title; 
	   catId = category.id;
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
        param = "c[va]=10,16,18,19";
        image = "storm.jpg";
        color = "#006400";
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
        color = "#999999";
        break;
       case 18:
        param = "c[va]=4,7,5,6";
        image = "extremes.jpg";
        color = "#FF00FF";
		if (checkForSubstrings(event.title, ['heat','hot','warm'])) {
          param = "c[va]=5,6";
          image = "heat.jpg";
          color = "#FF7F50";
          title = "Heat Wave";		  
		} 
		if (checkForSubstrings(event.title, ['cold','snow','ice', 'frost'])) {
          param = "c[va]=4,7";
          image = "cold.jpg";
          color = "#6495ED";	
          title = "Cold Snap";		  
		}
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
      title: title,
      catId: catId
      };
}


