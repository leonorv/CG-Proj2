const x_axis = new THREE.Vector3(1, 0, 0);
const Y_AXIS = new THREE.Vector3(0, 1, 0);
const Z_AXIS = new THREE.Vector3(0, 0, 1);

var camera, scene, renderer;

var clock, delta;
var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;
var aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
var cameraTop, cameraPerspective;
var frustumSize = 100;
var table_base, table, table_top;
var pocket1, pocket2, pocket3, pocket4, pocket5, pocket6;
var sticks = new Array();
var balls = new Array();
var ball;

var selected_stickID = 0;

var keys = {
    37: false, //left
    39: false,
    //CUE STICKS
    52: false, //4
    53: false, //5
    54: false, //6
    55: false, //7
    56: false, //8
    57: false, //9

    32: false, //space for shooting the ball
}

const calcAngleToRotate = (vector) => {
    if (vector.x == 0 && vector.z == 0) {
      return 0
    } else if ((vector.x >= 0 && vector.z >= 0) || (vector.x <= 0 && vector.z >= 0)) {
      return Math.PI * 2 - vector.angleTo(X_AXIS)
    } else {
      return vector.angleTo(X_AXIS)
    }
  }

class Ball extends THREE.Object3D {
    constructor(x, y, z, radius, direction, velocity) {
        'use strict'
        super();
        this.velocity = velocity;
        this.radius = radius;
        this.direction = new THREE.Vector3(Math.random() * 2 - 1, 0, Math.random() * 2 - 1).normalize();;
        this.angle = 0;
        this.position.set(x, y, z);
        

        this.geometry = new THREE.SphereGeometry(this.radius, 10, 10);
        this.material = new THREE.MeshBasicMaterial( {color: 0xffffff, wireframe: true} );
        this.mesh = new THREE.Mesh(this.geometry, this.material);

        if (this.direction.x != 0 && this.direction.z >= 0)
            this.angle = -this.direction.angleTo(x_axis);

        else if (this.direction.x != 0 && this.direction.z < 0)
            this.angle = this.direction.angleTo(x_axis);

        this.rotateY( this.angle );

        this.dirChanged = false;
     
        this.axis = new THREE.AxisHelper(1.5*radius);

        this.add(this.mesh);
        this.add(this.axis);
        scene.add(this);
    }

    rotateVelocity(velocity, angle){
		var x = velocity.x * Math.cos(angle) - velocity.z * Math.sin(angle);
		var z = velocity.x * Math.sin(angle) + velocity.z * Math.cos(angle);

        return new THREE.Vector3(x,0,z)
    }
    
    updatePosition(delta){
		this.translateOnAxis(x_axis, this.velocity * delta / 5);
        this.mesh.rotateZ(-this.velocity * delta /10 );
    }

    /*animate(delta) {
        if(this.velocity > 0) this.velocity = Math.max(0, this.velocity - 2 * delta); //friction
        else if(this.velocity === 0) {
            this.direction = 0;
            return
        }
        this.position.add(this.direction.clone().multiplyScalar(this.velocity * delta));
        //this.setRotationFromAxisAngle(Y_AXIS, calcAngleToRotate(this.direction) + Math.PI / 2)
        this.rotateX(delta * this.velocity / this.radius);
        this.rotateZ(delta * this.velocity / this.radius);
        //console.log(this.direction);
    }*/

}

class Wall extends THREE.Object3D {
    constructor(width) {
        'use strict'
        super()
        this.width = width;
        this.height = 5;
        this.geometry = new THREE.PlaneGeometry(this.width, this.height);
        this.material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide, wireframe: true} );
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.add(this.mesh);
        scene.add(this);
    }
}

