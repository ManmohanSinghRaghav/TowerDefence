var tiles = {
    // Basic
    empty: 'empty',
    tower: 'tower',
    wall: 'wall',
    // City
    grass: 'grass',
    lCorner: function (x, y, dir) {
        if (dir === 0) {
            image(Imgs.Road.get(128 * 3, 128 * 5, 128, 128), x * ts, y * ts, ts, ts);
            return;
        }
        push();
        var c = center(x, y);
        translate(c.x, c.y);
        rotate([PI / 2, PI, PI * 3 / 2][dir - 1]);
        image(Imgs.Road.get(128 * 4, 128 * 3, 128, 128), -ts / 2, -ts / 2, ts, ts);
        pop();
    },
    rCorner: function (x, y, dir) {
        if (dir === 0) {
            image(Imgs.Road.get(128 * 3, 128 * 5, 128, 128), x * ts, y * ts, ts, ts);
            return;
        }
        push();
        var c = center(x, y);
        translate(c.x, c.y);
        rotate([PI, PI * 3 / 2, 0, PI / 2][dir - 1]);
        image(Imgs.Road.get(128 * 4, 128 * 3, 128, 128), -ts / 2, -ts / 2, ts, ts);
        pop();
    },
    road: function (x, y, dir) {
        if (dir === 0) {
            image(Imgs.Road.get(128 * 6, 128 * 3, 128, 128), x * ts, y * ts, ts, ts);
            return;
        }
        push();
        var c = center(x, y);
        translate(c.x, c.y);
        rotate([0, PI / 2][(dir) % 2]);
        image(Imgs.Road.get(128 * 3, 128 * 3, 128, 128), -ts / 2, -ts / 2, ts, ts);
        pop();
    },

    sidewalk: 'sidewalk',
};
