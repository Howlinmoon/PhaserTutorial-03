
TankGame.MainMenu = function (game) {

	this.music = null;
	this.playButton = null;

};

TankGame.MainMenu.prototype = {

	create: function () {
        // Attempting to create a static title page displaying the "Tanks" Logo
        // and waiting for a mouse click before continuing on
        
        //  Resize our game world to be a 2000 x 2000 square
        this.world.setBounds(-1000, -1000, 2000, 2000);

        //  Our tiled scrolling background
        land = this.add.tileSprite(0, 0,1000, 1000, 'earth');
        land.fixedToCamera = true;

		//	We've already preloaded our assets, so let's kick right into the Main Menu itself.
        logo = this.add.sprite(0, 200, 'logo');
        logo.fixedToCamera = true;


        console.log("MainMenu.create function called");

	},

	update: function () {

		//	Do some nice funky main menu effect here
        this.input.onDown.add(removeLogo, this);
        console.log("MainMenu.update function called");

	},

	startGame: function (pointer) {


        console.log("MainMenu.startGame function called - transfering control to Game");
		//	And start the actual game
		this.state.start('Game');

	}

};
