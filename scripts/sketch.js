document.body.onclick = () => sounds.mClick.play();

function changeVolume(vB = 0, vM = 0, pS = 0) {
    vB = vB / 100;
    vM = vM / 100;

    if (pS == 0) {
        sounds.Win.pause();
        sounds.home.pause();
        sounds.background.pause();
        sounds.background.setVolume(vB);
        sounds.background.loop();
    }

    if (pS == 0) {
        sounds.gun.setVolume(vM);
        sounds.boom.setVolume(vM);
        sounds.missile.setVolume(vM);
        sounds.pop.setVolume(vM);
        sounds.railgun.setVolume(vM);
        sounds.sniper.setVolume(vM);
        sounds.spark.setVolume(vM);
        sounds.taunt.setVolume(vM);
    }

    if (pS == 1) {
        sounds.Win.pause();
        sounds.background.pause();
        sounds.mClick.setVolume(vM);
        sounds.home.pause();
        sounds.home.setVolume(vB);
        sounds.home.loop();
    }

    if (pS == 2) {
        sounds.background.pause();
        sounds.home.pause();
        sounds.Win.pause();
        sounds.Win.setVolume(vB);
        sounds.Win.loop();
    }

    volB = vB;
    volM = vM;
}

function skipFast() {
    let skpButton = document.getElementById('Skip')
    if (!fastForward) {
        skpButton.style.boxShadow = '0px 0px 2px 2px inset #4f4426, 0px 0px 5px 2px #4f4426';
        skpButton.style.animation = 'foggy 1s infinite linear';
        fastForward = true;
    } else {
        skpButton.style.boxShadow = 'none';
        skpButton.style.animation = 'none';
        fastForward = false;
    }
    console.log(fastForward);
}

// Misc functions

// Spawn a group of enemies, alternating if multiple types
function addGroup(group) {
    var count = group.pop();
    for (var i = 0; i < count; i++) {
        for (var j = 0; j < group.length; j++) {
            newEnemies.push(group[j]);
        }
    }
}

// Prepare a wave
function addWave(pattern) {
    if (pattern != undefined) {
        spawnCool = pattern.shift();
        for (var i = 0; i < pattern.length; i++) {
            addGroup(pattern[i]);
        }
    }
}

// Buy and place a tower if player has enough money
function buy(t) {
    if (godMode || cash >= t.cost) {
        if (!godMode) {
            cash -= t.cost;
            toPlace = false;
        }
        selected = t;
        if (grid[t.gridPos.x][t.gridPos.y] === 0) toPathfind = true;
        updateInfo(t);
        newTowers.push(t);
    }
}

// Calculate and display current and average FPS
function calcFPS() {
    var fps = frameRate();
    avgFPS += (fps - avgFPS) / ++numFPS;

    // Draw black rect under text
    noStroke();
    fill(0);
    rect(0, height - 40, 70, 40);

    // Update FPS meter
    fill(255);
    var fpsText = 'FPS: ' + fps.toFixed(2) + '\nAvg: ' + avgFPS.toFixed(2);
    text(fpsText, 5, height - 25);
}

// Check if all conditions for placing a tower are true
function canPlace(col, row) {
    if (!toPlace) return false;
    var g = grid[col][row];
    if (g === 3) return true;
    if (g === 1 || g === 2 || g === 4) return false;
    if (!empty(col, row) || !placeable(col, row)) return false;
    return true;
}

// Check if spawn cooldown is done and enemies are available to spawn
function canSpawn() {
    return newEnemies.length > 0 && scd === 0;
}

// Clear tower information
function clearInfo() {
    document.getElementById('info-div').style.right = '-50%';
}

// TODO implement
function customWave() {
    waves = [];
    Waves = gameLevel['lvl' + cl]

    return waves[wave];
}

// Check if all conditions for showing a range are true
function doRange() {
    return mouseInMap() && toPlace && typeof towerType !== 'undefined';
}

// Check if tile is empty
function empty(col, row) {
    // Check if not walkable
    if (!walkable(col, row)) return false;

    // Check if spawnpoint
    for (var i = 0; i < spawnpoints.length; i++) {
        var s = spawnpoints[i];
        if (s.x === col && s.y === row) return false;
    }

    // Check if exit
    if (typeof exit !== 'undefined') {
        if (exit.x === col && exit.y === row) return false;
    }

    return true;
}

// Return map string
function exportMap() {
    // Convert spawnpoints into a JSON-friendly format
    var spawns = [];
    for (var i = 0; i < spawnpoints.length; i++) {
        var s = spawnpoints[i];
        spawns.push([s.x, s.y]);
    }
    return LZString.compressToBase64(JSON.stringify({
        // Grids
        display: display,
        displayDir: displayDir,
        grid: grid,
        metadata: metadata,
        paths: paths,
        // Important tiles
        exit: [exit.x, exit.y],
        spawnpoints: spawns,
        // Colors
        bg: bg,
        border: border,
        borderAlpha, borderAlpha, //--check
        // Misc
        cols: cols,
        rows: rows
    }));
}

// Get an empty tile
function getEmpty() {
    while (true) {
        var t = randomTile();
        if (empty(t.x, t.y)) return t;
    }
}

// Find tower at specific tile, otherwise return null
function getTower(col, row) {
    for (var i = 0; i < towers.length; i++) {
        var t = towers[i];
        if (t.gridPos.x === col && t.gridPos.y === row) return t;
    }
    return null;
}

