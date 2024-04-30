function createEnemy(x, y, template) {
    var e = new Enemy(x, y);
    // Fill in all keys
    template = typeof template === 'undefined' ? {} : template;
    var keys = Object.keys(template);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        e[key] = template[key];
    }
    e.onCreate();
    return e;
}

let checkImg;

var enemy = {};


enemy.weak = {
    // Display
    color: [189, 195, 199],
    // Misc
    name: 'weak',
    // Stats
    cash: 1,
    health: 35,
    draw: function () {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());
        imageMode(CENTER);
        image(enemyImg.weak, 0, 0, ts, ts)
        pop();
    }
};

enemy.strong = {
    // Display
    color: [108, 122, 137],
    radius: 0.6,
    // Misc
    name: 'strong',
    // Stats
    cash: 1,
    health: 75,
    draw: function () {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());
        imageMode(CENTER);
        image(enemyImg.strong, 0, 0, ts, ts)
        pop();
    }
};

enemy.fast = {
    // Display
    color: [61, 251, 255],
    // Misc
    name: 'fast',
    // Stats
    cash: 2,
    health: 75,
    speed: 2,
    // Methods
    draw: function () {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());
        imageMode(CENTER);
        image(enemyImg.fast, 0, 0, ts, ts)
        pop();
    }
};

enemy.strongFast = {
    // Display
    color: [30, 139, 195],
    // Misc
    name: 'strongFast',
    // Stats
    cash: 2,
    health: 135,
    speed: 2,
    // Methods
    draw: function () {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());
        imageMode(CENTER);
        image(enemyImg.strongFast, 0, 0, ts, ts)
        pop();
    }
};

enemy.medic = {
    // Display
    color: [192, 57, 43],
    radius: 0.7,
    // Misc
    name: 'medic',
    // Stats
    cash: 4,
    health: 375,
    immune: ['regen'],
    // Methods
    onTick: function () {
        var affected = getInRange(this.pos.x, this.pos.y, 2, enemies);
        for (var i = 0; i < affected.length; i++) {
            affected[i].applyEffect('regen', 1);
        }
    },
    draw: function () {
        let base = enemyImg.medicBase.get(0, 128*4, 128, 128)
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());
        imageMode(CENTER);
        image(enemyImg.medic, 0, 0, ts, ts)
        image(base, 0, 0, ts/2, ts/2)
        pop();
    }
};

enemy.stronger = {
    // Display
    color: [52, 73, 94],
    radius: 0.8,
    // Misc
    name: 'stronger',
    // Stats
    cash: 4,
    health: 375,
    draw: function () {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());
        imageMode(CENTER);
        image(enemyImg.stronger, 0, 0, ts, ts)
        image(enemyImg.strongerBase, 0, 0, ts/2, ts/2)
        pop();
    }
};

enemy.faster = {
    // Display
    color: [249, 105, 14],
    // Misc
    name: 'faster',
    // Stats
    cash: 4,
    health: 375,
    resistant: ['explosion'],
    speed: 3,
    // Methods
    draw: function () {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());
        imageMode(CENTER);
        image(enemyImg.faster, 0, 0, ts, ts)
        pop();
    }
};

enemy.tank = {
    // Display
    color: [30, 130, 76],
    radius: 1,
    // Misc
    name: 'tank',
    // Stats
    cash: 4,
    health: 750,
    immune: ['poison', 'slow'],
    resistant: ['energy', 'physical'],
    weak: ['explosion', 'piercing'],
    // Methods
    draw: function () {
        let base = enemyImg.tankBase.get(0, 0, 128, 128)
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());
        imageMode(CENTER);
        image(enemyImg.tank, 0, 0, ts, ts)
        image(base, 1, 0, ts+4, ts)
        pop();
    }
};

enemy.taunt = {
    // Display
    color: [102, 51, 153],
    radius: 0.8,
    // Misc
    name: 'taunt',
    sound: 'taunt',
    // Stats
    cash: 8,
    health: 1500,
    immune: ['poison', 'slow'],
    resistant: ['energy', 'physical'],
    taunt: true,
    // Methods
    draw: function () {
        let base1 = enemyImg.tauntBase.get(0, 0, 128, 128)
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());
        imageMode(CENTER);
        image(enemyImg.taunt, 0, 0, ts, ts)
        image(base1, 0, 0, ts/2, ts/2)
        image(base1, 0, 0, ts/3, ts/3)
        pop();
    }
};

enemy.spawner = {
    // Display
    color: [244, 232, 66],
    radius: 0.7,
    // Misc
    name: 'spawner',
    // Stats
    cash: 10,
    health: 1150,
    // Methods
    onKilled: function () {
        if (this.alive) {
            cash += this.cash;
            this.kill();
            if (!muteSounds && sounds.hasOwnProperty(this.sound)) {
                sounds[this.sound].play();
            }

            // Add new temporary spawnpoint
            var c = gridPos(this.pos.x, this.pos.y);
            if (c.equals(exit)) return;
            for (var i = 0; i < tempSpawns.length; i++) {
                if (c.equals(tempSpawns[i][0])) return;
            }
            tempSpawns.push([createVector(c.x, c.y), tempSpawnCount]);
        }
    },
    draw: function () {
        let base1 = enemyImg.tauntBase.get(0, 0, 128, 128)
        let base2 = enemyImg.tauntBase.get(0, 128*4, 128, 128)
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());
        imageMode(CENTER);
        image(enemyImg.spawner, 0, 0, ts, ts)
        image(base1, 0, 0, ts/2, ts/2)
        image(base2, 0, 0, ts/3, ts/3)
        pop();
    }
};
