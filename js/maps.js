$('#mapSatelite').change( function() {
	olMapSatelite.updateSize();
}); 

$('#mapEvents').change( function() {
	olMapEvents.updateSize();
}); 


$('#olControlDate .plusDay').click( function() {
	offsetSateliteDate(+1);
}); 
$('#olControlDate .minusDay').click( function() {
	offsetSateliteDate(-1);
}); 
$('#olControlDate .resetDay').click( function() {
	resetSateliteDate();
}); 

{
var olMapSatelite = null;	
var sateliteBaseTile = null;
var sateliteBaseGroup = null;
var sateliteOverlayGroup = null;

var olMapEvents = null;
var overlayGroup = null;
var olCenter = ol.proj.fromLonLat([0, 0]);
var olZoom = 5;	

//var eoNetEventFeatures = [];
//var tmbEventFeatures = [];
var eoNetVectorEvents = null;
var tmbVectorEvents = null;


function createMapSatelite() {

  sateliteBaseTile = new ol.layer.Tile({
	title: "Geographic", 
    type: 'base',
    visible: true,	
	opacity: 1.0,
    source: new ol.source.TileWMS({
      url: 'http://demo.boundlessgeo.com/geoserver/wms',
      params: {
        'LAYERS': 'ne:NE1_HR_LC_SR_W_DR'
      }
    })
  });
  sateliteBaseTile.set('identifier','geographic_base_layer');
  sateliteBaseTile.setZIndex(0);

  sateliteBaseGroup = new ol.layer.Group({
   title: 'Base',
   layers: [ sateliteBaseTile ]
  });
  
  sateliteOverlayGroup = new ol.layer.Group({
   title: 'Overlays',
   layers: [ ]
  });


olMapSatelite = new ol.Map({
  controls: ol.control.defaults().extend([
    new ol.control.ScaleLine({
      units: 'degrees'
    }),
	new ol.control.Control({
          element: $('#olControlDate').get(0)
        })
  ]),
  layers: [ sateliteBaseGroup, sateliteOverlayGroup],
  target: 'olMapSatelite',
  renderer: ["canvas", "dom"],
  view: new ol.View({
	projection: ol.proj.get("EPSG:4326"),	

    center: [-95.980224609375,29.213727993972313],
    zoom: olZoom
  })
});

  var layerSwitcher2 = new ol.control.LayerSwitcher();
  olMapSatelite.addControl(layerSwitcher2);	
//// end EPSG:4326

}

{

var storeLayerVisibility = function(layerName, visibility) {
  var eoEvent = getActiveEoEvent();
  var categoryId = eoEvent.categories[0].id;
  var layerId1 = 'eoNetTmb:Layer:' + categoryId + ':' + layerName;
  var layerId2 = 'eoNetTmb:Layer:' + '-' + ':' + layerName;
  Lockr.set(layerId1, visibility);  
  Lockr.set(layerId2, visibility);
}

var queryLayerVisibility = function(layerName) {
  var eoEvent = getActiveEoEvent();
  var categoryId = eoEvent.categories[0].id;
  var layerId1 = 'eoNetTmb:Layer:' + categoryId + ':' + layerName;
  var layerId2 = 'eoNetTmb:Layer:' + '-' + ':' + layerName;
  var fallBack = Lockr.get(layerId2, false);
  var visibility =  Lockr.get(layerId1, fallBack);
  return visibility;
}

var rememberSateliteVisibility= function() {
  var baseLayers = sateliteBaseGroup.getLayers();
  var baseLenght = baseLayers.getLength();
  for (var j = 0; j < baseLenght; j++) {
    var layer = baseLayers.item(j);
    storeLayerVisibility(layer.get('identifier'), layer.getVisible());
  }

  var overlayLayers = sateliteOverlayGroup.getLayers();
  var overlayLenghth = overlayLayers.getLength();
  for (var j = 0; j < overlayLenghth; j++) {
    var layer = overlayLayers.item(j);
    storeLayerVisibility(layer.get('identifier'), layer.getVisible());
  }
}

var restoreSateliteVisibility= function() {

  var baseLayers = sateliteBaseGroup.getLayers();
  var baseLenght = baseLayers.getLength();
  for (var j = 0; j < baseLenght; j++) {
    var layer = baseLayers.item(j);
	var visibility = queryLayerVisibility(layer.get('identifier'));
	layer.setVisible(visibility);
  }
var overlayLayers = sateliteOverlayGroup.getLayers();
  var overlayLenghth = overlayLayers.getLength();
  for (var j = 0; j < overlayLenghth; j++) {
    var layer = overlayLayers.item(j);
	var visibility = queryLayerVisibility(layer.get('identifier'));
	layer.setVisible(visibility);
  }
}
}

var resetSateliteLayers = function() {

  var baseLayers = sateliteBaseGroup.getLayers();
  var baseLenght = baseLayers.getLength()-1;
  for (var j = 0; j < baseLenght; j++) {
    var layer = baseLayers.pop();
	layer.setVisible(false);
  }
  baseLayers = {};
  var overlayLayers = sateliteOverlayGroup.getLayers();
  var overlayLenghth = overlayLayers.getLength();
  for (var j = 0; j < overlayLenghth; j++) {
    var layer = overlayLayers.pop();
	layer.setVisible(false);
  }
  //sateliteBaseTile.setVisible(true);

}

function compressSateliteLayerName(name) {
	var replacements = {
		'SurfaceReflectance':'Surface Reflectance',
		'CorrectedReflectance':'Corrected Reflectance',
                'mortality-risks-distribution':'Mortality Risks',
                'hazard-frequency-distribution':'Hazard Frequency',
                'MOD_LSTAN_D':'Mod Land Surface Temp Night',
                'MOD_LSTAD_D':'Mod Land Surface Temp Day',
                'AURA_NO':'Aura NO',
                'D_CLD_FR':'D CLD FR',
                'D_LSTNI':'Land Surface Temp Night I',
                'D_LSTDI':'Land Surface Temp Day I',
                'D_LSTNA':'Land Surface Temp Night A',
                'D_LSTDA':'Land Surface Temp Day A', 
		'_Chlorophyll_A':' Chlorophyll A',
		'_Bands':' Bands: ',
		'_Index':' Index',
		'_and_':' and ',
		'_Sea_Ice':' Sea Ice',
		'Snow_Cover':'Snow Cover',
		'Value_Added_':'Value Added ',
                'cyclone':'Cyclone',
                'flood':'Flood',
		'Score_Ocean':'Score Ocean',
		'Total_Column':'Total Column',
		'_Brightness_Temp_':' Brightness Temp ',
		'_Surface_Temp_':' Surface Temp ',
		'_Upper_':' Upper ',
		'_Middle_':' Middle ',
		'_Lower_':' Lower ',
		'_Vapor_':' Vapor ', 
		'_Night':' Night',
		'_Day':' Day',
		'AIRS_':'',
		'VIIRS_SNPP_':'',
		'_TrueColor':'',
		'MODIS_':'',
                'ndh-':'',
	        '_':' ',
		'_':' ',
                '-':' ',
                '-':' ',
		'  ':' '
        
	};
	var result = name;
	for (replIndex in replacements) {
 	  result = result.replace(replIndex, replacements[replIndex]); 
	}
	return result;
}

var offsetSateliteDate = function(days) 
{
  var eoEvent = getActiveEoEvent();
  var currentDate = eoEvent.timeMap;
  currentDate.setDate(currentDate.getDate() + days);
  handleNewEoLayers();
}

var resetSateliteDate = function() 
{
  var eoEvent = getActiveEoEvent();
  var resetDate = eoEvent.timeStart;
  var currentDate = eoEvent.timeMap;
  currentDate.setDate(resetDate.getDate());
  handleNewEoLayers();
}

var addSateliteLayer = function(urlLayer, layerName, layerFormat, layerMatrix, serviceType) {



   var tileType = 'overlay';
   var tileOpacity = 0.4;
   var tileIndex = 0;
   if (checkForSubstrings(layerName, ['no_data'])) {
        tileType = 'none';
    } else if (checkForSubstrings(layerName, ['this_is_overlay'])) {
  	tileType = 'overlay';
	tileIndex = 3;
    } else if (checkForSubstrings(layerName, ['_TrueColor'])) {
      tileType = 'base';
	  tileOpacity = 1.0;
	  tileIndex = 1;
    } else {
      tileType = 'overlay';
	  tileIndex = 2;
    }

 
  
  var wmtsTileGrid = new ol.tilegrid.WMTS({
      origin: [-180, 90],
      resolutions: [
        0.5625,
        0.28125,
        0.140625,
        0.0703125,
        0.03515625,
        0.017578125,
        0.0087890625,
        0.00439453125,
        0.002197265625
        ],
      matrixIds: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      tileSize: 512
    });
	
var wmtsSource = null;
 if ('WMS_1_1_1' == serviceType) {
   wmtsSource = new ol.source.TileWMS({
        url: urlLayer,
        // layer: layerName,
        params: {
            'LAYERS': layerName,
            'VERSION': '1.1.1',
            'FORMAT': layerFormat,
            'TILED': true
        },
        // tileGrid: tileGrid,
        serverType: 'geoserver'
    })
 } else {
  wmtsSource = new ol.source.WMTS({
    url: urlLayer,
    layer: layerName,
    format: layerFormat,
    matrixSet: layerMatrix,
    tileGrid: wmtsTileGrid
    });
  }

  var uiName = compressSateliteLayerName(layerName);
  
  var wmtsTile = new ol.layer.Tile({
    source: wmtsSource,
    title: uiName,
    type: tileType,
    visible: false,
    opacity: tileOpacity,	
  });
  wmtsTile.set('identifier',layerName);
  wmtsTile.setZIndex(2);
	
  if( 'base' == tileType ) {
	  sateliteBaseGroup.getLayers().push( wmtsTile ); 
  }
  if( 'overlay' == tileType ) {
	  sateliteOverlayGroup.getLayers().push( wmtsTile );
  }	
}

function createMapEvents() {

  var eventOsmTile = new ol.layer.Tile({
	        title: "OSM", 
            type: 'base',
            visible: false,			
            preload: 4,
            source: new ol.source.OSM()
          });
		  
  var eventTmbTile = new ol.layer.Tile({
			title: "Tambora",
			type: 'base',
			visible: true,
            source: new ol.source.XYZ({
              url: 'https://tambora-test.ub.uni-freiburg.de/tiles/tambora/{z}/{x}/{y}.png',
              crossOrigin: 'null'
            })
          });
		  
  var eventTitleTile =  new ol.layer.Tile({
		  title: "Names",
		  type: 'optional',
	  	  visible: true,			
          source: new ol.source.XYZ({
            url: 'http://tile.openstreetmap.de:8002/tiles/1.0.0/labels/en/{z}/{x}/{y}.png',
            crossOrigin: 'null'
          })
        });	
		
  eoNetVectorEvents = new ol.source.Vector({
        features: []
      });

      var eoNetVectorLayer = new ol.layer.Vector({
		   title: "eoNet",
        source: eoNetVectorEvents
      });
	  
  tmbVectorEvents = new ol.source.Vector({
        features: []
      });

      var tmbVectorLayer = new ol.layer.Vector({
		   title: "Tambora",
        source: tmbVectorEvents
      });		

	  
	

  eventVectorGroup = new ol.layer.Group({
   title: 'Events',
   layers: [eoNetVectorLayer, tmbVectorLayer ]
  });

  // Create a map containing two group layers
  olMapEvents = new ol.Map({
    target: 'olMapEvents',
    view: new ol.View({
    // the view's initial state
    center: olCenter,
    zoom: olZoom,
    maxZoom: 8.0,
    minZoom: 1.5,
	projection: ol.proj.get("EPSG:3857"),

  }),	
    loadTilesWhileAnimating: true,
    renderer: ["canvas", "dom"],
    controls: ol.control.defaults({
      attributionOptions: ({
        collapsible: false
      })
    }),
    layers: [
      new ol.layer.Group({
        'title': 'Base maps',
        layers: [ eventOsmTile, eventTmbTile]
      }), //end base group
      eventVectorGroup,
      new ol.layer.Group({
       'title': 'Info',
        layers: [ eventTitleTile ]
    }) 
  ]
 });	  
  var layerSwitcher = new ol.control.LayerSwitcher();
  olMapEvents.addControl(layerSwitcher);	  
}



var addEventsToMap = function (data) {
  if (data.size > 0) {	
    clearVectorEvents(data[0].from);
  } else {
	clearVectorEvents('tambora');  
  }
  
  for (index in data) {
    dataRow = data[index];
    latitude = dataRow.latitude;
    longitude = dataRow.longitude;
    color = dataRow.color;
	addVectorEvent(longitude, latitude, dataRow.from, color);
  }	
}
	
var clearVectorEvents = function(type) {
	if ('tambora' == type) {
		tmbVectorEvents.clear();
	} else {
		eoNetVectorEvents.clear();	
	}
	//redraw??
}	
	
var addVectorEvent = function(longitude,latitude, type, color) {
   var stroke = new ol.style.Stroke({color: 'black', width: 0.5});
   var fill = new ol.style.Fill({color: color});	// color
	
   var style = null;
	if ('tambora' == type) {
     style = new ol.style.Style({
          image: new ol.style.RegularShape({
            fill: fill,
            stroke: stroke,
            points: 7,
            radius: 4,
            angle: Math.PI / 7
          })
        });
	} else {
		style = new ol.style.Style({
          image: new ol.style.RegularShape({
            fill: fill,
            stroke: stroke,
            points: 5,
            radius: 7,
            radius2: 3,
            angle: 0
          })
		  });
	}   
	var coord = ol.proj.transform([longitude, latitude], 'EPSG:4326', 'EPSG:3857');
	var feature = new ol.Feature(new ol.geom.Point(coord));
    feature.setStyle(style);
	if ('tambora' == type) {
		tmbVectorEvents.addFeature(feature);		
	} else {
		eoNetVectorEvents.addFeature(feature);
	}	
	
}

	  

var adjustToBox = function (ll, ur) {
	var extent = ol.extent.boundingExtent([ll,ur]);
	var areaExtent = ol.proj.transformExtent(extent, 'EPSG:3857', 'EPSG:4326');
	//olMapSatelite.getView().fit(areaExtent, olMapSatelite.getSize());
	
	//olMapSatelite.getView().fit(extent, olMapSatelite.getSize());
	//olMapSatelite.getView().fit(areaExtent);
	//olMapSatelite.getView().fit(extent);
}

var adjustMap = function(longitude, latitude) {
	var destination = ol.proj.fromLonLat([longitude, latitude]);
	var currentMap = null;
	if ('#mapEvents' == getCurrentTabId()) {  
	  currentMap = olMapEvents;	  
	}
	if ('#mapSatelite' == getCurrentTabId()) {  
	  currentMap = olMapSatelite;
	}
	if (null != currentMap) {
      var duration = 2000;
      var start = +new Date();
      var pan = ol.animation.pan({
          duration: duration,
          source: /** @type {ol.Coordinate} */ (currentMap.getView().getCenter()),
          start: start
      });
	  var resFactor = 4;
	  var zoom = currentMap.getView().getZoom();
	  if (zoom < 3) {
		  resFactor = 2;
	  }
      var bounce = ol.animation.bounce({
        duration: duration,
        resolution: resFactor * currentMap.getView().getResolution(),
        start: start
      });
      currentMap.beforeRender(pan, bounce);
	}
    olMapEvents.getView().setCenter(destination);
	olMapSatelite.getView().setCenter(ol.proj.transform(destination, 'EPSG:3857', 'EPSG:4326'));
}

}