// Return map of visitability
function getVisitMap(walkMap) {
    var frontier = [];
    var target = vts(exit);
    frontier.push(target);
    var visited = {};
    visited[target] = true;

    // Fill visited for every tile
    while (frontier.length !== 0) {
        var current = frontier.shift();
        var t = stv(current);
        var adj = neighbors(walkMap, t.x, t.y, true);

        for (var i = 0; i < adj.length; i++) {
            var next = adj[i];
            if (!(next in visited)) {
                frontier.push(next);
                visited[next] = true;
            }
        }
    }

    return visited;
}

// Return walkability map
function getWalkMap() {
    var walkMap = [];
    for (var x = 0; x < cols; x++) {
        walkMap[x] = [];
        for (var y = 0; y < rows; y++) {
            walkMap[x][y] = walkable(x, y);
        }
    }
    return walkMap;
}

// Load a map from a map string
function importMap(str) {
    return;
    // try {
    //     custom = JSON.parse(LZString.decompressFromBase64(str));
    //     document.getElementById('custom').selected = true;
    //     resetGame();
    // } catch (err) { }
}

// Check if wave is at least min and less than max
function isWave(min, max) {
    if (typeof max === 'undefined') return wave >= min;
    return wave >= min && wave < max;
}

// Load map from template
// Always have an exit and spawnpoints if you do not have a premade grid
// TODO health and money by map
function loadMap() {
    var name = 'lvl' + c_l;

    health = gameLevel[name]['health'];
    cash = gameLevel[name]['cash'];
    totalWave = gameLevel[name]['Waves'];

    if (name === 'custom' && custom) {
        // Grids
        display = copyArray(custom.display);
        displayDir = copyArray(custom.displayDir);
        grid = copyArray(custom.grid);
        metadata = copyArray(custom.metadata);
        paths = copyArray(custom.paths);
        // Important tiles
        exit = createVector(custom.exit[0], custom.exit[1]);
        spawnpoints = [];
        for (var i = 0; i < custom.spawnpoints.length; i++) {
            var s = custom.spawnpoints[i];
            spawnpoints.push(createVector(s[0], s[1]));
        }
        // Colors
        bg = custom.bg;
        border = custom.border;
        borderAlpha = custom.borderAlpha;
        // Misc
        cols = custom.cols;
        rows = custom.rows;

        resizeFit();
    } else if (name in maps) {
        var m = maps[name];

        // Grids
        display = copyArray(m.display);
        displayDir = copyArray(m.displayDir);
        grid = copyArray(m.grid);
        metadata = copyArray(m.metadata);
        paths = copyArray(m.paths);
        // Important tiles
        exit = createVector(m.exit[0], m.exit[1]);
        spawnpoints = [];
        for (var i = 0; i < m.spawnpoints.length; i++) {
            var s = m.spawnpoints[i];
            spawnpoints.push(createVector(s[0], s[1]));
        }
        // Colors
        bg = [67, 97, 57];
        border = m.border;
        borderAlpha = m.borderAlpha;
        // Misc
        cols = m.cols;
        rows = m.rows;

        resizeFit();
    } else {
        resizeMax();
        var numSpawns;
        wallCover = 0.1;
        if (name[name.length - 1] === '3') {
            cash = 65;
            numSpawns = 3;
        } else {
            numSpawns = 2;
        }
        if (name === 'empty2' || name === 'empty3') {
            wallCover = 0;
        }
        if (name === 'sparse2' || name === 'sparse3') {
            wallCover = 0.1;
        }
        if (name === 'dense2' || name === 'dense3') {
            wallCover = 0.2;
        }
        if (name === 'solid2' || name === 'solid3') {
            wallCover = 0.3;
        }
        randomMap(numSpawns);
        display = replaceArray(
            grid, [0, 1, 2, 3, 4], ['empty', 'wall', 'empty', 'tower', 'empty']
        );
        displayDir = buildArray(cols, rows, 0);
        // Colors
        bg = [67, 97, 57];
        border = 255;
        borderAlpha = 31;
        // Misc
        metadata = buildArray(cols, rows, null);
    }

    tempSpawns = [];

    recalculate();
}

// Increment wave counter and prepare wave
function nextWave() {
    addWave(randomWaves ? randomWave() : customWave());
    wave++;
}

// Check if no more enemies
function noMoreEnemies() {
    return enemies.length === 0 && newEnemies.length === 0;
}

function outsideMap(e) {
    return outsideRect(e.pos.x, e.pos.y, 0, 0, width, height);
}

// Toggle pause state
function pause(n = 0) {
    toPlace = false;
    selected = null;
    clearInfo();
    paused = !paused;
    if (n == 1) {
        if (paused == true) {
            changeVolume(vB = slide1.value, vM = slide2.value, pS = 2);
        }
    } else if (n == 2) {
        if (paused == true) {
            changeVolume(vB = slide1.value, vM = slide2.value, pS = 1);
        }
    } else {
        updatePause();
        if (paused == true) {
            changeVolume(vB = slide1.value, vM = slide2.value, pS = 1);
        }
    }
    if (paused == false) {
        changeVolume(vB = slide1.value, vM = slide2.value, pS = 0);
    }
}

// Return false if blocking a tile would invalidate paths to exit
function placeable(col, row) {
    var walkMap = getWalkMap();
    walkMap[col][row] = false;
    var visitMap = getVisitMap(walkMap);

    // Check spawnpoints
    for (var i = 0; i < spawnpoints.length; i++) {
        if (!visitMap[vts(spawnpoints[i])]) return false;
    }

    // Check each enemy
    for (var i = 0; i < enemies.length; i++) {
        var e = enemies[i];
        var p = gridPos(e.pos.x, e.pos.y);
        if (p.equals(col, row)) continue;
        if (!visitMap[vts(p)]) return false;
    }

    return true;
}

