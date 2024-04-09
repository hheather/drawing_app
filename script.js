var rect;

var canvas = document.getElementById('myCanvas');

function addBackgroundRect() {
  // Make a background fill
  rect = new Path.Rectangle({
    point: [0, 0],
    size: [view.size.width, view.size.height],
    fillColor: '#fff',
    locked: true,
  });
  rect.sendToBack();
}

addBackgroundRect();

// Port text field
var port = document.getElementById("port");
var defaultPort = "8000";

port.onkeyup = function() {
  defaultPort = port.value;
  console.log(defaultPort);
}

// copied and pasted from http://paperjs.org/
// Create a Paper.js Path to draw a line into it:
var path = new Path();

// draw with mouse
tool.minDistance = 0.8;
tool.maxDistance = 1.1;

var raster;
var imageLayer = new Layer();
imageLayer.addChild(raster);

var pathsLayer = new Layer();

function resetWorkspace() {
  project.clear();
  // project.activeLayer.removeChildren();
  pathsLayer = new Layer();
  addBackgroundRect();
}

function showExample() {
  project.clear();
  var img = new Image();
  img.src = 'images/example.png'
  var ctx = canvas.getContext('2d');
  img.onload = function () {
    ctx.drawImage(img, 0, 0);
  };
  pathsLayer = new Layer();
  addBackgroundRect();
}

var predictBtn = document.getElementById("predictBtn");
predictBtn.addEventListener("click", predict);

var clearBtn = document.getElementById("clearBtn");
clearBtn.addEventListener("click", resetWorkspace);

var exampleBtn = document.getElementById("exampleBtn");
exampleBtn.addEventListener("click", showExample)

var segment, hitpath;
var movePath = false;

function onMouseDown(event) {
  path = new Path();
  path.fillColor = 'black';

  path.add(event.point);
  pathsLayer.addChild(path);
}

var startPoint, endPoint;

function onMouseDrag(event) {
  var step = event.delta / 2;
  step.angle += 90;

  var top = event.middlePoint + step;
  var bottom = event.middlePoint - step;
  
  path.add(top);
  path.insert(0, bottom);
  path.smooth();
}

function onMouseUp(event) {
  path.add(event.point);
  path.closed = true;
  //path.smooth();
  imageLayer.sendToBack();
}


function predict() {
  var imageAsBase64 = canvas.toDataURL('image/png', 1.0);
  
  var callback = function(err, res) {
    if (err) {
      console.log(err);
    } else {
      var imageAsBase64 = res.body.output_image;
      document.getElementById('myImage').src = imageAsBase64;
    }
  }
  
  // Construct request elements
  var request = window.superagent;
  // var Url = 'http://localhost:8001/query';
  var Url = 'http://localhost:' + defaultPort + '/generate'
  var payload = {
    'input_image': imageAsBase64
  };
  
  // Request a prediction to Runway's Pix2Pix HTTP service
  request
    .post(Url)
    .send(payload)
    .set('accept', 'json')
    .end(callback);
}
