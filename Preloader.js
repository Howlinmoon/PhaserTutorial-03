
TankGame.Preloader = function (game) {

	this.background = null;
	this.preloadBar = null;
    this.titleText = null;
	this.ready = false;

};

TankGame.Preloader.prototype = {

	preload: function () {

		//	These are the assets we loaded in Boot.js
		//	A nice sparkly background and a loading progress bar
		//this.background = this.add.sprite(0, 0, 'preloaderBackground');
		//this.preloadBar = this.add.sprite(300, 400, 'preloaderBar');

		//	This sets the preloadBar sprite as a loader sprite.
		//	What that does is automatically crop the sprite from 0 to full-width
		//	as the files below are loaded in.
		// this.load.setPreloadSprite(this.preloadBar);

		//	Here we load the rest of the assets our game needs.
		//	As this is just a Project Template I've not provided these assets, swap them for your own.
		// this.load.image('titlepage', 'images/title.jpg');
		// this.load.atlas('playButton', 'images/play_button.png', 'images/play_button.json');
		// this.load.audio('titleMusic', ['audio/main_menu.mp3']);
		// this.load.bitmapFont('caslon', 'fonts/caslon.png', 'fonts/caslon.xml');
		//	+ lots of other required assets here
        console.log("Preloader.preload function called - trying to load our assets");
        // the preload progress bar
        this.preloadBar = this.add.sprite(this.world.centerX, this.world.centerY, 'preloadBar');
        this.preloadBar.anchor.setTo(0.5, 0.5);
        this.load.setPreloadSprite(this.preloadBar);
        // the title text
        this.titleText = this.add.image(this.world.centerX, this.world.centerY-220, 'titleimage');
        this.titleText.anchor.setTo(0.5, 0.5);
        
        this.load.atlas('enemy', 'assets/enemy-tanks.png', 'assets/tanks.json');
        this.load.image('logo', 'assets/logo.png');
        this.load.image('bullet', 'assets/bullet.png');
        this.load.image('earth', 'assets/scorched_earth.png');
        this.load.spritesheet('kaboom', 'assets/explosion.png', 64, 64, 23);


	},

	create: function () {

		//	Once the load has finished we disable the crop because we're going to sit in the update loop for a short while as the music decodes
		this.preloadBar.cropEnabled = false;
        console.log("Preloader.create function called - preparing to call MainMenu");
        this.state.start('MainMenu');

	},
    
    update: function() {
        this.ready = true;
    }

};
