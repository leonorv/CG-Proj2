const x_axis = new THREE.Vector3(1, 0, 0);
const y_axis = new THREE.Vector3(0, 1, 0);
const z_axis = new THREE.Vector3(0, 0, 1);

var camera, scene, renderer;

var clock, delta;
var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;
var aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
var cameraTop, cameraPerspective;
var frustumSize = 100;
var table_base, table, table_top;
var sticks = new Array();
var balls = new Array();

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
        this.rotateY(this.angle);

        this.friction = 3;
     
        this.axis = new THREE.AxisHelper(1.5*radius);

        this.add(this.mesh);
        this.add(this.axis);
        scene.add(this);

    }

    rotateVelocity(direction, angle){
		//var x = direction.x * Math.cos(angle) - direction.z * Math.sin(angle);
        //var z = direction.x * Math.sin(angle) + direction.z * Math.cos(angle);
        return new THREE.Vector3(x, 0, z).normalize();
    }

    checkCollisions(delta, walls) {
        this.checkWallCollisions(delta, walls);
    }

    checkWallCollisions(delta, walls) {
        walls.forEach(wall => this.checkWallCollision(wall));


    }
    checkWallCollision(wall) {
        if (wall.position.z == 0 && Math.abs(this.position.x) + this.radius >= Math.abs(wall.position.x)) {
            this.angle = this.direction.angleTo(z_axis);
            this.rotateY(this.angle);
        }

        if (wall.position.x == 0 && Math.abs(this.position.z) + this.radius >= Math.abs(wall.position.z)) {
            this.angle = this.direction.angleTo(x_axis);
            this.rotateY(this.angle);
        }
    }

    
    update(delta, walls){
        this.translateOnAxis(x_axis, this.velocity * delta / (2*this.radius));
        this.mesh.rotateZ(-this.velocity * delta /10 );
        if (this.velocity > 0) 
            this.velocity -= this.friction*delta;
    }
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
        this.pockets = new Array();
        this.material = new THREE.MeshBasicMaterial({ color: 0x073417});
        this.geometry = new THREE.BoxGeometry(width, height, length);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.add(this.mesh);
        this.position.set(x, y, z);
        this.walls = new Array();
        this.addWalls();
        scene.add(this);
    }

    addWalls() {
        this.walls.push(new Wall(this.width));
        this.walls[0].position.set(0, this.position.y + this.height, this.length/2);

        this.walls.push(new Wall(this.width));
        this.walls[1].position.set(0, this.position.y + this.height, -this.length/2);

        this.walls.push(new Wall(this.length));
        this.walls[2].position.set(this.width/2, this.position.y + this.height, 0);
        this.walls[2].rotateY(Math.PI/2)

        this.walls.push(new Wall(this.length));
        this.walls[3].position.set(-this.width/2, this.position.y + this.height, 0);
        this.walls[3].rotateY(Math.PI/2);

        for(var i; i < 4; i++) {
            this.add(this.walls[i]);
        }
    }

    addPockets() {
        this.pockets.push(new Pocket(-this.width/2+2, 0, -this.length/2+2, this.height)); //upleft
        this.pockets.push(new Pocket(this.width/2-2, 0, -this.length/2+2, this.height)); //upright
        this.pockets.push(new Pocket(-this.width/2+2, 0, this.length/2-2, this.height)); //downleft
        this.pockets.push(new Pocket(this.width/2-2, 0, this.length/2-2, this.height)); //downRight
        this.pockets.push(new Pocket(0, 0, -this.length/2+2, this.height)); //middleLeft
        this.pockets.push(new Pocket(0, 0, this.length/2-2, this.height)); //middleright
        for(var i; i < 6; i++) {
            this.add(pockets[i]);
        }
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
    constructor(table_base, table_top) {
        'use strict';
        super();
        this.base = table_base;
        this.top = table_top;
        this.base.add(this.top);
    }
}

function createBalls(n, radius) {
    for(var i = 0; i < n; i++) {
        var x = Math.random() * (table_top.width - 2*radius) - (table_top.width - 2*radius)/2;
        var z = Math.random() * (table_top.length - 2*radius) - (table_top.length - 2*radius)/2;
        var ball = new Ball(x, table_top.position.y + table_top.height, z, radius, new THREE.Vector3(0,0,0), 20);
        balls.push(ball);
        scene.add(ball);
    }
}

function createCueSticks() {
    var cueHeight = table_base.height+ table_top.height + table_top.walls[0].height/2;
    sticks.push(new CueStick(table_top.width/4, cueHeight, table_top.length, 20, -Math.PI/2, 0)); //front
    sticks.push(new CueStick(-table_top.width/4, cueHeight, table_top.length, 20, -Math.PI/2, 0));
    sticks.push(new CueStick(table_top.width/4, cueHeight, -table_top.length, 20, Math.PI/2, 0)); //back
    sticks.push(new CueStick(-table_top.width/4, cueHeight, -table_top.length, 20, Math.PI/2, 0));
    sticks.push(new CueStick(table_top.length + 20, cueHeight, 0, 20, Math.PI/2, Math.PI/2)); //heads of the table
    sticks.push(new CueStick(-table_top.length - 20, cueHeight, 0, 20, Math.PI/2, -Math.PI/2));
}

function createTable() {
    table_base = new TableBase(0, 0, 0, 15);
    table_top = new TableTop(0, table_base.height+2.5, 0, 60, 5, 30);
    table = new Table(table_base, table_top);
    scene.add(table);
}


function createScene() {
    'use strict';

    scene = new THREE.Scene();
    scene.add(new THREE.AxisHelper(10));
    scene.add(new THREE.AmbientLight(0x404040)); //soft ambient light

    createTable();
    createCueSticks();
    createBalls(15, 1.5);
}

function createCamera() {
    'use strict';
    /*TOP CAMERA*/
    cameraTop = new THREE.OrthographicCamera( 0.5 * frustumSize * aspect / - 2, 0.5 * frustumSize * aspect / 2, 0.5* frustumSize / 2, 0.5 * frustumSize / - 2, 2, 2000 );
    cameraPerspective = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    cameraTop.position.set(0,frustumSize,0);
    cameraTop.lookAt(scene.position);
    scene.add(cameraTop);
    /*PERSPECTIVE POSITION*/
    cameraPerspective.position.set(50, 50, 50);
    cameraPerspective.lookAt(scene.position);
    scene.add(cameraPerspective);

    camera = cameraTop;
}

function selectStick(id) {
    sticks[selected_stickID].material.color.setHex("0xF50176");
    selected_stickID = id - 1;
    sticks[selected_stickID].material.color.setHex("0xffffff");
}

function checkCollisions() {
    balls.forEach(ball => ball.checkCollisions(delta, table_top.walls));
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

    checkCollisions();
    balls.forEach(ball => ball.update(delta, table_top.walls));

    render();
    requestAnimationFrame(animate);
}