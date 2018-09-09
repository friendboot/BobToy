(function () {

    /**
     * Objeto de configuração que deve ser passado para a lib 'Phaser'
     * funcione corretamente
     */
    var config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 300 },
                debug: false
            }
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };

    var game = new Phaser.Game(config);
    var keyMusic = "keymusic";
    var that;
    var platforms;
    var player;
    var cursors;
    var stars;
    var bombs;
    var score = 0;
    var scoreText;
    var gameOver = false;
    var music;

    /**
     * Método da lib 'Phaser' que serve para carregar todo o conteúdo que será
     * usado no game, sendo, audio, imagens, videos etc...
     */
    function preload() {
        this.load.image('sky', 'assets/sky.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('bomb', 'assets/bomb.png');

        this.load.spritesheet('dude',
            'assets/dude.png',
            { frameWidth: 32, frameHeight: 48 }
        );

        var result = parseInt(localStorage.getItem(keyMusic), 10);
        var number;

        if (!result) {
            number = 1;
        } else {
            if(result >= 15){
                result = 0;
            }
            number = result+1;
        }

        localStorage.setItem(keyMusic, number);

        this.load.audio('music', `assets/audio/${number}.mp3`, {
            instances: 1
        });

        this.load.audio('bomb', 'assets/audio/bomb.mp3', {
            instances: 1
        });

        this.load.audio('gameover', 'assets/audio/gameover.mp3', {
            instances: 1
        });

        this.load.audio('collected', 'assets/audio/collected.mp3', {
            instances: 1
        });
    }

    /**
     * Método da lib 'Phaser' que serve para adiciona objetos a cena
     */
    function create() {

        that = this;

        playMusic();

        createImages();

        createStars();

        createPlatforms();

        createPlayer();

        createAnimations();

        createCursor();

        createCollision();

        createOverlaps();

        createScoreText();

        createBombs();
    }

    /**
     * Método da lib 'Phaser' que é invocado a todo momento para que
     * possamos incluir a lógica que quisermos e dar a sensação para o usuário
     * de que algo está acontecendo no game 
     */
    function update() {
        if (cursors.left.isDown) {
            player.setVelocityX(-160);

            player.anims.play('left', true);
        }
        else if (cursors.right.isDown) {
            player.setVelocityX(160);

            player.anims.play('right', true);
        }
        else {
            player.setVelocityX(0);

            player.anims.play('turn');
        }

        if (cursors.up.isDown && player.body.touching.down) {
            player.setVelocityY(-330);
        }
    }

    /**
     * Executa a música de fundo
     */
    function playMusic() {
        music = that.sound.add('music');
        music.play({
            loop: true
        });
    }

    /**
     * 
     * @param {*} player 
     * Objeto que representa o jogador que será manipulado pelo user
     * @param {*} star 
     * Objeto que representa estrela
     */
    function collectStar(player, star) {

        let musicCollected = this.sound.add('collected');
        musicCollected.play();

        //A cada estrela captura, ela desaparece da tela
        star.disableBody(true, true);

        //A cada estrela capturada, é acrescentado 10 pontos ao score do player
        score += 10;
        scoreText.setText('Score: ' + score);

        //No momento em que o player capturar todas as estrelas, acrescenta-se
        //mais uma bomba ao cenário e novas estrelas são colocadas para serem
        //capturadas
        if (stars.countActive(true) === 0) {

            stars.children.iterate(function (child) {
                child.enableBody(true, child.x, 0, true, true);
            });

            var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

            var bomb = bombs.create(x, 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
            bomb.allowGravity = false;
        }
    }

    /** 
     * Criação de grupo de bombas que poderão colidir com a plataforma e o player
    */
    function createBombs() {
        bombs = that.physics.add.group();

        that.physics.add.collider(bombs, platforms);

        that.physics.add.collider(player, bombs, hitBomb, null, that);
    }

    /**
     * Caso o player encoste em uma das bombas
     * @param {*} player 
     * Objeto que representa o player que será manipulado pel usuário
     * @param {*} bomb 
     * Objeto que representa a bomba encostada pelo player
     */
    function hitBomb(player, bomb) {
        that.physics.pause();

        player.setTint(0xff0000);

        player.anims.play('turn');

        gameOver = true;

        music.stop();

        let musicBomb = this.sound.add('bomb');
        musicBomb.play();

        let musicGameOver = this.sound.add('gameover');
        musicGameOver.play();
    }

    /**
     * Criação de objeto que representa o texto de score apresentado no canto
     * superior esquerdo
     */
    function createScoreText() {
        scoreText = that.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
    }

    /**
     * Faz declaração de todos os objetos que podem haver uma sobreposição
     */
    function createOverlaps() {
        that.physics.add.overlap(player, stars, collectStar, null, that);
    }

    /**
     * Declara que pode haver colisão entre estrelas e plataforma
     */
    function createCollision() {
        that.physics.add.collider(stars, platforms);
    }

    /**
     * Criação de grupo de estrelas
     */
    function createStars() {
        stars = that.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
        });

        //Ao colidir estrelas com plataformas, é realizado calculo para que
        //a estrela gradualmente vá se aproximando do plataforma, até que fique
        //totalmente parada sobre a plataforma
        stars.children.iterate(function (child) {
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        });
    }

    /**
     * Criação de cursor que é responsável por fazer toda a movimentação do player
     */
    function createCursor() {
        cursors = that.input.keyboard.createCursorKeys();
    }

    /**
     * Cria imagens na cena
     */
    function createImages() {
        that.add.image(400, 300, 'sky');
        that.add.image(400, 300, 'star');
    }

    /**
     * Cria as plataformas na cena
     */
    function createPlatforms() {
        platforms = that.physics.add.staticGroup();

        platforms.create(400, 568, 'ground').setScale(2).refreshBody();

        platforms.create(600, 400, 'ground');
        platforms.create(50, 250, 'ground');
        platforms.create(750, 220, 'ground');
    }

    /**
     * Cria o player que o usuário irá manipular
     */
    function createPlayer() {
        player = that.physics.add.sprite(100, 450, 'dude');

        player.setBounce(0.2);
        player.setCollideWorldBounds(true);
        that.physics.add.collider(player, platforms);
    }

    /**
     * Cria as animações que serão disparadas para cada movimento feito pelo
     * player
     */
    function createAnimations() {
        that.anims.create({
            key: 'left',
            frames: that.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        that.anims.create({
            key: 'turn',
            frames: [{ key: 'dude', frame: 4 }],
            frameRate: 20
        });

        that.anims.create({
            key: 'right',
            frames: that.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
    }

}());