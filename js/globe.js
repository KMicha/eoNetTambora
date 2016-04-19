{
  var scene = null;
  var camera = null;
  var urlAsset = "."; 

function drawEarth(scene) {
  THREE.ImageUtils.crossOrigin = '';
  var geometry = new THREE.SphereGeometry( 250 , 40, 40 );
  var earthColor = THREE.ImageUtils.loadTexture(urlAsset + '/images/earth/earthmap1k.jpg');
  earthColor.minFilter = THREE.LinearFilter;
  var earthBumps = THREE.ImageUtils.loadTexture(urlAsset + '/images/earth/earthbump1k.jpg');
  earthBumps.minFilter = THREE.LinearFilter;
  var earthSpecular = THREE.ImageUtils.loadTexture(urlAsset + '/images/earth/earthspec1k.jpg');
  earthSpecular.minFilter = THREE.LinearFilter;
  var material	= new THREE.MeshPhongMaterial({
	  map		    : earthColor,
	  bumpMap		: earthBumps,
	  bumpScale	: 25.0,
	  specularMap	: earthSpecular,
	  specular	: new THREE.Color('grey'),
  });
  var earth = new THREE.Mesh( geometry, material );	
  scene.add( earth );    
}		
		
function drawLights(scene) {
  hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
  hemiLight.color.setHSL( 0.6, 1, 0.6 );
  hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
  hemiLight.position.set( 0, 500, 0 );
  //hemiLight.position.copy( camera.position );
  scene.add( hemiLight );

  dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
  dirLight.color.setHSL( 0.1, 1, 0.95 );
  dirLight.position.set( -1, 1.75, 1 );
  dirLight.position.multiplyScalar( 50 );
  //dirLight.position.copy( camera.position );
  scene.add( dirLight );
}		
		
		
function drawEvent(scene,name,longitude,latitude,offset,size,color, opacity) {
  var geo = new THREE.SphereGeometry( size, 20.0, 20.0 );
  var geoColor = new THREE.Color(color);
  var mat = new THREE.MeshPhongMaterial( { color: geoColor, specular: 0x101010, shininess: 80, combine: THREE.MixOperation, reflectivity: 0.1, side: THREE.DoubleSide, opacity: opacity, transparent: true  } );
  var ball = new THREE.Mesh( geo, mat );
  ball.name = name;  
  // polar coordinates
  ball.rotateY(longitude*Math.PI/180);
  ball.rotateZ(latitude*Math.PI/180);
  ball.translateX(250+offset);
  //ball.updateMatrix();
  scene.add( ball );
  
  var material = new THREE.LineBasicMaterial({ color: 0x888888, opacity: 0.5, transparent: true });
  var line = new THREE.Geometry();
  line.vertices.push(new THREE.Vector3(250 + offset,0,0));
  line.vertices.push(new THREE.Vector3(250, 0, 0));
  var axis = new THREE.Line(line, material); 
  axis.name = name + '_axis';   
  axis.rotateY(longitude*Math.PI/180);
  axis.rotateZ(latitude*Math.PI/180);
  scene.add( axis );  
}		


function drawEvents(scene, data) {
  for (index in data) {
    dataRow = data[index];
    latitude = dataRow.latitude;
    longitude = dataRow.longitude;
    opacity = 0.7;
    offset = 10;
    size = 5;
    if('tambora' == dataRow.from) {
      opacity = 0.5;
      offset = 20;
      size = 3;
    }
    color = dataRow.color;
    drawEvent(scene,'name',longitude,latitude,offset,size,color, opacity);
  }	
}

var addEventsToGlobe = function(data) {
	drawEvents(scene, data);
}

var adjustCamera = function(longitude, latitude) {
  var lg = longitude;
  var lt = 90.0-latitude;  
  var r = 2000.0;		 
  var x = r*Math.sin(lt*Math.PI/180)*Math.cos(lg*Math.PI/180);
  var y = r*Math.cos(lt*Math.PI/180);
  var z = 0-r*Math.sin(lt*Math.PI/180)*Math.sin(lg*Math.PI/180);

  if ('#globe' == getCurrentTabId()) {  
    var camCurr = { x : camera.position.x, y: camera.position.y, z: camera.position.z};
    var camEnd = { x : x, y: y, z: z };
    var tweenCam = new TWEEN.Tween(camCurr).to(camEnd, 2000);
    tweenCam.easing(TWEEN.Easing.Cubic.InOut);
    tweenCam.onUpdate(function(){
      camera.position.x = camCurr.x;
      camera.position.y = camCurr.y;
	  camera.position.z = camCurr.z;
	  camera.up.x = 0;
      camera.up.y = 1;
      camera.up.z = 0;
    });
    tweenCam.start();
  } else {
    camera.position.x = x;
    camera.position.y = y;
	camera.position.z = z;	  
  }
}
	

$(document).ready(function () {
		
var renderDiv = document.getElementById("rendering");
var renderHeight = $("#rendering").height();
var renderWidth = 0.9*$("#tab-content").width();

camera = new THREE.PerspectiveCamera(10, renderWidth/renderHeight, 0.1, 10000); 
//camera = new THREE.OrthographicCamera( -0.5*renderWidth, +0.5*renderWidth, -0.5*renderHeight, +0.5*renderHeight, -10000, 10000 );

var renderer = new THREE.WebGLRenderer({ antialias: true }); 
renderer.gammaInput = true;
renderer.gammaOutput = true;
                
renderer.setSize(renderWidth, renderHeight); 
renderer.setClearColor(0xffffff, 0); // bg color

renderDiv.appendChild(renderer.domElement); // displays canvas

camera.position.z = 4000; // move away to see coord center
camera.position.x = 0;
camera.position.y = 0;

controls = new THREE.TrackballControls(camera, renderer.domElement);

scene = new THREE.Scene(); 
drawEarth(scene);
drawLights(scene); 
if (eoNetData && eoNetData.hasOwnProperty('events')) {
  drawEvents(scene, eoNetData.events);
}

var render = function () { 

    requestAnimationFrame(render); 
	TWEEN.update();	
    controls.update();

    renderer.render(scene, camera); 
};

render();   
});

}

    
