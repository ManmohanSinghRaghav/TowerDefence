class Particle {
    constructor(pos, speed) {
        this.pos = pos.copy();
        this.vel = p5.Vector.random2D().mult(random(-1, 1) * speed * ts / 75);
        this.color = [0, 0, 0];
        this.sides = 2;
        this.i = 1;
        this.lifespan = 24;
    }

    draw() {
        push();
        translate(this.pos.x, this.pos.y);
        image(cloneGif(effects.boom, this.i), -ts, -ts, ts*2, ts*2);
        pop();
    }

    isDead() {
        return this.i == this.lifespan;
    }
    
    run() {
        if (!paused) this.update();
        this.draw();
    }
    
    update() {
        this.pos.add(this.vel);
        this.i++;
    }
}


class Fire extends Particle {
    constructor(pos, speed) {
        super(pos, speed);
    }
}


class Bomb extends Particle {
    constructor(pos, speed) {
        super(pos, speed);
    }
}


class Shrapnel extends Fire {
    constructor(pos, speed) {
        super(pos, speed);
    }
}