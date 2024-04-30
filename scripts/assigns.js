var enemies = [];
var scraps = [];
var projectiles = [];
var systems = [];
var towers = [];
var newEnemies = [];
var newProjectiles = [];
var newTowers = [];

var cols;
var rows;
var tileZoom = 0;
var ts = 24;            // tile size
var zoomDefault = ts;

var particleAmt = 32;   // number of particles to draw per explosion

var tempSpawnCount = 40;

var custom;             // custom map JSON
var display;            // graphical display tiles
var displayDir;         // direction display tiles are facing
// (0 = none, 1 = left, 2 = up, 3 = right, 4 = down)
var dists;              // distance to exit
var grid;               // tile type
// (0 = empty, 1 = wall, 2 = path, 3 = tower,
//  4 = enemy-only pathing)
var metadata;           // tile metadata
var paths;              // direction to reach exit
var visitMap;           // whether exit can be reached
var walkMap;            // walkability map

var exit;
var spawnpoints = [];
var tempSpawns = [];

var cash;
var health;
var maxHealth;
var wave;

var spawnCool;          // number of ticks between spawning enemies

var bg;                 // background color
var border;             // color to draw on tile borders
var borderAlpha;        // alpha of tile borders

var selected;
var towerType;

var sounds;             // dict of all sounds
var boomSound;          // explosion sound effect

// TODO add more functionality to god mode
var godMode = false;    // make player immortal for test purposes
var healthBar = true;   // display enemy health bar
var muteSounds = false; // whether to mute sounds
var paused;             // whether to update or not
var randomWaves = true; // whether to do random or custom waves //check ----- 
var scd;                // number of ticks until next spawn cycle
var showEffects = true; // whether or not to display particle effects
var showFPS = false;    // whether or not to display FPS
var skipToNext = false; // whether or not to immediately start next wave
var stopFiring = false; // whether or not to pause towers firing
var toCooldown;         // flag to reset spawning cooldown
var toPathfind;         // flag to update enemy pathfinding
var toPlace;            // flag to place a tower
var toWait;             // flag to wait before next wave
var wcd;                // number of ticks until next wave

var fastForward = false;

var avgFPS = 0;         // current average of all FPS values
var numFPS = 0;         // number of FPS values calculated so far

var minDist = 15;       // minimum distance between spawnpoint and exit
var resistance = 0.5;   // percentage of damage blocked by resistance
var sellConst = 0.8;    // ratio of tower cost to sell price
var wallCover = 0.1;    // percentage of map covered by walls
var waveCool = 120;     // number of ticks between waves
var weakness = 0.5;     // damage increase from weakness
var totalWave = 35;
var volB = Number(localStorage.getItem("Music")) / 100;
var volM = Number(localStorage.getItem("Sound")) / 100;
var c_l = localStorage.getItem("CurrentLevel");
var comlvl = localStorage.getItem("CompleteLevel");
var backgroundTile = false;
var loader = 0

function LoadedAssets(i = null) {
    loader++;
    var num_ = (loader / 50) * 100;
    document.querySelector('.loaderLine').style.width = num_ + '%';
    if (num_ < 100){
        document.querySelector('.loaderText').style.setProperty('--text', '\"' + Math.floor(num_) + '%\"');
    } else {
        document.querySelector('.loaderText').style.setProperty('--text', '\"Click To Continue...\"');
    }
}

// Load all sounds
function loadSounds() {
    sounds = {};

    soundFormats('wav');
    // Game
    sounds.background = loadSound('sounds/game.wav', LoadedAssets);
    sounds.background.setVolume(volB);

    // Home
    sounds.home = loadSound('sounds/home.wav', LoadedAssets);
    sounds.home.setVolume(volB);

    // Win
    sounds.Win = loadSound('sounds/victory.wav', LoadedAssets);
    sounds.Win.setVolume(volB);

    // mouse click
    sounds.mClick = loadSound('sounds/click.wav', LoadedAssets);
    sounds.mClick.setVolume(volM);

    // Gun shot
    sounds.gun = loadSound('sounds/shorthit.wav', LoadedAssets);
    sounds.gun.setVolume(volM / 2);

    // Missile explosion
    sounds.boom = loadSound('sounds/boom.wav', LoadedAssets);
    sounds.boom.setVolume(volM);

    // Missile launch
    sounds.missile = loadSound('sounds/missile.wav', LoadedAssets);
    sounds.missile.setVolume(volM);

    // Enemy death
    sounds.pop = loadSound('sounds/Explosion.wav', LoadedAssets);
    sounds.pop.setVolume(volM);

    // Railgun
    sounds.railgun = loadSound('sounds/railgun.wav', LoadedAssets);
    sounds.railgun.setVolume(volM);

    // Sniper rifle shot
    sounds.sniper = loadSound('sounds/sniper.wav', LoadedAssets);
    sounds.sniper.setVolume(volM);

    // Tesla coil
    sounds.spark = loadSound('sounds/spark.wav', LoadedAssets);
    sounds.spark.setVolume(volM);

    // Taunt enemy death
    sounds.taunt = loadSound('sounds/taunt.wav', LoadedAssets);
    sounds.taunt.setVolume(volM);

}

