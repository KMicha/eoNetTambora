// tmb-events
var tmbServer = "https://tambora-test.ub.uni-freiburg.de/tambora-dev/index.php/grouping/event/json";
var tmbLimit  = 120;	
var tmbGrouping = 6;
var tmbData = null;


// https://tambora-test.ub.uni-freiburg.de/tambora-dev/index.php/grouping/event/json?s[lng]=20&s[lat]=10

function getEoNetData() {
  return eoNetData;
}

function getEoNetDataByKey(key) {
  return eoNetData[key];
}

function loadTmbEvents(longitude, latitude, param, colorParent) {
    $.getJSON( tmbServer + "?" + param, {
        's[lng]': longitude,
        's[lat]': latitude,
        limit: tmbLimit
        })
    .done(function( data ) {	
        tmbData = data;
	processTmbEvents(colorParent);
        //redrawTmbEvents();	
        addEventsToGlobe(tmbData.events);		
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
      eoNetData.events[key].timeStart = geometry.timeMin;
      eoNetData.events[key].timeEnd = geometry.timeMax;
      eoNetData.events[key].days = (geometry.timeMax - geometry.timeMin) / (1000 * 60 * 60 * 24);
      eoNetData.events[key].year = geometry.timeMin.getFullYear();
      eoNetData.events[key].month = 1 + geometry.timeMin.getMonth();
    }
  });
}


/*
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
    var newTime = new Date(timestamp).getTime();
    var time2 = Date.parse(timestamp);
    if (newTime > timeMax) {
      timeMax = newTime;
    }
    if (newTime < timeMin) {
      timeMin = newTime;
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
      latMin: latMin,
      latMax: latMax,
      longMin: longMin,
      longMax: longMax,
      latAvg: latAvg / counter,
      longAvg: longAvg / counter
      };
}
*/

/* Rename if needed seperatly !!
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
*/

