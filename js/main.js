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
var ball_colors = [0xfede2b, 0x3d72b4, 0xfe0037, 0x613686, 0xff7f3e, 0x57977c, 0xb16975, 0x585864];

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

function createBalls(n, radius) {
    var done = false;
    for(var i = 0; i < n; i++) {
        while(!done) {
            done = true;
            var x = Math.floor(Math.random() * ((table_top.width/2-radius-table_top.walls[0].length) - (-table_top.width/2+radius+table_top.walls[0].length))) + (-table_top.width/2+radius+table_top.walls[0].length);
            var z = Math.floor(Math.random() * ((table_top.length/2-radius-table_top.walls[0].length) - (-table_top.length/2+radius+table_top.walls[0].length))) + (-table_top.length/2+radius+table_top.walls[0].length);
            balls.forEach(other => {
                var dx = x - other.position.x;
                var dz = z - other.position.z;
                if (radius + other.radius >= Math.sqrt(dx*dx+dz*dz)) {
                    done = false;
                }
            });
        } 
        var ball = new Ball(x, table_top.position.y + table_top.height, z, radius, new THREE.Vector3(0,0,0), 20);
        balls.push(ball);
        scene.add(ball);
        done = false;
    }
}

function checkBallCollision(ball, i) {
    for (var j=i+1; j<balls.length; j++) {
        if (balls[i] != balls[j]) {
            var dx = balls[i].position.x - balls[j].position.x;
            var dz = balls[i].position.z - balls[j].position.z;

            if (balls[i].radius + balls[j].radius >= Math.sqrt(dx*dx+dz*dz)) {
                balls[i].hasBallCollided = true;
                balls[i].treatBallCollision(balls[j]);
            }
        }
    }
    ball.changeRotation();
    return ball.hasBallCollided;
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
    table_top = new TableTop(0, table_base.height/2+2.5, 0, 60, 5, 30);
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
    createBalls(15, 1);
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

    for(var i = 0; i < balls.length; i++) {
        balls[i].update(delta, i);
    }
    //balls.forEach(ball => table_top.wallCollided(ball));

    render();
    requestAnimationFrame(animate);
}