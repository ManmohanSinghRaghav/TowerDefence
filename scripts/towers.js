function createTower(x, y, template) {
    var t = new Tower(x, y);
    t.upgrade(template);
    t.onCreate();
    return t;
}


var tower = {};


tower.gun = {
    // Display
    color: [249, 191, 59],
    hasBase: false,
    length: 0.65,
    radius: 0.9,
    secondary: [149, 165, 166],
    // Misc
    name: 'gun',
    sound: 'gun',
    title: 'Gun Tower',
    // Stats
    cooldownMax: 18,
    cooldownMin: 8,
    cost: 25,
    range: 3,
    // Methods
    drawBarrel: function () {
        image(towerImage.gun, -ts / 2, -ts / 2, ts, ts);
    },

    // Upgrades
    upgrades: [
        {
            // Display
            color: [249, 105, 14],
            hasBase: false,
            // Misc
            name: 'machineGun',
            title: 'Machine Gun',
            // Stats
            cooldownMax: 5,
            cooldownMin: 0,
            cost: 75,
            damageMax: 10,
            damageMin: 0,
            drawBarrel: function () {
                image(towerImage.allGun.get(0, 0, 96, 96), -ts * 3 / 4, -ts * 3 / 4, ts * 3 / 2, ts * 3 / 2);
            }
        }
    ]
};

tower.laser = {
    // Display
    color: [25, 181, 254],
    hasBase: false,
    length: 0.55,
    radius: 0.8,
    secondary: [149, 165, 166],
    width: 0.25,
    // Misc
    name: 'laser',
    sound: 'laser',
    title: 'Laser Tower',
    // Stats
    cooldownMax: 1,
    cost: 75,
    damageMax: 3,
    range: 2,
    type: 'energy',
    i : 1,
    // Methods
    drawBarrel: function () {
        image(towerImage.allGun.get(0, 96, 96, 96), -ts * 3 / 4, -ts * 3 / 4, ts * 3 / 2, ts * 3 / 2);
    },
    onAim(e) {
        if (this.canFire() || this.follow) this.aim(e.pos.x, e.pos.y);
        if (stopFiring) return;
        if (!this.canFire()) return;
        this.resetCooldown();
        this.attack(e);
        // Draw line to target
        if (this.i === 3) this.i = 1;
        push();
        stroke(this.color);
        strokeWeight(this.weight);
        line(this.pos.x, this.pos.y, e.pos.x, e.pos.y);
        strokeWeight(1);
        translate(e.pos.x, e.pos.y);
        image(cloneGif(effects.spark, this.i), -ts/2, -ts/2, ts, ts)
        this.i++;
        pop();
    },
    // Upgrades
    upgrades: [
        {
            // Display
            color: [78, 205, 196],
            hasBase: false,
            length: 0.65,
            radius: 0.9,
            secondary: [191, 191, 191],
            weight: 3,
            width: 0.35,
            // Misc
            name: 'beamEmitter',
            title: 'Beam Emitter',
            // Stats
            cooldownMax: 0,
            cost: 200,
            damageMax: 0.1,
            damageMin: 0.001,
            range: 3,
            // Methods
            attack: function (e) {
                if (this.lastTarget === e) {
                    this.duration++;
                } else {
                    this.lastTarget = e;
                    this.duration = 0;
                }
                //var damage = this.damageMin * pow(2, this.duration);
                var d = random(this.damageMin, this.damageMax);
                var damage = d * sq(this.duration);
                e.dealDamage(damage, this.type);
                this.onHit(e);
            },
            drawBarrel: function () {
                image(towerImage.allGun.get(96, 96 * 3, 96, 96), -ts * 3 / 4, -ts * 3 / 4, ts * 3 / 2, ts * 3 / 2);
            },
        }
    ]
};

