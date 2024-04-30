class Scrap {
    constructor(x, y) {
        // Position
        this.x = x;
        this.y = y;
        this.ashRemains = 0;        // no. of frames remain to show ashes
        this.ashTime = 200;          // total no. of frames to show ashes
        this.rnd = random(0, 180);
    }
    
    draw() {
        push();
        translate(this.x, this.y);
        rotate(PI/180*this.rnd);
        tint(255, ((this.ashTime - this.ashRemains ) / this.ashTime) * 255);
        image(effects.dead, -ts / 2, -ts / 2, ts, ts);
        pop();
    }
    update() {
        this.ashRemains++;
    }

    isDead() {
        return this.ashRemains === this.ashTime;
    }
}