function loadSketch() {
    GroundTiles = {};
    // Tower
    GroundTiles.Tower = loadImage('Images/Background/build.png', LoadedAssets);
    // Empty
    GroundTiles.Empty = loadImage('Images/Background/terrain.png', LoadedAssets);
    // Wall
    GroundTiles.Wall = loadImage('Images/Background/walls.png', LoadedAssets);
    // Exit
    GroundTiles.exitStation = loadImage('Images/UI/send.svg', LoadedAssets);
}

function loadTiles() {
    Imgs = {};
    Imgs.Road = loadImage('Images/Background/terrain.png', LoadedAssets);
}

function loadEnemies() {
    enemyImg = {};
    enemyImg.greenHealth = loadImage('Images/Health/health_bar-05.png', LoadedAssets);
    enemyImg.redHealth = loadImage('Images/Health/health_bar-04.png', LoadedAssets);
    enemyImg.weak = loadImage('Images/Enemy/Desert/Bodies/body_halftrack/1.gif', LoadedAssets);
    enemyImg.strong = loadImage('Images/Enemy/Desert/Bodies/body_track/1.gif', LoadedAssets);
    enemyImg.fast = loadImage('Images/Enemy/Blue/Bodies/body_halftrack/1.gif', LoadedAssets);
    enemyImg.strongFast = loadImage('Images/Enemy/Blue/Bodies/body_track/1.gif'); // che, LoadedAssetsck
    enemyImg.medic = loadImage('Images/Enemy/Camo/Bodies/body_halftrack/1.gif', LoadedAssets);
    enemyImg.stronger = loadImage('Images/Enemy/Desert/Bodies/body_track/1.gif', LoadedAssets);
    enemyImg.faster = loadImage('Images/Enemy/Blue/Bodies/body_halftrack/2.gif', LoadedAssets);
    enemyImg.tank = loadImage('Images/Enemy/Camo/Bodies/body_track/1.gif', LoadedAssets);
    enemyImg.taunt = loadImage('Images/Enemy/Purple/Bodies/body_track/1.gif', LoadedAssets);
    enemyImg.spawner = loadImage('Images/Enemy/Purple/Bodies/body_halftrack/1.gif', LoadedAssets);
    enemyImg.medicBase = loadImage('Images/Enemy/Camo/Bodies/towers_walls_blank.png', LoadedAssets);
    enemyImg.strongerBase = loadImage('Images/Enemy/Desert/Bodies/bases.png', LoadedAssets);
    enemyImg.tankBase = loadImage('Images/Enemy/Camo/turret_01_mk1.png', LoadedAssets);
    enemyImg.tauntBase = loadImage('Images/Enemy/Purple/Bodies/towers_walls_blank.png', LoadedAssets);
}

function loadTowers() {
    towerImage = {};
    towerImage.base = loadImage('Images/Troops/towers_walls_blank.png', LoadedAssets);
    towerImage.gun = loadImage('Images/Troops/Weapons/turret_01_mk02.png', LoadedAssets);
    towerImage.slow = loadImage('Images/Troops/towers_walls_blank.png', LoadedAssets);
    towerImage.slowUp = loadImage('Images/Enemy/Camo/Bodies/towers_walls_blank.png', LoadedAssets);
    towerImage.snip = loadImage('Images/Troops/Weapons/body_03.png', LoadedAssets);
    towerImage.snipUp = loadImage('Images/Troops/Weapons/body_01.png', LoadedAssets);
    towerImage.allGun = loadImage('Images/Troops/Weapons/weapons.png', LoadedAssets);
    towerImage.missile = loadImage('Images/Troops/Weapons/missile.png', LoadedAssets);
    towerImage.missileUp = loadImage('Images/Troops/Weapons/missileup.png', LoadedAssets);
    towerImage.mBase = loadImage('Images/Troops/Weapons/Mbase.png', LoadedAssets);
    towerImage.tesla = loadImage('Images/Troops/Weapons/tesla.png', LoadedAssets);
    towerImage.teslaUp = loadImage('Images/Troops/Weapons/teslaup.png', LoadedAssets);
    towerImage.bomb = loadImage('Images/Troops/Weapons/bomb.png', LoadedAssets);
    towerImage.bombUp = loadImage('Images/Troops/Weapons/bombup.png', LoadedAssets);
}

function loadEffect() {
    effects = {};
    effects.dead = loadImage('Images/Effect/dead.png', LoadedAssets);
    effects.boom = loadImage('Images/Effect/boom1.gif', LoadedAssets);
    effects.spark = loadImage('Images/Effect/spark2.gif', LoadedAssets);
}


function cloneGif(gif, startFrame) {
    let gifClone = gif.get();
    // access original gif properties
    gp = gif.gifProperties;
    // make a new object for the clone
    gifClone.gifProperties = {
        displayIndex: gp.displayIndex,
        // we still point to the original array of frames
        frames: gp.frames,
        lastChangeTime: gp.lastChangeTime,
        loopCount: gp.loopCount,
        loopLimit: gp.loopLimit,
        numFrames: gp.numFrames,
        playing: gp.playing,
        timeDisplayed: gp.timeDisplayed
    };
    // optional tweak the start frame
    gifClone.setFrame(startFrame);

    return gifClone;
}