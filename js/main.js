const x_axis = new THREE.Vector3(1, 0, 0);
const y_axis = new THREE.Vector3(0, 1, 0);
const z_axis = new THREE.Vector3(0, 0, 1);
var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;
var fov = 50; //Camera frustum vertical field of view.
var far = 1000; //Camera frustum far plane.
var near = 1; //Camera frustum near plane.
var aspect = SCREEN_WIDTH / SCREEN_HEIGHT; //Camera frustum aspect ratio.
var frustumSize = 100;

var camera, scene, renderer;

var clock, delta;

var cameraTop, cameraPerspective, cameraFollower;
var table_base, table, table_top;
var sticks = new Array();
var balls = new Array();
var ball_colors = [0xfede2b, 0x3d72b4, 0xfe0037, 0x613686, 0xff7f3e, 0x57977c, 0xb16975, 0x585864];

var selected_stickID = 0;
var last_ballID = 0;
var smallAngle = 0.1;

var keys = {
    37: false, //left
    39: false, //right
    //CUE STICKS
    52: false, //4
    53: false, //5
    54: false, //6
    55: false, //7
    56: false, //8
    57: false, //9

    32: false, //space for shooting the ball
}

function createBalls(n, radius) {
    var done = false;
    for(var i = 0; i < n; i++) {
        while(!done) {
            done = true;
            var direction = new THREE.Vector3(Math.random() * 2 - 1, 0, Math.random() * 2 - 1).normalize();
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
        var ball = new Ball(x, table_top.position.y + table_top.height/2 + radius, z, radius, direction, 20);
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
    var cueHeight = table_base.height/2 + table_top.height + table_top.walls[0].height + 0.5;
    sticks.push(new CueStick(table_top.width/4, cueHeight, table_top.length/2 - table_top.walls[0].length - 1, 20, -Math.PI/2, 0)); //front
    sticks.push(new CueStick(-table_top.width/4, cueHeight, table_top.length/2 - table_top.walls[0].length - 1, 20, -Math.PI/2, 0));
    sticks.push(new CueStick(table_top.width/4, cueHeight, -table_top.length/2 + table_top.walls[0].length + 1, 20, Math.PI/2, 0)); //back
    sticks.push(new CueStick(-table_top.width/4, cueHeight, -table_top.length/2 + table_top.walls[0].length + 1, 20, Math.PI/2, 0));
    sticks.push(new CueStick(table_top.width/2 - table_top.walls[0].length - 1, cueHeight, 0, 20, Math.PI/2, Math.PI/2)); //heads of the table
    sticks.push(new CueStick(-table_top.width/2 + table_top.walls[0].length + 1, cueHeight, 0, 20, Math.PI/2, -Math.PI/2));
    sticks[selected_stickID].material.color.setHex("0x57977c");
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
    scene.background = new THREE.Color(0xD1BF9B);
    scene.add(new THREE.AxisHelper(10));

    createTable();
    createCueSticks();
    createBalls(15, 1);
}

function createCamera() {
    'use strict';
    cameraTop = new THREE.OrthographicCamera( 0.5 * frustumSize * aspect / - 2, 0.5 * frustumSize * aspect / 2, 0.5* frustumSize / 2, 0.5 * frustumSize / - 2, 2, 2000 );
    cameraPerspective = new THREE.PerspectiveCamera(fov, aspect, near, far);
    cameraFollower = new THREE.PerspectiveCamera(fov, aspect, near, far);
    /*TOP CAMERA*/
    cameraTop.position.set(0,frustumSize,0);
    cameraTop.lookAt(scene.position);
    scene.add(cameraTop);
    /*PERSPECTIVE POSITION*/
    cameraPerspective.position.set(50, 50, 50);
    cameraPerspective.lookAt(scene.position);
    scene.add(cameraPerspective);
    /*PERSPECTIVE POSITION FOR FOLLOW CAMERA*/
    cameraFollower.position.set(50, 50, 50);
    cameraFollower.lookAt(balls[last_ballID].position);
    scene.add(cameraFollower);

    camera = cameraTop;
}

function selectStick(id) {
    sticks[selected_stickID].material.color.setHex("0x3e0000");
    selected_stickID = id - 1;
    sticks[selected_stickID].material.color.setHex("0x57977c"); //selected color
}

function shootBall() {
    var ball = sticks[selected_stickID].createBall();
    ball.correctShootingBallPosition();
    ball.material.color.setHex(0xffffff);
    balls.push(ball);
    last_ballID = balls.length - 1;
    scene.add(ball);
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
        case 32: 
            shootBall();
            onResize();
            break;
        case 49:
            camera = cameraTop;
            onResize();
            break;
        case 50:
            camera = cameraPerspective;
            onResize();
            break;
        case 51:
            camera = cameraFollower;
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
    if(keys[37]) { //left
        sticks[selected_stickID].turnLeft(smallAngle);
    }
    if(keys[39]) { //right
        sticks[selected_stickID].turnRight(smallAngle);
    }
}

function updateCamera() {
    var ball_position = balls[last_ballID].position;
    var ball_direction = balls[last_ballID].direction;
    cameraFollower.position.set(ball_position.x - ball_direction.x*10, ball_position.y - ball_direction.y*10 + 5, ball_position.z - ball_direction.z*10);
    cameraFollower.lookAt(ball_position);
}

function updateScene() {
    for(var i = 0; i < balls.length; i++) {
        balls[i].update(delta, i);
    }
    updateCamera()
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

    updateScene();

    render();
    requestAnimationFrame(animate);
}