// Generate random map
function randomMap(numSpawns) {
    // Generate empty tiles and walls
    grid = [];
    for (var x = 0; x < cols; x++) {
        grid[x] = [];
        for (var y = 0; y < rows; y++) {
            grid[x][y] = random() < wallCover ? 1 : 0;
        }
    }
    walkMap = getWalkMap();

    // Generate exit and remove walls that are adjacent
    exit = getEmpty();
    var adj = neighbors(walkMap, exit.x, exit.y, false);
    for (var i = 0; i < adj.length; i++) {
        var n = stv(adj[i]);
        grid[n.x][n.y] = 0;
    }

    // Generate enemy spawnpoints and ensure exit is possible
    spawnpoints = [];
    visitMap = getVisitMap(walkMap);
    for (var i = 0; i < numSpawns; i++) {
        var s;
        // Try to place spawnpoint
        for (var j = 0; j < 100; j++) {
            s = getEmpty();
            while (!visitMap[vts(s)]) s = getEmpty();
            if (s.dist(exit) >= minDist) break;
        }
        spawnpoints.push(s);
    }
}

// Random grid coordinate
function randomTile() {
    return createVector(randint(cols), randint(rows));
}

// Generate a random wave
function randomWave() {
    var waves = [];

    if (isWave(0, 3)) {
        waves.push([40, ['weak', 50]]);
    }
    if (isWave(2, 4)) {
        waves.push([20, ['weak', 25]]);
    }
    if (isWave(2, 7)) {
        waves.push([30, ['weak', 25], ['strong', 25]]);
        waves.push([20, ['strong', 25]]);
    }
    if (isWave(3, 7)) {
        waves.push([40, ['fast', 25]]);
    }
    if (isWave(4, 14)) {
        waves.push([20, ['fast', 50]]);
    }
    if (isWave(5, 6)) {
        waves.push([20, ['strong', 50], ['fast', 25]]);
    }
    if (isWave(8, 12)) {
        waves.push([20, ['medic', 'strong', 'strong', 25]]);
    }
    if (isWave(10, 13)) {
        waves.push([20, ['medic', 'strong', 'strong', 50]]);
        waves.push([30, ['medic', 'strong', 'strong', 50], ['fast', 50]]);
        waves.push([5, ['fast', 50]]);
    }
    if (isWave(12, 16)) {
        waves.push([20, ['medic', 'strong', 'strong', 50], ['strongFast', 50]]);
        waves.push([10, ['strong', 50], ['strongFast', 50]]);
        waves.push([10, ['medic', 'strongFast', 50]]);
        waves.push([10, ['strong', 25], ['stronger', 25], ['strongFast', 50]]);
        waves.push([10, ['strong', 25], ['medic', 25], ['strongFast', 50]]);
        waves.push([20, ['medic', 'stronger', 'stronger', 50]]);
        waves.push([10, ['medic', 'stronger', 'strong', 50]]);
        waves.push([10, ['medic', 'strong', 50], ['medic', 'strongFast', 50]]);
        waves.push([5, ['strongFast', 100]]);
        waves.push([20, ['stronger', 50]]);
    }
    if (isWave(13, 20)) {
        waves.push([40, ['tank', 'stronger', 'stronger', 'stronger', 10]]);
        waves.push([10, ['medic', 'stronger', 'stronger', 50]]);
        waves.push([40, ['tank', 25]]);
        waves.push([20, ['tank', 'stronger', 'stronger', 50]]);
        waves.push([20, ['tank', 'medic', 50], ['strongFast', 25]]);
    }
    if (isWave(14, 20)) {
        waves.push([20, ['tank', 'stronger', 'stronger', 50]]);
        waves.push([20, ['tank', 'medic', 'medic', 50]]);
        waves.push([20, ['tank', 'medic', 50], ['strongFast', 25]]);
        waves.push([10, ['tank', 50], ['strongFast', 25]]);
        waves.push([10, ['faster', 50]]);
        waves.push([20, ['tank', 50], ['faster', 25]]);
    }
    if (isWave(17, 25)) {
        waves.push([20, ['taunt', 'stronger', 'stronger', 'stronger', 25]]);
        waves.push([20, ['spawner', 'stronger', 'stronger', 'stronger', 25]]);
        waves.push([20, ['taunt', 'tank', 'tank', 'tank', 25]]);
        waves.push([40, ['taunt', 'tank', 'tank', 'tank', 25]]);
    }
    if (isWave(19)) {
        waves.push([20, ['spawner', 1], ['tank', 20], ['stronger', 25]]);
        waves.push([20, ['spawner', 1], ['faster', 25]]);
    }
    if (isWave(23)) {
        waves.push([20, ['taunt', 'medic', 'tank', 25]]);
        waves.push([20, ['spawner', 2], ['taunt', 'medic', 'tank', 25]]);
        waves.push([10, ['spawner', 1], ['faster', 100]]);
        waves.push([5, ['faster', 100]]);
        waves.push([
            20, ['tank', 100], ['faster', 50],
            ['taunt', 'tank', 'tank', 'tank', 50]
        ]);
        waves.push([
            10, ['taunt', 'stronger', 'tank', 'stronger', 50],
            ['faster', 50]
        ]);
    }
    if (isWave(25)) {
        waves.push([5, ['taunt', 'medic', 'tank', 50], ['faster', 50]]);
        waves.push([5, ['taunt', 'faster', 'faster', 'faster', 50]]);
        waves.push([
            10, ['taunt', 'tank', 'tank', 'tank', 50],
            ['faster', 50]
        ]);
    }
    if (isWave(30)) {
        waves.push([5, ['taunt', 'faster', 'faster', 'faster', 50]]);
        waves.push([5, ['taunt', 'tank', 'tank', 'tank', 50]]);
        waves.push([5, ['taunt', 'medic', 'tank', 'tank', 50]]);
        waves.push([1, ['faster', 200]]);
    }
    if (isWave(35)) {
        waves.push([0, ['taunt', 'faster', 200]]);
    }

    return random(waves);
}

