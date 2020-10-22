/*global THREE, requestAnimationFrame, console*/
var camera, scene, renderer;

var light, clock, delta;
var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;
var aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
var cameraTop, cameraPerspective;
var frustumSize = 100;
var table_base, table, table_top;
var pocket1, pocket2, pocket3, pocket4, pocket5, pocket6;
var stick1;

var keys = {

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
        scene.add(this);
        console.log(this.position);
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
        console.log(this.position);
    }
}

class Pocket extends THREE.Object3D {
    constructor(x, y, z, height) {
        'use strict';
        super();
        this.height = height;
        this.material = new THREE.MeshBasicMaterial({ color: 0x000000});
        this.geometry = new THREE.CylinderGeometry(2, 2, this.height, 30);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.add(this.mesh);
        this.position.set(x, y, z);
        scene.add(this);
    }
}

class CueStick extends THREE.Object3D {
    constructor(x, y, z, height) {
        'use strict';
        super();
        this.height = height;
        this.material = new THREE.MeshBasicMaterial({ color: 0xffffff});
        this.geometry = new THREE.CylinderGeometry(0.5, 0.75, height, 30);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.add(this.mesh);
        this.position.set(x, y, z);
        this.rotateX(-Math.PI/2);
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
    stick1 = new CueStick(table_top.width/4, table_top.height/2, table_top.length/4+20, 20);
    table = new Table(table_base, table_top, pocket1, pocket2, pocket3, pocket4, pocket5, pocket6);
    scene.add(table);
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
        case 51:
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

function keyPressed(delta) {
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
}

function animate() {
    'use strict';
    render();
    requestAnimationFrame(animate);
}