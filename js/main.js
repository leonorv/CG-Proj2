/*global THREE, requestAnimationFrame, console*/
var camera, scene, renderer;

var light, clock, delta;
var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;
var aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
var cameraFront, cameraTop, cameraSide;
var frustumSize = 100;
var table_base, table;

var keys = {

}

class TableBase extends THREE.Object3D {
    constructor(x, y, z, width, length, height) {
        'use strict';
        super();
        this.material = new THREE.MeshBasicMaterial({ color: 0x073417});
        this.geometry = new THREE.BoxGeometry(width, length, height);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.add(this.mesh);
        this.position.set(x, y, z);
    }
}

class Table extends THREE.Object3D {
    constructor(table_base) {
        'use strict';
        super();
        this.base = table_base;

    }
}


function createScene() {
    'use strict';

    scene = new THREE.Scene();
    scene.add(new THREE.AxisHelper(10));

    scene.add(new THREE.AmbientLight(0x404040)); //soft ambient light

    table_base = new TableBase(0, 0, 0, 30, 50, 20);
    scene.add(table_base);
}

function createCamera() {
    'use strict';
    /*TOP CAMERA*/
    cameraTop = new THREE.OrthographicCamera( 0.5 * frustumSize * aspect / - 2, 0.5 * frustumSize * aspect / 2, 0.5* frustumSize / 2, 0.5 * frustumSize / - 2, 2, 2000 );
    cameraTop.position.set(0,frustumSize,0);
    cameraTop.lookAt(scene.position);
    scene.add(cameraTop);

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
            onResize();
            break;
        case 50:
            camera = cameraTop;
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