// Recalculate pathfinding maps
// Algorithm from https://www.redblobgames.com/pathfinding/tower-defense/
function recalculate() {
    walkMap = getWalkMap();
    var frontier = [];
    var target = vts(exit);
    frontier.push(target);
    var cameFrom = {};
    var distance = {};
    cameFrom[target] = null;
    distance[target] = 0;

    // Fill cameFrom and distance for every tile
    while (frontier.length !== 0) {
        var current = frontier.shift();
        var t = stv(current);
        var adj = neighbors(walkMap, t.x, t.y, true);

        for (var i = 0; i < adj.length; i++) {
            var next = adj[i];
            if (!(next in cameFrom) || !(next in distance)) {
                frontier.push(next);
                cameFrom[next] = current;
                distance[next] = distance[current] + 1;
            }
        }
    }

    // Generate usable maps
    dists = buildArray(cols, rows, null);
    var newPaths = buildArray(cols, rows, 0);
    var keys = Object.keys(cameFrom);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var current = stv(key);

        // Distance map
        dists[current.x][current.y] = distance[key];

        // Generate path direction for every tile
        var val = cameFrom[key];
        if (val !== null) {
            // Subtract vectors to determine direction
            var next = stv(val);
            var dir = next.sub(current);
            // Fill tile with direction
            if (dir.x < 0) newPaths[current.x][current.y] = 1;
            if (dir.y < 0) newPaths[current.x][current.y] = 2;
            if (dir.x > 0) newPaths[current.x][current.y] = 3;
            if (dir.y > 0) newPaths[current.x][current.y] = 4;
        }
    }

    // Preserve old paths on path tiles
    for (var x = 0; x < cols; x++) {
        for (var y = 0; y < rows; y++) {
            if (grid[x][y] === 2) newPaths[x][y] = paths[x][y];
        }
    }

    paths = newPaths;
}

// TODO vary health based on map
function resetGame() {
    loadMap();
    // Clear all entities
    enemies = [];
    projectiles = [];
    systems = [];
    towers = [];
    newEnemies = [];
    newProjectiles = [];
    newTowers = [];
    // Reset all stats
    // health = 40;
    maxHealth = health;
    wave = 0;
    // Reset all flags
    paused = false;
    scd = 0;
    toCooldown = false;
    toPathfind = false;
    toPlace = false;
    // Start game
    changeVolume(vB = slide1.value, vM = slide2.value, pS = 0);
    
    document.getElementById('menuPause').style.display = paused ? 'flex' : 'none';
    document.getElementById('disableBack').style.display = paused ? 'block' : 'none';
    document.getElementById('result').style.display = 'none';
    document.getElementById('head').innerHTML = '';
    document.querySelectorAll('.s_ .thisstr').forEach(element => {
        element.style.backgroundImage = "none";
        element.style.animation = 'none';
    });
    nextWave();
}

// Changes tile size to fit everything onscreen
function resizeFit() {
    var div = document.getElementById('sketch-holder');
    var ts1 = floor(div.offsetWidth / cols);
    var ts2 = floor(div.offsetHeight / rows);
    ts = Math.min(ts1, ts2);
    resizeCanvas(cols * ts, rows * ts, true);
}

// Resizes cols, rows, and canvas based on tile size
function resizeMax() {
    var div = document.getElementById('sketch-holder');
    cols = floor(div.offsetWidth / ts);
    rows = floor(div.offsetHeight / ts);
    resizeCanvas(cols * ts, rows * ts, true);
}

// Sell a tower
function sell(t) {
    selected = null;
    if (grid[t.gridPos.x][t.gridPos.y] === 0) toPathfind = true;
    clearInfo();
    cash += t.sellPrice();
    t.kill();
}

// Set a tower to place
function setPlace(t) {
    towerType = t;
    toPlace = true;
    updateInfo(createTower(0, 0, tower[towerType]));
}

// Visualize range of tower
function showRange(t, cx, cy) {
    stroke(255);
    fill(t.color[0], t.color[1], t.color[2], 63);
    var r = (t.range + 0.5) * ts * 2;
    ellipse(cx, cy, r, r);
}

// Display tower information
// TODO maybe display average DPS
function updateInfo(t) {
    var name = document.getElementById('name');
    name.innerHTML = '<span style="color:rgb(' + t.color + ')">' + t.title +
        '</span>';
    document.getElementById('cost').innerHTML = 'Cost: $' + t.totalCost;
    document.getElementById('sellPrice').innerHTML = 'Sell price: $' +
        t.sellPrice();
    document.getElementById('upPrice').innerHTML = 'Upgrade price: ' +
        (t.upgrades.length > 0 ? '$' + t.upgrades[0].cost : 'N/A');
    document.getElementById('damage').innerHTML = 'Damage: ' + t.getDamage();
    document.getElementById('type').innerHTML = 'Type: ' +
        t.type.toUpperCase();
    document.getElementById('range').innerHTML = 'Range: ' + t.range;
    document.getElementById('cooldown').innerHTML = 'Avg. Cooldown: ' +
        t.getCooldown().toFixed(2) + 's';
    var upgradeBtn = document.getElementById('upgrade');
    upgradeBtn.style.display = t.upgrades.length > 0 ? 'block' : 'none';
    document.getElementById('info-div').style.right = '-0.5%';
}

