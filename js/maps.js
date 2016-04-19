	
$(document).ready(function () {
   createMap();
});	

{
var olView = null;
var olMap = null;
var overlayGroup = null;
var olCenter = ol.proj.fromLonLat([0, 0]);
var olZoom = 5;	


function createMap() {

  overlayGroup = new ol.layer.Group({
   title: 'Overlays',
   layers: []
  });

  olView = new ol.View({
    // the view's initial state
    center: olCenter,
    zoom: olZoom,
    maxZoom: 8.0 ,
    minZoom: 1.5
  });
	  
  // Create a map containing two group layers
  olMap = new ol.Map({
    target: 'olMap',
    view: olView,	
	loadTilesWhileAnimating: true,
    controls: ol.control.defaults({
      attributionOptions: ({
        collapsible: false
      })
    }),
    layers: [
      new ol.layer.Group({
        'title': 'Base maps',
        layers: [
          new ol.layer.Tile({
	        title: "OSM", 
            type: 'base',
            visible: false,			
            preload: 4,
            source: new ol.source.OSM()
          }),
          new ol.layer.Tile({
			title: "Tambora",
			type: 'base',
			visible: true,
            source: new ol.source.XYZ({
              url: 'https://tambora-test.ub.uni-freiburg.de/tiles/tambora/{z}/{x}/{y}.png',
              crossOrigin: 'null'
            })
          })
        ]
      }), //end base group
    overlayGroup,
    new ol.layer.Group({
     'title': 'Info',
      layers: [
        new ol.layer.Tile({
		  title: "Names",
		  type: 'optional',
	  	  visible: true,			
          source: new ol.source.XYZ({
            url: 'http://tile.openstreetmap.de:8002/tiles/1.0.0/labels/en/{z}/{x}/{y}.png',
            crossOrigin: 'null'
          })
        })
      ]
    })
  ]
 });	  
  var layerSwitcher = new ol.control.LayerSwitcher();
  olMap.addControl(layerSwitcher);	  
}

var adjustMap = function(longitude, latitude) {
	var destination = ol.proj.fromLonLat([longitude, latitude]);
	if ('#map' == getCurrentTabId()) {  
      var duration = 2000;
      var start = +new Date();
      var pan = ol.animation.pan({
          duration: duration,
          source: /** @type {ol.Coordinate} */ (olView.getCenter()),
          start: start
      });
	  var resFactor = 4;
	  var zoom = olView.getZoom();
	  if (zoom < 3) {
		  resFactor = 2;
	  }
      var bounce = ol.animation.bounce({
        duration: duration,
        resolution: resFactor * olView.getResolution(),
        start: start
      });
      olMap.beforeRender(pan, bounce);
	}
    olView.setCenter(destination);
}


var clearLayers = function() {
  var layers = overlayGroup.getLayers();
  for (var j = 0; j < layers.getLength(); j++) {
    var layer = layers.pop();
    layer = {};
  }
}

var addLayer = function(x) {
  overlayGroup.getLayers().push(
    new ol.layer.Tile({
      title: 'Countries',
      source: new ol.source.TileWMS({
        url: 'http://demo.opengeo.org/geoserver/wms',
        params: {'LAYERS': 'ne:ne_10m_admin_1_states_provinces_lines_shp'},
        serverType: 'geoserver'
      })
    })
  );
}


}

$('#map').change( function() {
	olMap.updateSize();
}); 

