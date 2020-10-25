class Wall extends THREE.Object3D {
    constructor(width) {
        'use strict'
        super()
        this.width = width;
        this.height = 2;
        this.length = 2;
        this.bounding_box;
        this.geometry = new THREE.BoxGeometry(this.width, this.height, this.length);
        this.material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide, wireframe: true} );
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.add(this.mesh);
        scene.add(this);
    }

    addBoundingBox() {
        this.bounding_box = new BoundingBox(new THREE.Vector3(this.position.x-this.width/2, this.position.y-this.height/2, this.position.z-this.length/2), 
            new THREE.Vector3(this.position.x+this.width/2, this.position.y+this.height/2, this.position.z+this.length/2));
        //this.add(this.bounding_box);
        this.material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide, wireframe: false} );
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.add(this.mesh);
        scene.add(this);
        console.log(this.bounding_box.min, this.bounding_box.max);
        console.log(this.position.x, this.position.y,this.position.z);
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
        this.walls[0].position.set(0, this.position.y + this.height/2 + this.walls[0].height/2, this.length/2 - this.walls[0].length/2);
        this.walls[0].addBoundingBox();

        this.walls.push(new Wall(this.width));
        this.walls[1].position.set(0, this.position.y + this.height/2 + this.walls[0].height/2, -this.length/2 + this.walls[1].length/2);
        this.walls[1].addBoundingBox();

        this.walls.push(new Wall(this.length));
        this.walls[2].position.set(this.width/2 - this.walls[2].length/2, this.position.y + this.height/2 + this.walls[0].height/2, 0);
        this.walls[2].addBoundingBox();
        this.walls[2].rotateY(Math.PI/2);

        this.walls.push(new Wall(this.length));
        this.walls[3].position.set(-this.width/2 + this.walls[2].length/2, this.position.y + this.height/2 + this.walls[0].height/2, 0);
        this.walls[3].addBoundingBox();
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

    wallCollided(ball) {
        if (this.walls[0].bounding_box.intersect(ball.bounding_box) && ball.direction.x > 0) {
            ball.direction.x *= -1;
            ball.changeDirection();
        }
        if (this.walls[1].bounding_box.intersect(ball.bounding_box) && ball.direction.x < 0) {
            ball.direction.x *= -1;
            ball.changeDirection();
        }
        if (this.walls[2].bounding_box.intersect(ball.bounding_box) && ball.direction.z > 0) {
    
            ball.direction.z *= -1;
            ball.changeDirection();
        }
        if (this.walls[3].bounding_box.intersect(ball.bounding_box) && ball.direction.z < 0) {
    
            ball.direction.z *= -1;
            ball.changeDirection();
        }
        ball.changeRotation();
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
