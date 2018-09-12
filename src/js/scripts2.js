var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });

//some global vars 
var player;
var left = false;
var right = false;
var duck = false;
var jump = false;

var keyMusic = "keymusic";
var music;
var sounds;
var stars;
var platforms;
var score = 0;
var scoreText;
var bombs;

function preload() {

    //spritesheet for animations
    game.load.spritesheet('mario', 'assets/dude.png', 32, 48); // key, sourcefile, framesize x, framesize y

    //background, ground, fireball images
    game.load.image('ground', 'assets/misc/2048x48-ground.png');
    game.load.image('platform', 'assets/platform.png');
    game.load.image('clouds', 'assets/misc/clouds.jpg');
    game.load.image('sky', 'assets/sky.png');
    game.load.image('star', 'assets/star.png');
    game.load.image('bomb', 'assets/bomb.png');

    //gamepad buttons    
    game.load.spritesheet('buttonhorizontal', 'assets/buttons/buttons-big/button-horizontal.png', 96, 64);
    game.load.spritesheet('buttonjump', 'assets/buttons/buttons-big/button-round-b.png', 96, 96);

    // fullscreen setup
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;

    var result = parseInt(localStorage.getItem(keyMusic), 10);
    var number;

    if (!result) {
        number = 1;
    } else {
        if (result >= 5) {
            result = 0;
        }
        number = result + 1;
    }

    localStorage.setItem(keyMusic, number);

    this.load.audio('music', `assets/audio/${number}.mp3`);
    this.load.audio('bomb', 'assets/audio/bomb.mp3');
    this.load.audio('gameover', 'assets/audio/gameover.mp3');
    this.load.audio('collected', 'assets/audio/collected.mp3');
}

function start() {

    sounds.shift();

    music.loopFull(0.6);
}

/**
 * Cria as plataformas na cena
 */
function createPlatforms() {

    //  A simple background for our game
    game.add.sprite(0, 0, 'sky');

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = game.add.group();

    //  We will enable physics for any object that is created in this group
    platforms.enableBody = true;

    // Here we create the ground.
    var ground = platforms.create(0, game.world.height - 64, 'platform');

    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    ground.scale.setTo(2, 2);

    //  This stops it from falling away when you jump on it
    ground.body.immovable = true;

    //  Now let's create two ledges
    var ledge = platforms.create(400, 400, 'platform');

    ledge.body.immovable = true;

    ledge = platforms.create(-150, 250, 'platform');

    ledge.body.immovable = true;
}

/**
 * Executa a música de fundo
 */
function playMusic() {
    music = game.add.audio('music');
    sounds = [music];
    game.sound.setDecodedCallback(sounds, start, this);
}

function createStars() {
    stars = game.add.group();

    stars.enableBody = true;

    //  Here we'll create 12 of them evenly spaced apart
    for (var i = 0; i < 12; i++) {
        //  Create a star inside of the 'stars' group
        var star = stars.create(i * 70, 0, 'star');

        //  Let gravity do its thing
        star.body.gravity.y = 400;

        //  This just gives each star a slightly random bounce value
        star.body.bounce.y = 0.7 + Math.random() * 0.2;
    }
}

/** 
 * Criação de grupo de bombas que poderão colidir com a plataforma e o player
*/
// function createBombs() {

//     bombs = game.add.group();
//     bombs.enableBody = true;

//     var bomb = bombs.create(i * 70, 0, 'bomb');
//     bomb.body.gravity.y = 400;
//     bomb.body.bounce.y = 0.7 + Math.random() * 0.2;

//     game.physics.add.collider(bombs, platforms);

//     game.physics.add.collider(player, bombs, hitBomb, null, this);
// }

/**
 * Criação de objeto que representa o texto de score apresentado no canto
 * superior esquerdo
 */
function createScoreText() {
    scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
}

