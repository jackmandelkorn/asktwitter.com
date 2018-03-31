var globalX = 0;
var globalY = 0;
var globalZ = 0;
var globalXDeg = 0;
var globalYDeg = 0;

class Panel {
  constructor(width, height, x, y, z, spin, innerhtml) {
    Panel.all.push(this);
  	this.id = "panel-" + Math.random().toString(36).substr(2, 9);
    if (width) {
      this.width = width;
    }
    this.x = x;
    this.y = y;
    this.z = z;
    this.spin = spin;
    this.obj = document.createElement("div");
    if (innerhtml) {
      this.obj.innerHTML = innerhtml.outerHTML;
    }
    this.update();
    this.obj.className = "view3d-panel";
    this.obj.id = this.id;
    document.getElementById("view3d-main").appendChild(this.obj);
  }
  update() {
    if (this.width) {
      this.obj.style.width = this.width + "px";
    }
    this.obj.style.zIndex = 1000000 - Math.floor(Math.sqrt(Math.pow(((this.z - (globalZ - (Math.cos((globalXDeg * Math.PI) / 180) * 300)))),2) + Math.pow((this.x - (globalX - (Math.sin((globalXDeg * Math.PI) / 180) * 300))),2))  * 100);
    if (this.width) {
      this.obj.style.margin = "0px -" + (this.width / 2) + "px";
    }
    else {
      this.obj.style.margin = "0px -" + (this.obj.clientWidth / 2) + "px";
    }
    this.obj.style.transform = "rotateX(" + globalYDeg + "deg) rotateY(" + globalXDeg + "deg) translateX(" + (this.x - globalX) + "px) translateY(" + ((this.y - globalY) * -1) + "px) translateZ(" + ((this.z - globalZ) * -1) + "px) rotateY(" + this.spin + "deg)";
  }
}
Panel.all = new Array();

function updateAll() {
  if (view3d) {
    for (var i = 0; i < Panel.all.length; i++) {
    	Panel.all[i].update();
    }
    updateGround();
    updateInfo();
  }
  if (message3d === false) {
    if (document.getElementById("view3d-message") !== null) {
      document.getElementById("view3d-message").style.opacity = 0;
      setTimeout(function(){
        document.getElementById("view3d-message").remove();
      },500);
    }
  }
}

function updateGround() {
  var ground = document.getElementById("view3d-ground");
  ground.style.height = (((window.innerHeight * (0.1 - (Math.sin((globalYDeg * Math.PI) / 180) / 2)))) + 0) + "px";
}

var speed = 14;
onKey(37,function(){
  message3d = false;
  globalZ -= -1 * Math.sin((globalXDeg * Math.PI) / 180) * speed;
  globalX -= Math.cos((globalXDeg * Math.PI) / 180) * speed * 1;
  updateAll();
});
onKey(38,function(){
  message3d = false;
  globalZ += Math.cos((globalXDeg * Math.PI) / 180) * speed;
  globalX += Math.sin((globalXDeg * Math.PI) / 180) * speed * 1;
  updateAll();
});
onKey(39,function(){
  message3d = false;
  globalZ += -1 * Math.sin((globalXDeg * Math.PI) / 180) * speed;
  globalX += Math.cos((globalXDeg * Math.PI) / 180) * speed * 1;
  updateAll();
});
onKey(40,function(){
  message3d = false;
  globalZ -= Math.cos((globalXDeg * Math.PI) / 180) * speed;
  globalX -= Math.sin((globalXDeg * Math.PI) / 180) * speed * 1;
  updateAll();
});

function mouseMove(event) {
  globalXDeg = ((event.clientX - (window.innerWidth / 2)) / window.innerWidth) * 2 * (215);
  globalYDeg = ((event.clientY - (window.innerHeight / 2)) / window.innerHeight) * -2 * (30);
  updateAll();
}

function updateInfo() {
  var directions = ["North", "North-West", "West", "South-West", "South", "South-East", "East", "North-East"];
  var el = document.getElementById("view3d-info");
  var deg = -1 * globalXDeg;
  var direction = directions[Math.round(((deg %= 360) < 0 ? deg + 360 : deg) / 45) % 8].toLowerCase();
  var x = Math.round(globalX / 7);
  var y = Math.round(globalZ / 7);
  el.innerHTML = "x: " + x + "<br>y: " + y+ "<br>facing: " + direction;
}
