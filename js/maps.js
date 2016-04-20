$(document).ready(function () {
  createMapEvents();
  createMapSatelite();  
});	

$('#mapSatelite').change( function() {
	olMapSatelite.updateSize();
}); 

$('#mapEvents').change( function() {
	olMapEvents.updateSize();
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
  sateliteBaseTile.setVisible(true);

}

function compressSateliteLayerName(name) {
	var replacements = {
		'SurfaceReflectance':'Surface Reflectance',
		'CorrectedReflectance':'Corrected Reflectance',
		'_Chlorophyll_A':' Chlorophyll A',
		'_Bands':' Bands: ',
		'_Index':' Index',
		'_and_':' and ',
		'_Sea_Ice':' Sea Ice',
		'Snow_Cover':'Snow Cover',
		'Value_Added_':'Value Added ',
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
	    '_':' ',
		'_':' ',
		'  ':' '
	};
	var result = name;
	for (replIndex in replacements) {
 	  result = result.replace(replIndex, replacements[replIndex]); 
	}
	return result;
}

var addSateliteLayer = function(urlLayer, layerName, layerFormat, layerMatrix) {
  /*
  var wmsSource = new ol.source.TileWMS({
    url: urlLayer,
    layer: layerName,
    params: {'LAYERS': 'ne:ne_10m_admin_1_states_provinces_lines_shp'},
    serverType: 'geoserver'
    })

  var wmsTile = new ol.layer.Tile({
    title: layerName,
    source: wmsSource
  });

*/

   var tileType = 'overlay';
   tileOpacity = 0.6;
   if (checkForSubstrings(layerName, ['no_data'])) {
      tileType = 'none';
    } else if (checkForSubstrings(layerName, ['this_is_overlay'])) {
  	tileType = 'overlay';
    } else if (checkForSubstrings(layerName, ['_TrueColor'])) {
      tileType = 'base';
	  tileOpacity = 1.0;
    } else {
      tileType = 'overlay';
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
	
  var wmtsSource = new ol.source.WMTS({
    url: urlLayer,
    layer: layerName,
    format: layerFormat,
    matrixSet: layerMatrix,
    tileGrid: wmtsTileGrid
  });

  var uiName = compressSateliteLayerName(layerName);
  
  var wmtsTile = new ol.layer.Tile({
    source: wmtsSource,
    title: uiName,
    type: tileType,
    visible: false,
	opacity: tileOpacity,	
  });

	
	
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

  eventCanvasGroup = new ol.layer.Group({
   title: 'Events',
   layers: [ ]
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
      eventCanvasGroup,
      new ol.layer.Group({
       'title': 'Info',
        layers: [ eventTitleTile ]
    }) 
  ]
 });	  
  var layerSwitcher = new ol.control.LayerSwitcher();
  olMapEvents.addControl(layerSwitcher);	  
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