function create() {
    if (!game.device.desktop) { game.input.onDown.add(gofull, this); } //go fullscreen on mobile devices

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //playMusic();

    createPlatforms();

    createStars();

    createScoreText();

    //createBombs();

    //createImages();

    //createStars();

    //game.physics.arcade.gravity.y = 1200;  //realistic gravity
    //game.world.setBounds(0, 0, 2000, 600);//(x, y, width, height)
    game.physics.arcade.setBoundsToWorld(true, true, false, true, false); //(left, right, top, bottom, setCollisionGroup)
    game.physics.arcade.friction = 5;   // default friction between ground and player or fireballs

    //clouds = game.add.tileSprite(0, 0, 2048, 600, 'clouds'); //add tiling sprite to cover the whole game world
    //ground = game.add.sprite(game.world.width / 2, game.world.height - 24, 'ground');
    //game.physics.p2.enable(ground);  //enable physics so our player will not fall through ground but collide with it
    //ground.body.static = true;    // ground should not move

    //setup our player
    player = game.add.sprite(450, game.world.height - 150, 'mario'); //create and position player    
    game.physics.arcade.enable(player);
    player.body.setCircle(22);  // collision circle 
    player.body.fixedRotation = true; // do not rotate on collision
    player.body.mass = 4;

    player.body.bounce.y = 0.2;
    player.body.gravity.y = 300;
    player.body.collideWorldBounds = true;

    // add some animations 
    player.animations.add('walk', [1, 2, 3, 4], 10, true);  // (key, framesarray, fps,repeat)
    player.animations.add('duck', [11], 0, true);
    player.animations.add('duckwalk', [10, 11, 12], 3, true);

    // create our virtual game controller buttons 
    buttonjump = game.add.button(700, 500, 'buttonjump', null, this, 0, 1, 0, 1);  //game, x, y, key, callback, callbackContext, overFrame, outFrame, downFrame, upFrame
    buttonjump.fixedToCamera = true;  //our buttons should stay on the same place  
    buttonjump.events.onInputOver.add(function () { jump = true; });
    buttonjump.events.onInputOut.add(function () { jump = false; });
    buttonjump.events.onInputDown.add(function () { jump = true; });
    buttonjump.events.onInputUp.add(function () { jump = false; });

    buttonleft = game.add.button(0, 525, 'buttonhorizontal', null, this, 0, 1, 0, 1);
    buttonleft.fixedToCamera = true;
    buttonleft.events.onInputOver.add(function () { left = true; });
    buttonleft.events.onInputOut.add(function () { left = false; });
    buttonleft.events.onInputDown.add(function () { left = true; });
    buttonleft.events.onInputUp.add(function () { left = false; });

    buttonright = game.add.button(160, 525, 'buttonhorizontal', null, this, 0, 1, 0, 1);
    buttonright.fixedToCamera = true;
    buttonright.events.onInputOver.add(function () { right = true; });
    buttonright.events.onInputOut.add(function () { right = false; });
    buttonright.events.onInputDown.add(function () { right = true; });
    buttonright.events.onInputUp.add(function () { right = false; });
};

function update() {

    //  Collide the player and the stars with the platforms
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(stars, platforms);
    game.physics.arcade.overlap(player, stars, collectStar, null, this);

    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;

    // define what should happen when a button is pressed
    if (left && !duck) {
        player.scale.x = 1;
        player.body.velocity.x = -150
        player.animations.play('walk');
    }
    else if (right && !duck) {
        player.scale.x = -1;
        player.body.velocity.x = 150
        player.animations.play('walk');
    }
    else if (duck && !left && !right) {
        player.body.velocity.x = 0;
        player.animations.play('duck');
    }
    else if (duck && right) {
        player.scale.x = -1;
        player.body.velocity.x = -200
        player.animations.play('duckwalk');
    }
    else if (duck && left) {
        player.scale.x = 1;
        player.body.velocity.x = 200
        player.animations.play('duckwalk');
    }
    else {
        player.loadTexture('mario', 0);
    }

    if (jump) { jump_now(); player.loadTexture('mario', 5); }  //change to another frame of the spritesheet    
    if (duck) { player.body.setCircle(16, 0, 6); } else { player.body.setCircle(22); }  //when ducking create a smaller hitarea - (radius,offsetx,offsety)
    if (game.input.currentPointers == 0 && !game.input.activePointer.isMouse) { right = false; left = false; duck = false; jump = false; } //this works around a "bug" where a button gets stuck in pressed state
};

function render() {
}

/**
 * Caso o player encoste em uma das bombas
 * @param {*} player 
 * Objeto que representa o player que será manipulado pel usuário
 * @param {*} bomb 
 * Objeto que representa a bomba encostada pelo player
 */
function hitBomb(player, bomb) {
    game.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    music.stop();

    let musicBomb = this.sound.add('bomb');
    musicBomb.play();

    let musicGameOver = this.sound.add('gameover');
    musicGameOver.play();
}

function collectStar(player, star) {

    // Removes the star from the screen
    star.kill();

    //  Add and update the score
    score += 10;
    scoreText.text = 'Score: ' + score;

    //if (stars.countActive(true) === 0) {

    //    stars.children.iterate(function (child) {
    //        child.enableBody(true, child.x, 0, true, true);
    //    });

    //    var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

    //    var bomb = bombs.create(x, 16, 'bomb');
    //    bomb.setBounce(1);
    //    bomb.setCollideWorldBounds(true);
    //    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    //    bomb.allowGravity = false;
    //}
}

//some useful functions
function gofull() { game.scale.startFullScreen(false); }
function jump_now() {  //jump with small delay
    if (player.body.touching.down) {
        player.body.velocity.y = -350;
    }
}
