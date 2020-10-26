class Wall extends THREE.Object3D {
    constructor(width) {
        'use strict'
        super()
        this.width = width;
        this.height = 2;
        this.length = 2;
        this.min;
        this.max;
        this.geometry = new THREE.BoxGeometry(this.width, this.height, this.length);
        this.material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide, wireframe: true} );
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.add(this.mesh);
        scene.add(this);
    }

    addBoundingBox() {
        this.min = new THREE.Vector3(-25, 0, -10);
        this.max = new THREE.Vector3(25, 0, 10);
        this.material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide, wireframe: false} );
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.add(this.mesh);
        scene.add(this);
    }

    intersect(other) {
        return (this.min.x <= other.max.x && this.max.x >= other.min.x) &&
        (this.min.z <= other.max.z && this.max.z >= other.min.z);
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
        this.walls[0].position.set(0, this.height/2 + this.walls[0].height/2, this.length/2 - this.walls[0].length/2);
        this.walls[0].addBoundingBox();

        this.walls.push(new Wall(this.width));
        this.walls[1].position.set(0, this.height/2 + this.walls[0].height/2, -this.length/2 + this.walls[1].length/2);
        this.walls[1].addBoundingBox();

        this.walls.push(new Wall(this.length));
        this.walls[2].position.set(this.width/2 - this.walls[2].length/2, this.height/2 + this.walls[0].height/2, 0);
        this.walls[2].rotateY(Math.PI/2);
        this.walls[2].addBoundingBox();

        this.walls.push(new Wall(this.length));
        this.walls[3].position.set(-this.width/2 + this.walls[2].length/2, this.height/2 + this.walls[0].height/2, 0);
        this.walls[3].rotateY(Math.PI/2);
        this.walls[3].addBoundingBox();

        for(var i = 0; i < 4; i++) {
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

    checkWallCollision(ball) {
        if (table_top.width/2-table_top.walls[0].length < Math.abs(ball.position.x)+1.5) {
            ball.hasCollided_x = true;
            return true;
        }
        /*if (-table_top.width/2 < Math.abs(ball.position.x) + 1.5 && Math.abs(ball.position.x) + 1.5 < -table_top.width/2 && ball.direction.x < 0) {
            ball.direction.x *= -1;
            ball.changeDirection();
        }*/
        if (table_top.length/2-table_top.walls[0].length < Math.abs(ball.position.z) + 1.5) {
            ball.hasCollided_z = true;
            return true;
            //ball.old_position.set(ball.position.x, ball.position.y, ball.position.z);
        }
        /*if (-table_top.length/2 < Math.abs(ball.position.z)+1.5 && Math.abs(ball.position.z)+1.5 < -table_top.length/2  && ball.direction.z < 0) {
            ball.direction.z *= -1;
            ball.changeDirection();
        }*/
        return false;
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

class Table extends THREE.Object3D {
    constructor(table_base, table_top) {
        'use strict';
        super();
        this.base = table_base;
        this.top = table_top;
        this.base.add(this.top);
    }
}
