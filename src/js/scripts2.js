
var configuration = {
    'canvas_width_max': 2048,
    'canvas_width': 1000,
    'canvas_height_max': 2048,
    'canvas_height': 650,
    'scale_ratio': 1,
    'aspect_ratio': 1,
};

configuration.canvas_width = window.screen.availWidth * window.devicePixelRatio;
configuration.canvas_height = window.screen.availHeight * window.devicePixelRatio;
configuration.aspect_ratio = configuration.canvas_width / configuration.canvas_height;
if (configuration.aspect_ratio < 1) configuration.scale_ratio = configuration.canvas_height / configuration.canvas_height_max;
else configuration.scale_ratio = configuration.canvas_width / configuration.canvas_width_max;

game = new Phaser.Game(configuration.canvas_width, configuration.canvas_height, Phaser.AUTO, '', { preload: preload, create: create, update: update });

//var game = new Phaser.Game(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {
    //game.load.image('sky', 'assets/sky.png');
    //game.load.image('ground', 'assets/platform.png');
    game.load.image('star', 'assets/star.png');
    //game.load.spritesheet('dude', 'assets/dude.png', 32, 48);

    // game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
    // game.scale.pageAlignHorizontally = true;
    // game.scale.pageAlignVertically = true;
}

function create() {
    game.add.sprite(0, 0, 'star');

    this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;

    // this.game.scale.setMaximum();
    // this.game.scale.setScreenSize(true);
    // this.game.scale.pageAlignVertically = false;
    // this.game.scale.pageAlignHorizontally = false;
    // this.game.scale.startFullScreen(false);

    // game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    // game.scale.setScreenSize = true;
    // game.stage.scale.pageAlignHorizontally = true;
    // game.stage.scale.pageAlignVeritcally = true;

    //game.scale.refresh();

    //game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
    // window.addEventListener('resize', resize);
    // resize();
}

var resizeGame = this._fitScreen = function () {
    //calculates aspect ratio of the game
    var gameAspRatio = mt.data.map.viewportWidth / mt.data.map.viewportHeight;
    //calculates aspect ratio of the device
    var deviceAspRatio = window.innerWidth / window.innerHeight;
    var ratioDiv = gameAspRatio / deviceAspRatio;

    //if the screen is too narrow (larger than), there will be black borders on top and bottom of the screen
    //if too wide (smaller than) - borders on the sides
    if (ratioDiv > 1.2 || ratioDiv < 0.8) {
        game.scale.pageAlignVertically = true;
        game.scale.pageAlignHorizontally = true;
        game.scale.setShowAll();
        game.scale.refresh();
    }
    //else game is stretched
    else {
        game.scale.setMaximum();
        game.scale.setScreenSize(true);
    }
};

function update() {
}

// function resize() {
//     var canvas = game.canvas, width = window.innerWidth, height = window.innerHeight;
//     var wratio = width / height, ratio = canvas.width / canvas.height;

//     if (wratio < ratio) {
//         canvas.style.width = width + "px";
//         canvas.style.height = (width / ratio) + "px";
//     } else {
//         canvas.style.width = (height * ratio) + "px";
//         canvas.style.height = height + "px";
//     }
// }