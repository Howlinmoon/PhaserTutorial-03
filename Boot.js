var TankGame = {};  // Name of the object that holds all game states - user defined name

TankGame.Boot = function (game) {

};

TankGame.Boot.prototype = {

    init: function () {

        //  Multi-touch support, 1 is single touch
        this.input.maxPointers = 1;

        //  Pause game on loss of focus
        this.stage.disableVisibilityChange = true;

        if (this.game.device.desktop) {
            //  If you have any desktop specific settings, they can go in here
            this.scale.pageAlignHorizontally = true;
        } else {
            //  "scale the game, no lower than 480x260 and no higher than 1024x768"
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.scale.setMinMax(480, 260, 1000, 1000);
            this.scale.forceLandscape = true;
            this.scale.pageAlignHorizontally = true;
        }
        
        console.log("Boot.init called");

    },

    preload: function () {

        //  Here we load the assets required for our preloader - if we had any
        // these are examples
        // this.load.image('preloaderBackground', 'images/preloader_background.jpg');
        //this.load.image('preloaderBar', 'images/preloadr_bar.png');
        console.log("Boot.preload called");

    },

    create: function () {

        //  By this point the preloader assets have loaded to the cache, we've set the game settings
        //  So now let's start the real preloader going
        console.log("Boot.create called - now passing control to Preloader");
        this.state.start('Preloader');
    }

};