class TableTop extends THREE.Object3D {
    constructor(x, y, z, width, height, length) {
        'use strict';
        super();
        this.width = width;
        this.length = length;
        this.height = height;
        this.material = new THREE.MeshBasicMaterial({ color: 0x073417});
        this.geometry = new THREE.BoxGeometry(width, height, length);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.add(this.mesh);
        this.position.set(x, y, z);

        this.wall1 = new Wall(this.width);
        this.wall1.position.set(0, this.height/2, this.length/2);

        this.wall2 = new Wall(this.width);
        this.wall2.position.set(0, this.height/2, -this.length/2);

        this.wall3 = new Wall(this.length);
        this.wall3.position.set(this.width/2, this.height/2, 0);
        this.wall3.rotateY(Math.PI/2)

        this.wall4 = new Wall(this.length);
        this.wall4.position.set(-this.width/2, this.height/2, 0);
        this.wall4.rotateY(Math.PI/2);

        this.add(this.wall1);
        this.add(this.wall2);
        this.add(this.wall3);
        this.add(this.wall4);

        scene.add(this);
    }
}

class TableBase extends THREE.Object3D {
    constructor(x, y, z, height) {
        'use strict';
        super();
        this.height = height;
        this.material = new THREE.MeshBasicMaterial({ color: 0x3e0000});
        this.geometry = new THREE.CylinderGeometry(10, 15, height, 4);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.add(this.mesh);
        this.position.set(x, y, z);
        scene.add(this);
    }
}

class Pocket extends THREE.Object3D {
    constructor(x, y, z, height) {
        'use strict';
        super();
        this.height = height + 0.1; //+ 0.1 for visibility
        this.material = new THREE.MeshBasicMaterial({color: 0x000000});
        this.geometry = new THREE.CylinderGeometry(2, 2, this.height, 30);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.add(this.mesh);
        this.position.set(x, y, z);
        scene.add(this);
    }
}

class CueStick extends THREE.Object3D {
    constructor(x, y, z, height, angleX, angleZ) {
        'use strict';
        super();
        this.height = height;
        this.material = new THREE.MeshBasicMaterial({ color: 0xF50176, wireframe: true});
        this.geometry = new THREE.CylinderGeometry(0.5, 0.75, height, 10);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.add(this.mesh);
        this.position.set(x, y, z);
        this.rotateX(angleX);
        this.rotateZ(angleZ);
        scene.add(this);
    }
}

class Table extends THREE.Object3D {
    constructor(table_base, table_top, p1, p2, p3, p4, p5, p6) {
        'use strict';
        super();
        this.base = table_base;
        this.top = table_top;
        this.pocket_upLeft = p1;
        this.pocket_upRight = p2;
        this.pocket_downLeft = p3;
        this.pocket_downRight = p4;
        this.pocket_middleLeft = p5;
        this.pocket_middleRight = p6;
        this.top.add(this.pocket_upLeft);
        this.top.add(this.pocket_upRight);
        this.top.add(this.pocket_downLeft);
        this.top.add(this.pocket_downRight);
        this.top.add(this.pocket_middleLeft);
        this.top.add(this.pocket_middleRight);
        this.base.add(this.top);
    }
}


