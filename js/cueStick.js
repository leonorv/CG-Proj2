class CueStick extends THREE.Object3D {
    constructor(x, y, z, height, angleX, angleZ) {
        'use strict';
        super();
        this.height = height;
        this.material = new THREE.MeshBasicMaterial({ color: 0x3e0000, wireframe: false});
        this.geometry = new THREE.CylinderGeometry(0.5, 0.75, height, 10);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.angle = 0;
        this.limitLeft = -Math.PI/2;
        this.limitRight = Math.PI/2;
        this.add(this.mesh);
        this.rotateX(angleX);
        this.rotateZ(angleZ);
        this.geometry.translate(0, -this.height/2 - 1, 0);
        this.position.set(x, y, z);
        scene.add(this);
    }

    turnLeft(smallAngle) {
        if(this.angle > this.limitLeft) {
            this.rotateZ(smallAngle);
            this.angle -= smallAngle;
        }
    }

    turnRight(smallAngle) {
        if(this.angle < this.limitRight) {
            this.rotateZ(-smallAngle);
            this.angle += smallAngle;
        }
    }

    createBall() {
        var direction = new THREE.Vector3(Math.sin(this.angle), 0, Math.cos(this.angle));
        return new Ball(this.position.x, table_top.position.y + table_top.height/2 + 1, this.position.z, 1, direction, 20);

    }
}