tower.slow = {
    // Display
    baseOnTop: false,
    color: [255, 0, 0],
    hasBase: false,
    drawLine: false,
    length: 1.1,
    radius: 0.9,
    secondary: [189, 195, 199],
    width: 0.3,
    // Misc
    name: 'slow',
    title: 'Slow Tower',
    // Stats
    cooldownMax: 0,
    cooldownMin: 0,
    cost: 100,
    damageMax: 0,
    damageMin: 0,
    range: 1,
    type: 'slow',
    // Methods
    drawBarrel: function () {
        image(towerImage.slow.get(0, 128 * 4, 128, 128), -ts / 2, -ts / 2, ts, ts);
    },
    onAim: function (e) {
        this.attack(e);
    },
    onHit: function (e) {
        e.applyEffect('slow', 40);
    },
    // Target correct enemy
    target: function (entities) {
        if (stopFiring) return;
        entities = this.visible(entities);
        if (entities.length === 0) return;
        if (!this.canFire()) return;
        this.resetCooldown();
        noStroke();
        fill(this.color[0], this.color[1], this.color[2], 50);
        var r = this.range * 2 + 1;
        ellipse(this.pos.x, this.pos.y, r * ts, r * ts);
        for (var i = 0; i < entities.length; i++) {
            this.onAim(entities[i]);
        }
    },
    update() {
        this.angle += PI / 60;
        if (this.cd > 0) this.cd--;
    },
    // Upgrades
    upgrades: [
        {
            // Display
            color: [102, 204, 26],
            hasBase: false,
            radius: 0.9,
            // Misc
            name: 'poison',
            title: 'Poison Tower',
            // Stats
            cooldownMax: 60,
            cooldownMin: 60,
            cost: 150,
            range: 2,
            type: 'poison',
            // Methods
            onHit: function (e) {
                e.applyEffect('poison', 60);
            },
            drawBarrel: function () {
                image(towerImage.slowUp.get(0, 128 * 4, 128, 128), -ts / 2, -ts / 2, ts, ts);
            },
        }
    ]
};

tower.sniper = {
    // Display
    color: [207, 0, 15],
    hasBase: false,
    follow: false,
    radius: 0.9,
    weight: 3,
    // Misc
    name: 'sniper',
    sound: 'sniper',
    title: 'Sniper Tower',
    // Stats
    cooldownMax: 100,
    cooldownMin: 60,
    cost: 150,
    damageMax: 100,
    damageMin: 100,
    range: 9,
    // Methods
    drawBarrel: function () {
        image(towerImage.snip, -ts / 4, -ts * 3 / 4, ts / 2, ts * 3 / 2);
    },
    target(entities) {
        if (stopFiring) return;
        entities = this.visible(entities);
        if (entities.length === 0) return;
        var t = getTaunting(entities);
        if (t.length > 0) entities = t;
        var e = getStrongest(entities);
        if (typeof e === 'undefined') return;
        this.onAim(e);
    },
    // Upgrades
    upgrades: [
        {
            // Display
            color: [103, 65, 114],
            hasBase: false,
            length: 0.7,
            radius: 1,
            secondary: [103, 128, 159],
            weight: 4,
            width: 0.4,
            // Misc
            name: 'railgun',
            sound: 'railgun',
            title: 'Railgun',
            // Stats
            cooldownMax: 120,
            cooldownMin: 100,
            cost: 300,
            damageMax: 200,
            damageMin: 200,
            range: 11,
            type: 'piercing',
            // Methods
            drawBarrel: function () {
                image(towerImage.snipUp, -ts / 4, -ts * 3 / 4, ts / 2, ts * 3 / 2);
            },
            onHit: function (e) {
                var blastRadius = 1;
                var inRadius = getInRange(e.pos.x, e.pos.y, blastRadius, enemies);
                noStroke();
                fill(this.color[0], this.color[1], this.color[2], 127);
                ellipse(e.pos.x, e.pos.y, ts * 2.5, ts * 2.5);
                if (showEffects) {
                    var s = new ShrapnelExplosion(e.pos.x, e.pos.y);
                    for (var i = 0; i < particleAmt; i++) {
                        s.addParticle();
                    }
                    systems.push(s);
                }
                for (var i = 0; i < inRadius.length; i++) {
                    var h = inRadius[i];
                    var amt = round(random(this.damageMin, this.damageMax));
                    h.dealDamage(amt, this.type);
                }
            }
        }
    ]
};