function createScene() {
    'use strict';

    scene = new THREE.Scene();
    scene.add(new THREE.AxisHelper(10));

    scene.add(new THREE.AmbientLight(0x404040)); //soft ambient light

    table_base = new TableBase(0, 0, 0, 15);
    table_top = new TableTop(0, table_base.height+2.5, 0, 60, 5, 30);
    pocket1 = new Pocket(-table_top.width/2+2, 0, -table_top.length/2+2, table_top.height);
    pocket2 = new Pocket(table_top.width/2-2, 0, -table_top.length/2+2, table_top.height);
    pocket3 = new Pocket(-table_top.width/2+2, 0, table_top.length/2-2, table_top.height);
    pocket4 = new Pocket(table_top.width/2-2, 0, table_top.length/2-2, table_top.height);
    pocket5 = new Pocket(0, 0, -table_top.length/2+2, table_top.height);
    pocket6 = new Pocket(0, 0, table_top.length/2-2, table_top.height);

    var cueHeight = table_base.height+ table_top.height + table_top.wall1.height/2;

    var stick1 = new CueStick(table_top.width/4, cueHeight, table_top.length, 20, -Math.PI/2, 0); //front
    var stick2 = new CueStick(-table_top.width/4, cueHeight, table_top.length, 20, -Math.PI/2, 0);

    var stick3 = new CueStick(table_top.width/4, cueHeight, -table_top.length, 20, Math.PI/2, 0); //back
    var stick4 = new CueStick(-table_top.width/4, cueHeight, -table_top.length, 20, Math.PI/2, 0);

    var stick5 = new CueStick(table_top.length + 20, cueHeight, 0, 20, Math.PI/2, Math.PI/2); //heads of the table
    var stick6 = new CueStick(-table_top.length - 20, cueHeight, 0, 20, Math.PI/2, -Math.PI/2);

    sticks.push(stick1);
    sticks.push(stick2);
    sticks.push(stick3);
    sticks.push(stick4);
    sticks.push(stick5);
    sticks.push(stick6);

    table = new Table(table_base, table_top, pocket1, pocket2, pocket3, pocket4, pocket5, pocket6);
    scene.add(table);

    //TEST BALL
    ball = new Ball(0, table_base.height+ table_top.height + 2.5, 0, 4, new THREE.Vector3(0,0,0), 5);
}

function createCamera() {
    'use strict';
    /*TOP CAMERA*/
    cameraTop = new THREE.OrthographicCamera( 0.5 * frustumSize * aspect / - 2, 0.5 * frustumSize * aspect / 2, 0.5* frustumSize / 2, 0.5 * frustumSize / - 2, 2, 2000 );
    cameraPerspective = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    cameraTop.position.set(0,frustumSize,0);
    cameraTop.lookAt(scene.position);
    scene.add(cameraTop);
    
    cameraPerspective.position.set(50, 50, 50);
    cameraPerspective.lookAt(scene.position);
    scene.add(cameraPerspective);

    camera = cameraTop;
}

function selectStick(id) {
    console.log(id);
    sticks[selected_stickID].material.color.setHex("0xF50176");
    selected_stickID = id - 1;
    sticks[selected_stickID].material.color.setHex("0xffffff");
}

function onResize() {
    'use strict';

    SCREEN_WIDTH = window.innerWidth;
	SCREEN_HEIGHT = window.innerHeight;
    aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

    renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

    camera.left = - 0.5 * frustumSize * aspect / 2;
    camera.right = 0.5 * frustumSize * aspect / 2;
    camera.top = 0.5 * frustumSize / 2;
    camera.bottom = - 0.5 *  frustumSize / 2;
    camera.updateProjectionMatrix();
}

function onKeyDown(e) {
    'use strict';
    keys[e.keyCode] = true;

    switch(e.keyCode) {
        case 49:
            camera = cameraTop;
            onResize();
            break;
        case 50:
            camera = cameraPerspective;
            onResize();
            break;
        case 52:
        case 53:
        case 54:
        case 55:
        case 56:
        case 57:
            selectStick(e.key - 3);
            onResize();
            break;
    }
}

function onKeyUp(e) {
    'use strict';
    keys[e.keyCode] = false;
}

function render() {
    'use strict';
    delta = clock.getDelta();
    keyPressed(delta);
    ball.updatePosition(delta);
    renderer.render(scene, camera);
}

function keyPressed() {
    if(keys[39]) {
        camera.position.x += 1;
    }
    if(keys[37]) {
        camera.position.x -= 1;
    }
}

function init() {
    'use strict';
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    clock = new THREE.Clock();
    clock.start();

    createScene();
    createCamera();

    render();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", onResize);

    clock = new THREE.Clock();
}


function animate() {
    "use strict";

    render();
    requestAnimationFrame(animate);
}