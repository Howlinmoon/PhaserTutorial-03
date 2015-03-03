
TankGame.Preloader = function (game) {

	this.background = null;
	this.preloadBar = null;
    this.titleText = null;
	this.ready = false;

};

TankGame.Preloader.prototype = {

	preload: function () {

		//	Here we load the rest of the assets our game needs.
		//	+ lots of other required assets here - these are referenced in Boot.js
        console.log("Preloader.preload function called - trying to load our assets");
        // the preload progress bar
        this.preloadBar = this.add.sprite(this.world.centerX, this.world.centerY, 'preloadBar');
        this.preloadBar.anchor.setTo(0.5, 0.5);
        this.load.setPreloadSprite(this.preloadBar);
        // the title text - placement here does not seem to matter
        this.titleText = this.add.image(this.world.centerX, this.world.centerY, 'titleimage');
        this.titleText.anchor.setTo(0.5, 0.5);
        
        this.load.atlas('tank', 'assets/tanks.png', 'assets/tanks.json');
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