tower.rocket = {
    // Display
    color: [30, 130, 76],
    hasBarrel: false,
    drawLine: false,
    length: 0.6,
    radius: 0.75,
    secondary: [189, 195, 199],
    width: 0.2,
    // Misc
    name: 'rocket',
    sound: 'missile',
    title: 'Rocket Tower',
    // Stats
    cooldownMax: 80,
    cooldownMin: 60,
    cost: 250,
    range: 7,
    damageMax: 60,
    damageMin: 40,
    type: 'explosion',
    // Methods
    drawBase: function () {
        image(towerImage.mBase, this.pos.x - ts / 2, this.pos.y - ts / 2, ts, ts);
    },
    onAim(e) {
        if (this.canFire() || this.follow) this.aim(e.pos.x, e.pos.y);
        if (stopFiring) return;
        if (!this.canFire()) return;
        this.resetCooldown();
        projectiles.push(new Missile(this.pos.x, this.pos.y, e));
        if (!muteSounds && sounds.hasOwnProperty(this.sound)) {
            sounds[this.sound].play();
        }
    },
    // Upgrades
    upgrades: [
        {
            // Display
            color: [65, 131, 215],
            secondary: [108, 122, 137],
            // Misc
            name: 'missileSilo',
            sound: 'missile',
            title: 'Missile Silo',
            // Stats
            cooldownMax: 80,
            cooldownMin: 40,
            cost: 250,
            damageMax: 120,
            damageMin: 100,
            range: 9,
            // Methods
            drawBase: function () {
                image(towerImage.mBase, this.pos.x - ts / 2, this.pos.y - ts / 2, ts, ts);
            },
            onAim(e) {
                if (this.canFire() || this.follow) this.aim(e.pos.x, e.pos.y);
                if (stopFiring) return;
                if (!this.canFire()) return;
                this.resetCooldown();
                var m = new Missile(this.pos.x, this.pos.y, e);
                m.image = towerImage.missileUp;
                m.secondary = this.secondary;
                m.blastRadius = 2;
                m.damageMax = this.damageMax;
                m.damageMin = this.damageMin;
                m.accAmt = 0.7;
                m.topSpeed = (6 * 24) / ts;
                projectiles.push(m);
                if (!muteSounds && sounds.hasOwnProperty(this.sound)) {
                    sounds[this.sound].play();
                }
            },
        }
    ]
};

tower.bomb = {
    // Display
    baseOnTop: false,
    color: [102, 51, 153],
    hasBase: false,
    drawLine: false,
    length: 0.6,
    width: 0.35,
    secondary: [103, 128, 159],
    // Misc
    name: 'bomb',
    title: 'Bomb Tower',
    // Stats
    cooldownMax: 60,
    cooldownMin: 40,
    cost: 250,
    damageMax: 60,
    damageMin: 20,
    range: 2,
    type: 'explosion',
    // Methods
    drawBarrel: function () {
        image(towerImage.bomb, -ts / 2, -ts / 2, ts, ts);
    },
    onHit: function (e) {
        var blastRadius = 1;
        var inRadius = getInRange(e.pos.x, e.pos.y, blastRadius, enemies);
        noStroke();
        fill(191, 85, 236, 127);
        ellipse(e.pos.x, e.pos.y, ts * 2.5, ts * 2.5);
        if (showEffects) {
            var s = new BombExplosion(e.pos.x, e.pos.y);
            s.addParticle();
            systems.push(s);
        }
        for (var i = 0; i < inRadius.length; i++) {
            var h = inRadius[i];
            var amt = round(random(this.damageMin, this.damageMax));
            h.dealDamage(amt, this.type);
        }
    },
    upgrades: [
        {
            // Display
            radius: 1.1,
            // Misc
            name: 'clusterBomb',
            title: 'Cluster Bomb',
            // Stats
            cooldownMax: 80,
            cooldownMin: 40,
            cost: 250,
            damageMax: 140,
            damageMin: 100,
            // Methods
            drawBarrel: function () {
                image(towerImage.bombUp, -ts / 2, -ts / 2, ts, ts);
            },
            onHit: function (e) {
                var blastRadius = 1;
                var inRadius = getInRange(e.pos.x, e.pos.y, blastRadius, enemies);
                noStroke();
                fill(191, 85, 236, 127);
                ellipse(e.pos.x, e.pos.y, ts * 2.5, ts * 2.5);
                if (showEffects) {
                    var s = new BombExplosion(e.pos.x, e.pos.y);
                    s.addParticle();
                    systems.push(s);
                }
                var segs = 10;
                var a0 = random(0, TWO_PI);
                for (var i = 0; i < segs; i++) {
                    var a = TWO_PI / segs * i + a0;
                    var d = ts / 2;
                    var x = e.pos.x + cos(a) * d;
                    var y = e.pos.y + sin(a) * d;
                    var inRadius = getInRange(x, y, blastRadius, enemies);
                    if (showEffects) {
                        var s = new BombExplosion(x, y);
                        s.addParticle();
                        systems.push(s);
                    }
                }
                for (var j = 0; j < inRadius.length; j++) {
                    var h = inRadius[j];
                    var amt = round(random(this.damageMin, this.damageMax));
                    h.dealDamage(amt, this.type);
                }
            }
        }
    ]
};

