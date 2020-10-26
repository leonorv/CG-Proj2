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

    update(delta){
        if (table_top.checkWallCollision(this))
            this.treatWallCollision();
        else
            this.old_position.set(this.position.x, this.position.y, this.position.z);
        this.changeRotation();
        this.translateOnAxis(x_axis, this.velocity * delta/5);
        this.mesh.rotateZ(-this.velocity * delta/10);
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