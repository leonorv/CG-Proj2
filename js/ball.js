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
        this.position.set(x, y, z);
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

    rotateVelocity(velocity, angle){
		var x = velocity.x * Math.cos(angle) - velocity.z * Math.sin(angle);
		var z = velocity.x * Math.sin(angle) + velocity.z * Math.cos(angle);

        return new THREE.Vector3(x,0,z)
    }
    
    update(delta){
		this.translateOnAxis(x_axis, this.velocity * delta / 5);
        this.mesh.rotateZ(-this.velocity * delta /10 );
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