tower.tesla = {
    // Display
    color: [255, 255, 0],
    hasBase: false,
    // hasBase: false,
    radius: 1,
    secondary: [30, 139, 195],
    weight: 3,
    // Misc
    name: 'tesla',
    sound: 'spark',
    title: 'Tesla Coil',
    // Stats
    cooldownMax: 80,
    cooldownMin: 60,
    cost: 350,
    damageMax: 512,
    damageMin: 256,
    range: 4,
    type: 'energy',
    // Methods
    drawBarrel: function () {
        image(towerImage.tesla, -ts / 2, -ts / 2, ts, ts);
    },
    onAim(e) {
        if (this.canFire() || this.follow) this.aim(e.pos.x, e.pos.y);
        if (stopFiring) return;
        if (!this.canFire()) return;
        this.resetCooldown();

        var last = e;
        var targets = [];
        var dmg = round(random(this.damageMin, this.damageMax));
        var weight = this.weight;

        stroke(this.color);
        strokeWeight(weight);
        line(this.pos.x, this.pos.y, e.pos.x, e.pos.y);
        if (!muteSounds && sounds.hasOwnProperty(this.sound)) {
            sounds[this.sound].play();
        }
        while (dmg > 1) {
            weight -= 1;
            last.dealDamage(dmg, this.type);
            targets.push(last);
            var next = getNearest(enemies, last.pos, targets);
            if (typeof next === 'undefined') break;
            strokeWeight(weight);
            var x = random(last.pos.x, next.pos.x);
            var y = random(last.pos.y, next.pos.y);
            line(last.pos.x, last.pos.y, x, y);
            line(x, y, next.pos.x, next.pos.y);
            last = next;
            dmg /= 2;
        }
        strokeWeight(1);
    },
    // Upgrades
    upgrades: [
        {
            // Display
            color: [25, 181, 254],
            hasBase: false,
            radius: 1.1,
            secondary: [51, 110, 123],
            // Misc
            name: 'plasma',
            title: 'Plasma Tower',
            // Stats
            cooldownMax: 60,
            cooldownMin: 40,
            cost: 250,
            damageMax: 2048,
            damageMin: 1024,
            // Methods
            drawBarrel: function () {
                image(towerImage.teslaUp, -ts / 2, -ts / 2, ts, ts);
            },
            onAim(e) {
                if (this.canFire() || this.follow) this.aim(e.pos.x, e.pos.y);
                if (stopFiring) return;
                if (!this.canFire()) return;
                this.resetCooldown();

                var last = e;
                var targets = [];
                var dmg = round(random(this.damageMin, this.damageMax));
                var weight = this.weight;
                stroke(this.color);
                strokeWeight(weight);
                line(this.pos.x, this.pos.y, e.pos.x, e.pos.y);
                if (!muteSounds && sounds.hasOwnProperty(this.sound)) {
                    sounds[this.sound].play();
                }
                while (dmg > 1) {
                    weight -= 1;
                    last.dealDamage(dmg, this.type);
                    targets.push(last);
                    var next = getNearest(enemies, last.pos, targets);
                    if (typeof next === 'undefined') break;
                    strokeWeight(weight);
                    var x = random(last.pos.x, next.pos.x);
                    var y = random(last.pos.y, next.pos.y);
                    line(last.pos.x, last.pos.y, x, y);
                    line(x, y, next.pos.x, next.pos.y);
                    last = next;
                    dmg /= 2;
                }
                strokeWeight(1);
            },
        }
    ]
};
