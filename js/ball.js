class BoundingBox extends THREE.Object3D {
    constructor(min, max) {
        'use strict'
        super();
        this.min = min;
        this.max = max;
    }

    intersect(other) {
        return (this.min.x <= other.max.x && this.max.x >= other.min.x) &&
        (this.min.z <= other.max.z && this.max.z >= other.min.z);
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
        this.hasCollided_x = false;
        this.hasCollided_z = false;
        this.hasBallCollided = false;
        this.friction = 0.05;
        this.position.set(x, y, z);
        this.old_position = new THREE.Vector3(this.position.x,this.position.y,this.position.z);
        this.bounding_box = new BoundingBox(new THREE.Vector3(x-radius, y-radius, z-radius), new THREE.Vector3(x+radius, y+radius, z+radius));
        
        this.geometry = new THREE.SphereGeometry(this.radius, 10, 10);
        this.material = new THREE.MeshBasicMaterial( {color: 0xffffff, wireframe: true} );
        this.mesh = new THREE.Mesh(this.geometry, this.material);

        if (this.direction.x != 0 && this.direction.z >= 0)
            this.angle = -this.direction.angleTo(x_axis);

        else if (this.direction.x != 0 && this.direction.z < 0)
            this.angle = this.direction.angleTo(x_axis);

        this.rotateY(this.angle);

        this.dirChanged = false;
     
        this.axis = new THREE.AxisHelper(1.5*radius);

        this.add(this.mesh);
        this.add(this.axis);
        scene.add(this);
    }

    update(delta, i){
        if (table_top.checkWallCollision(this))
            this.treatWallCollision();
        else
            if (!checkBallCollision(this, i))
                this.old_position.set(this.position.x, this.position.y, this.position.z);
        this.changeRotation();
        this.translateOnAxis(x_axis, this.velocity * delta/this.radius);
        this.mesh.rotateZ(-this.velocity * delta/2*this.radius);
        if (this.velocity >= this.friction)
            this.velocity-=this.friction;
        else
            this.velocity = 0;
    }

    treatWallCollision() {
        if (this.hasCollided_x) {
            this.position.set(this.old_position.x, this.old_position.y, this.old_position.z);
            this.direction.x *= -1;
            this.changeDirection();
            this.hasCollided_x = false;
        }
        else if (this.hasCollided_z) {
            this.position.set(this.old_position.x, this.old_position.y, this.old_position.z);
            this.direction.z *= -1;
            this.changeDirection();
            this.hasCollided_z = false;
        }
    }

    treatBallCollision(other) {
        if (this.hasBallCollided) {

            this.position.set(this.old_position.x, this.old_position.y, this.old_position.z);
            other.position.set(other.old_position.x, other.old_position.y, other.old_position.z);

            var v1 = this.velocity;
            var v2 = other.velocity;

            this.velocity = v2;
            other.velocity = v1;

            var dx1 = this.direction.x;
            var dz1 = this.direction.z;

            var dx2 = other.direction.x;
            var dz2 = other.direction.z;

            this.direction.x = dx2;
            this.direction.z = dz2;

            other.direction.x = dx1;
            other.direction.z = dz1;

            if (dx2 != 0 && dz2 != 0) this.dirChanged = true; 
            if (dx1 != 0 && dz1 != 0) other.dirChanged = true;

            other.changeRotation();

            this.hasBallCollided = false;
        }
    }

    changeDirection() {
        this.dirChanged = true;
    }

    changeRotation() {
        if (!this.dirChanged) return;

        this.rotateY(-this.angle);

        var newAngle = this.direction.angleTo(x_axis);

        newAngle = (this.direction.z < 0) ? newAngle : -newAngle;

        this.angle = newAngle;
        this.rotateY( this.angle );

        this.dirChanged = false;
    }
}