// Update pause button
function updatePause() {
    document.getElementById('pause').innerHTML = paused ? '<svg fill=" #4f4426" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="35px" height="30px" viewBox="0 0 163.861 163.861" xml:space="preserve"><g><path d="M34.857,3.613C20.084-4.861,8.107,2.081,8.107,19.106v125.637c0,17.042,11.977,23.975,26.75,15.509L144.67,97.275 c14.778-8.477,14.778-22.211,0-30.686L34.857,3.613z"/></g></svg>' : '<svg fill="#ffffff" width="35px" height="35px" viewBox="0 0 24.00 24.00" data-name="Flat Color" xmlns = "http://www.w3.org/2000/svg" class="icon flat-color"><path id="primary" d="M19,4V20a2,2,0,0,1-2,2H15a2,2,0,0,1-2-2V4a2,2,0,0,1,2-2h2A2,2,0,0,1,19,4ZM9,2H7A2,2,0,0,0,5,4V20a2,2,0,0,0,2,2H9a2,2,0,0,0,2-2V4A2,2,0,0,0,9,2Z" style="fill: #4f4426;"/></svg >';
    document.getElementById('disableBack').style.display = paused ? 'block' : 'none';
    document.getElementById('menuPause').style.display = paused ? 'flex' : 'none';
}

// Update game status display with wave, health, and cash
function updateStatus() {
    document.getElementById('health').innerHTML = '<span class="pic"></span><span class="txt" id="h">' + health + '</span>';
    document.getElementById('cash').innerHTML = '<span class="pic"></span><span class="txt" id="c">$' + cash + '</span>';
    document.getElementById('wave').innerHTML = '<span class="pic"></span><span class="txt" id="w">' + wave + '/' + totalWave + '</span>';
}

// Upgrade tower
function upgrade(t) {
    if (godMode || cash >= t.cost) {
        if (!godMode) cash -= t.cost;
        selected.upgrade(t);
        selected.upgrades = t.upgrades ? t.upgrades : [];
        updateInfo(selected);
    }
}

// Return whether tile is walkable
function walkable(col, row) {
    // Check if wall or tower-only tile
    if (grid[col][row] === 1 || grid[col][row] === 3) return false;
    // Check if tower
    if (getTower(col, row)) return false;
    return true;
}


// Main p5 functions
function preload() {
    loadSounds();
    loadSketch();
    loadTiles();
    loadEnemies();
    loadTowers();
    loadEffect();
}

function setup() {
    var div = document.getElementById('sketch-holder');
    var canvas = createCanvas(div.offsetWidth, div.offsetHeight);
    canvas.parent('sketch-holder');
    frameRate(60);
    resetGame();
    pause();
    LoadedAssets();
    console.log('Loading: ',loader);
    document.querySelector('.loader').onclick = () => {
        document.querySelector('.loader').style.display = 'none';
        pause();
    }
}


// TODO show range of selected tower
function draw() {
    if (!paused && !sounds.background.isPlaying()) sounds.background.loop();
    background(bg);
    // Update game status
    updateStatus();

    // Update spawn and wave cooldown
    if (!paused) {
        if (scd > 0) scd--;
        if (wcd > 0 && toWait) wcd--;
    }

    // Draw basic tiles
    let imgEmptyAll = GroundTiles.Empty.get(128 * 0, 128 * 3, 128, 128);

    let wall = GroundTiles.Wall.get(16 * 7, 16 * 7, 16, 25);

    let wallR = GroundTiles.Wall.get(16 * 5, 16 * 7, 16, 25);
    let wallMH = GroundTiles.Wall.get(16 * 4, 16 * 7, 16, 25);
    let wallL = GroundTiles.Wall.get(16 * 3, 16 * 7, 16, 25);

    let wallU = GroundTiles.Wall.get(16, 16 * 6, 16, 16);
    let wallMV = GroundTiles.Wall.get(16, 16 * 7, 16, 16);
    let wallD = GroundTiles.Wall.get(16, 16 * 8, 16, 25);

    let wallMLD = GroundTiles.Wall.get(16 * 14, 16 * 0, 16, 25);
    let wallMLU = GroundTiles.Wall.get(16 * 13, 16 * 10, 16, 25);

    let wallMRD = GroundTiles.Wall.get(16 * 11, 16 * 0, 16, 25);
    let wallMRU = GroundTiles.Wall.get(16 * 9, 16 * 10, 16, 25);

    let wallMF = GroundTiles.Wall.get(16 * 10, 17 * 2, 16, 14);

    let wallMTR = GroundTiles.Wall.get(16 * 14 + 2, 16 * 1, 14, 25);
    let wallMTL = GroundTiles.Wall.get(16 * 9, 16 * 9, 16, 25);
    let wallMTU = GroundTiles.Wall.get(16 * 9 + 2, 16 * 10, 16, 25);
    let wallMTD = GroundTiles.Wall.get(16 * 11 + 2, 16 * 0, 16, 16);

    // list of tiles
    let emptyList = []
    let towerList = []
    let wallList = []
    let funList = []
    for (var x = 0; x < cols; x++) {
        for (var y = 0; y < rows; y++) {
            var t = tiles[display[x][y]];
            // Grass, Road Tile, Left Corner, Right Corner, Sidewalk,
            if (typeof t === 'function') {
                funList.push([x, y]);
            } else if (t == 'tower') {
                towerList.push([x, y]);
            } else if (t == 'wall') {
                wallList.push([x, y]);
            } else {
                emptyList.push([x, y]);
            }
        }
    }
    for (var x = 0; x < cols; x++) {
        for (var y = 0; y < rows; y++) {
            let wallAll;
            let dictL = false;
            let dictR = false;
            let dictU = false;
            let dictD = false;
            var t = tiles[display[x][y]];

            if (typeof t === 'function') {
                t(x, y, displayDir[x][y]);
            } else if (t == 'tower') {
                push();
                let c = center(x, y);
                translate(c.x, c.y);
                // image(imgEmptyAll, -ts / 2, -ts / 2, ts, ts);
                if (!getTower(x, y)) {
                    image(GroundTiles.Tower, -(ts - 5) / 2, -(ts - 5) / 2, ts - 5, ts - 5)
                }
                pop();
            } else if (t == 'wall') {
                push()
                for (i of wallList) {
                    dictR = dictR || (i[0] === x - 1 && i[1] === y);
                    dictL = dictL || (i[0] === x + 1 && i[1] === y);
                    dictD = dictD || (i[1] === y - 1 && i[0] === x);
                    dictU = dictU || (i[1] === y + 1 && i[0] === x);
                }

                if (dictU && dictD && dictR && dictL) {
                    wallAll = wallMF;
                } else if (dictU && dictD && dictR) {
                    wallAll = wallMTR;
                } else if (dictU && dictD && dictL) {
                    wallAll = wallMTL;
                } else if (dictU && dictL && dictR) {
                    wallAll = wallMTD;
                } else if (dictD && dictL && dictR) {
                    wallAll = wallMTU;
                } else if (dictR && dictL) {
                    wallAll = wallMH;
                } else if (dictL && dictD) {
                    wallAll = wallMRU;
                } else if (dictL && dictU) {
                    wallAll = wallMRD;
                } else if (dictR && dictD) {
                    wallAll = wallMLU;
                } else if (dictR && dictU) {
                    wallAll = wallMLD;
                } else if (dictU && dictD) {
                    wallAll = wallMV;
                } else if (dictR) {
                    wallAll = wallR;
                } else if (dictL) {
                    wallAll = wallL;
                } else if (dictU) {
                    wallAll = wallU;
                } else if (dictD) {
                    wallAll = wallD;
                } else {
                    wallAll = wall;
                }
                image(wallAll, x * ts, y * ts, ts, ts)
                pop();
                // } else {
                //     if (backgroundTile == false){
                //         push();
                //         fill(bg[0], bg[2], bg[3]);
                //         // var c = center(x, y);
                //         // translate(c.x, c.y);
                //         // rotate(random([0, PI / 2, PI, PI * 3 / 2]));
                //         // image(imgEmptyAll, -ts / 2, -ts / 2, ts, ts);
                //         pop();
                //         backgroundTile = true;
                //     }
            }
        }
    }
    // Draw spawnpoints
    for (var i = 0; i < spawnpoints.length; i++) {
        push();
        var s = spawnpoints[i];
        var d = displayDir[s.x][s.y];
        var c = center(s.x, s.y);
        translate(c.x, c.y);
        image(Imgs.Road.get(128 * 6, 128 * 3, 128, 128), -ts / 2, -ts / 2, ts, ts);
        if (d) {
            rotate([PI, -PI / 2, 0, PI / 2][d - 1]);
        } else {
            if (!outsideRect(s.x - 1, s.y, 0, 0, width, height) && displayDir[s.x - 1][s.y]) {
                d = displayDir[s.x - 1][s.y];
            } else if (!outsideRect(s.x + 1, s.y, 0, 0, width, height) && displayDir[s.x + 1][s.y]) {
                d = displayDir[s.x + 1][s.y];
            } else if (!outsideRect(s.x, s.y - 1, 0, 0, width, height) && displayDir[s.x][s.y - 1]) {
                d = displayDir[s.x][s.y - 1];
            } else if (!outsideRect(s.x, s.y + 1, 0, 0, width, height) && displayDir[s.x][s.y + 1]) {
                d = displayDir[s.x][s.y + 1];
            }
            rotate([PI, -PI / 2, 0, PI / 2][d - 1]);
        }
        tint(255, 100);
        image(GroundTiles.exitStation, -ts / 3, -ts / 3, ts * 2 / 3, ts * 2 / 3);
        pop();
    }

    // Draw exit
    push();
    var c = center(exit.x, exit.y)
    translate(c.x, c.y);
    var d = displayDir[exit.x][exit.y];

    if (d) {
        rotate([PI, -PI / 2, 0, PI / 2][d - 1]);
    } else {
        if (!outsideRect(exit.x - 1, exit.y, 0, 0, width, height) && displayDir[exit.x - 1][exit.y]) {
            d = displayDir[exit.x - 1][exit.y];
        } else if (!outsideRect(exit.x + 1, exit.y, 0, 0, width, height) && displayDir[exit.x + 1][exit.y]) {
            d = displayDir[exit.x + 1][exit.y];
        } else if (!outsideRect(exit.x, exit.y - 1, 0, 0, width, height) && displayDir[exit.x][exit.y - 1]) {
            d = displayDir[exit.x][exit.y - 1];
        } else if (!outsideRect(exit.x, exit.y + 1, 0, 0, width, height) && displayDir[exit.x][exit.y + 1]) {
            d = displayDir[exit.x][exit.y + 1];
        }
        rotate([PI, -PI / 2, 0, PI / 2][d - 1]);
    }
    image(Imgs.Road.get(128 * 6, 128 * 3, 128, 128), -ts / 2, -ts / 2, ts, ts);
    tint(255, 100);
    image(GroundTiles.exitStation, -ts / 3, -ts / 3, ts * 2 / 3, ts * 2 / 3);
    pop();

    // Draw temporary spawnpoints
    for (var i = 0; i < tempSpawns.length; i++) {
        stroke(255);
        fill(155, 32, 141);
        var s = tempSpawns[i][0];
        rect(s.x * ts, s.y * ts, ts, ts);
    }

    // Spawn enemies
    if (canSpawn() && !paused) {
        // Spawn same enemy for each spawnpoint
        var name = newEnemies.shift();
        for (var i = 0; i < spawnpoints.length; i++) {
            var s = spawnpoints[i];
            var c = center(s.x, s.y);
            enemies.push(createEnemy(c.x, c.y, enemy[name]));
        }

        // Temporary spawnpoints
        for (var i = 0; i < tempSpawns.length; i++) {
            var s = tempSpawns[i];
            if (s[1] === 0) continue;
            s[1]--;
            var c = center(s[0].x, s[0].y);
            enemies.push(createEnemy(c.x, c.y, enemy[name]));
        }

        // Reset cooldown
        toCooldown = true;
    }

    for (let i = scraps.length - 1; i >= 0; i--) {
        let e = scraps[i];

        // Update direction and position
        if (!paused) {
            e.update();
        }

        // Draw
        e.draw();

        if (e.isDead()) scraps.splice(i, 1);
    }

    // Update and draw enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];

        // Update direction and position
        if (!paused) {
            e.steer();
            e.update();
            e.onTick();
        }

        // Kill if outside map
        if (outsideMap(e)) e.kill();

        // If at exit tile, kill and reduce player health
        if (atTileCenter(e.pos.x, e.pos.y, exit.x, exit.y)) e.onExit();

        // Draw
        e.draw();

        if (e.isDead()) {
            enemies.splice(i, 1);
            scraps.push(new Scrap(e.pos.x, e.pos.y))
        }
    }

    // Draw health bars
    if (healthBar) {
        for (var i = 0; i < enemies.length; i++) {
            enemies[i].drawHealth();
        }
    }

    // Update and draw towers
    for (let i = towers.length - 1; i >= 0; i--) {
        let t = towers[i];

        // Target enemies and update cooldowns
        if (!paused) {
            t.target(enemies);
            t.update();
        }
        // Kill if outside map
        if (outsideMap(t)) t.kill();

        // Draw
        t.draw();

        if (t.isDead()) towers.splice(i, 1);
    }

    // Update and draw particle systems
    for (let i = systems.length - 1; i >= 0; i--) {
        let ps = systems[i];
        ps.run();
        if (ps.isDead()) systems.splice(i, 1);
    }

    // Update and draw projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
        let p = projectiles[i];

        if (!paused) {
            p.steer();
            p.update();
        }

        // Attack target
        if (p.reachedTarget()) p.explode()

        // Kill if outside map
        if (outsideMap(p)) p.kill();

        p.draw();

        if (p.isDead()) projectiles.splice(i, 1);
    }

    // Draw range of tower being placed
    if (doRange()) {
        var p = gridPos(mouseX, mouseY);
        var c = center(p.x, p.y);
        var t = createTower(0, 0, tower[towerType]);
        showRange(t, c.x, c.y);

        // Draw a red X if tower cannot be placed
        if (!canPlace(p.x, p.y)) {
            push();
            translate(c.x, c.y);
            rotate(PI / 4);

            // Draw a red X
            noStroke();
            fill(207, 0, 15);
            var edge = 0.1 * ts;
            var len = 0.9 * ts / 2;
            rect(-edge, len, edge * 2, -len * 2);
            rotate(PI / 2);
            rect(-edge, len, edge * 2, -len * 2);

            pop();
        }
    }

    // Update FPS meter
    if (showFPS) calcFPS();

    // Show if god mode active
    if (godMode) {
        // Draw black rect under text
        noStroke();
        fill(0);
        rect(0, 0, 102, 22);

        fill(255);
        text('God Mode Active', 5, 15);
    }

    // Show if towers are disabled
    if (stopFiring) {
        // Draw black rect under text
        noStroke();
        fill(0);
        rect(width - 60, 0, 60, 22);

        fill(255);
        text('Firing off', width - 55, 15);
    }

    removeTempSpawns();

    projectiles = projectiles.concat(newProjectiles);
    towers = towers.concat(newTowers);
    newProjectiles = [];
    newTowers = [];

    // If player is dead, reset game
    if (health <= 0) {
        health = 0;
        document.getElementById('result').style.display = 'flex';
        document.getElementById('head').innerHTML = 'DEFEAT';
        document.getElementById('next').style.display = 'none';
        if (paused == false) {
            pause(2);
            document.getElementById('disableBack').style.display = paused ? 'block' : 'none';
        }
    }

    if (noMoreEnemies() && wave >= totalWave) {
        console.log('win');
        let stars = 0
        document.getElementById('result').style.display = 'flex';
        document.getElementById('head').innerHTML = 'VICTORY';
        if (health < maxHealth / 3) {
            setTimeout(() => {
                document.querySelector('.s1 .thisstr').style.backgroundImage = "url('Images/UI/Levels_Menu/Star.png')";
                document.querySelector('.s1 .thisstr').style.animation = 'star .5s linear';
            }, 500);
            stars = 1
        } else if (health < maxHealth * 2 / 3) {
            setTimeout(() => {
                document.querySelector('.s1 .thisstr').style.backgroundImage = "url('Images/UI/Levels_Menu/Star.png')";
                document.querySelector('.s1 .thisstr').style.animation = 'star .5s linear';
            }, 500);
            setTimeout(() => {
                document.querySelector('.s2 .thisstr').style.backgroundImage = "url('Images/UI/Levels_Menu/Star.png')";
                document.querySelector('.s2 .thisstr').style.animation = 'star .5s linear';
            }, 1000);
            stars = 2
        } else {
            setTimeout(() => {
                document.querySelector('.s1 .thisstr').style.backgroundImage = "url('Images/UI/Levels_Menu/Star.png')";
                document.querySelector('.s1 .thisstr').style.animation = 'star .5s linear';
            }, 500);
            setTimeout(() => {
                document.querySelector('.s2 .thisstr').style.backgroundImage = "url('Images/UI/Levels_Menu/Star.png')";
                document.querySelector('.s2 .thisstr').style.animation = 'star .5s linear';
            }, 1000);
            setTimeout(() => {
                document.querySelector('.s3 .thisstr').style.backgroundImage = "url('Images/UI/Levels_Menu/Star.png')";
                document.querySelector('.s3 .thisstr').style.animation = 'star .5s linear';
            }, 1500);
            stars = 3
        }
        if (paused == false) {
            pause(1);
            document.getElementById('disableBack').style.display = paused ? 'block' : 'none';
            let CLevel = JSON.parse(comlvl);
            for (var m in CLevel) {
                if (m == 'lvl' + c_l && CLevel[m] > stars) {
                    stars = CLevel[m];
                }
            }

            if (comlvl != "{}") {
                g = comlvl;
                localStorage.setItem("CompleteLevel", g.slice(0, -1) + ",\"lvl" + c_l + "\":" + stars + "}");
            } else {
                localStorage.setItem("CompleteLevel", "{" + "\"lvl" + c_l + "\":" + stars + "}");
            }
        }
    }

    // Start next wave
    if (toWait && wcd === 0 || skipToNext && newEnemies.length === 0) {
        toWait = false;
        wcd = 0;
        nextWave();
    }

    // Wait for next wave
    if (noMoreEnemies() && !toWait) {
        wcd = waveCool;
        toWait = true;
    }

    // Reset spawn cooldown
    if (toCooldown) {
        scd = spawnCool;
        toCooldown = false;
    }

    // Recalculate pathfinding
    if (toPathfind) {
        recalculate();
        toPathfind = false;
    }

    if (selected) {
        var c = center(selected.gridPos.x, selected.gridPos.y);
        fill(selected.color[0], selected.color[1], selected.color[2], 65);
        var r = (selected.range + 0.5) * ts * 2;
        ellipse(c.x, c.y, r, r)
        var buttons = document.getElementById('info-buttons');
        buttons.style.bottom = '7.5%';
    } else {
        var buttons = document.getElementById('info-buttons');
        buttons.style.bottom = '-10%';
    }
    frameRate(fastForward ? 120 : 60);
}


// User input

function keyPressed() {
    switch (keyCode) {
        case 27:
            // Esc
            toPlace = false;
            clearInfo();
            break;
        case 32:
            // Space
            pause();
            break;
        case 49:
            // 1
            setPlace('gun');
            break;
        case 50:
            // 2
            setPlace('laser');
            break;
        case 51:
            // 3
            setPlace('slow');
            break;
        case 52:
            // 4
            setPlace('sniper');
            break;
        case 53:
            // 5
            setPlace('rocket');
            break;
        case 54:
            // 6
            setPlace('bomb');
            break;
        case 55:
            // 7
            setPlace('tesla');
            break;
        case 70:
            // F
            showFPS = !showFPS;
            break;
        case 71:
            // G
            godMode = !godMode;
            break;
        case 72:
            // H
            healthBar = !healthBar;
            break;
        case 77:
            // M
            importMap(prompt('Input map string:'));
            break;
        case 80:
            // P
            showEffects = !showEffects;
            if (!showEffects) systems = [];
            break;
        case 81:
            // Q
            stopFiring = !stopFiring;
            break;
        case 82:
            // R
            resetGame();
            break;
        case 83:
            // S
            if (selected) sell(selected);
            break;
        case 85:
            // U
            if (selected && selected.upgrades.length > 0) {
                upgrade(selected.upgrades[0]);
            }
            break;
        case 86:
            // V
            muteSounds = !muteSounds;
            break;
        case 87:
            // W
            skipToNext = !skipToNext;
            break;
        case 88:
            // X
            copyToClipboard(exportMap());
            break;
        case 90:
            // Z
            ts = zoomDefault;
            resizeMax();
            resetGame();
            break;
        case 219:
            // Left bracket
            if (ts > 16) {
                ts -= tileZoom;
                resizeMax();
                resetGame();
            }
            break;
        case 221:
            // Right bracket
            if (ts < 40) {
                ts += tileZoom;
                resizeMax();
                resetGame();
            }
            break;
    }
}

function mousePressed() {
    if (mouseButton === RIGHT) {
        toPlace = false;
        selected = null;
        clearInfo();
        return;
    }

    if (!mouseInMap()) return;
    var p = gridPos(mouseX, mouseY);
    var t = getTower(p.x, p.y);
    selected = null;

    if (t) {
        // Clicked on tower
        selected = t;
        toPlace = false;
        updateInfo(selected);
    } else if (canPlace(p.x, p.y)) {
        buy(createTower(p.x, p.y, tower[towerType]));
    }
}


// Events

// document.getElementById('map').addEventListener('change', resetGame);
document.getElementById('restart').addEventListener('click', resetGame);
