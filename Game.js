
TankGame.Game = function (game) {

    //  When a State is added to Phaser it automatically has the following properties set on it:

    this.game;      //  a reference to the currently running game (Phaser.Game)
    this.add;       //  used to add sprites, text, groups, etc (Phaser.GameObjectFactory)
    this.camera;    //  a reference to the game camera (Phaser.Camera)
    this.cache;     //  the game cache (Phaser.Cache)
    this.input;     //  the global input manager. You can access this.input.keyboard, this.input.mouse, as well from it. (Phaser.Input)
    this.load;      //  for preloading assets (Phaser.Loader)
    this.math;      //  lots of useful common math operations (Phaser.Math)
    this.sound;     //  the sound manager - add a sound, play one, set-up markers, etc (Phaser.SoundManager)
    this.stage;     //  the game stage (Phaser.Stage)
    this.time;      //  the clock (Phaser.Time)
    this.tweens;    //  the tween manager (Phaser.TweenManager)
    this.state;     //  the state manager (Phaser.StateManager)
    this.world;     //  the game world (Phaser.World)
    this.particles; //  the particle manager (Phaser.Particles)
    this.physics;   //  the physics manager (Phaser.Physics)
    this.rnd;       //  the repeatable random number generator (Phaser.RandomDataGenerator)

    //  You can use any of these from any function within this State.
    //  But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.

    
    // Lots of messy globals
    var enemyBullets;

    var TO_RADIANS = Math.PI / 180;
    var TO_DEGREES = 180 / Math.PI;

    var land;

    var shadow;
    var tank;
    var turret;

    var enemies;
    var enemiesTotal = 0;
    var enemiesAlive = 0;
    var explosions;

    var currentSpeed = 0;
    var cursors;

    var bullets;
    var fireRate = 100;
    var nextFire = 0;
    var time;
    
    
    

};

TankGame.Game.prototype = {

    

    create: function () {

        //  Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!
        console.log("Game.create function called");
        // For now - we will define the enemy tank class here
        // Probably better to have it in a file all its own

        // try initializing this.nextFire and fireRate
        this.nextFire = 0;
        this.fireRate = 100;

        
        //  Resize our game world to be a 2000 x 2000 square
        this.world.setBounds(-1000, -1000, 2000, 2000);

        //  Our tiled scrolling background
        land = this.add.tileSprite(0, 0,1000, 1000, 'earth');
        land.fixedToCamera = true;

        //  The base of our tank
        tank = this.add.sprite(0, 0, 'tank', 'tank1');
        tank.anchor.setTo(0.5, 0.5);
        tank.animations.add('move', [ 'tank1', 'tank2', 'tank3', 'tank4', 'tank5', 'tank6' ], 20, true);

        //  This will force it to decelerate and limit its speed
        this.physics.enable(tank, Phaser.Physics.ARCADE);
        tank.body.drag.set(0.3);
        tank.body.maxVelocity.setTo(400, 400);
        tank.body.collideWorldBounds = true;

        //  Finally the turret that we place on-top of the tank body
        turret = this.add.sprite(0, 0, 'tank', 'turret');
        turret.anchor.setTo(0.3, 0.5);

        //  The enemies bullet group
        enemyBullets = this.add.group();
        enemyBullets.enableBody = true;
        enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
        enemyBullets.createMultiple(100, 'bullet');

        enemyBullets.setAll('anchor.x', 0.5);
        enemyBullets.setAll('anchor.y', 0.5);
        enemyBullets.setAll('outOfBoundsKill', true);
        enemyBullets.setAll('checkWorldBounds', true);
        console.log("enemyBullets defined here OK");

        
        
        
		EnemyTank = function(index, game, player, bullets) {

			// Randomizes the intial location of the enemy tank
			//var x = game.world.randomX;
			//var y = game.world.randomY;
            
            // Start the tanks along the bottom of the world, equally spaced
			var y = 1000;
            var x = index * 300 + -700;
            console.log("Placing Tank #"+index+" X: "+x+", Y: "+y);

			this.game = game;
			// how much damage a tank can take before exploding.
			// each shot does 1 damage
			this.health = 5;
			this.player = player;
			this.bullets = bullets;
			// this is the delay between firing - make this too low
            // and they will slaughter the player quickly!
			this.fireRate = 3000;
			this.nextFire = 0;
			this.alive = true;
            // whether or not the tank has spotted the player tank
            this.spottedPlayer = false;

			this.shadow = game.add.sprite(x, y, 'enemy', 'shadow');
			this.tank = game.add.sprite(x, y, 'enemy', 'tank1');
			this.turret = game.add.sprite(x, y, 'enemy', 'turret');

			this.shadow.anchor.set(0.5);
			this.tank.anchor.set(0.5);
			this.turret.anchor.set(0.3, 0.5);

			this.tank.name = index.toString();
			game.physics.enable(this.tank, Phaser.Physics.ARCADE);
			this.tank.body.immovable = false;
			this.tank.body.collideWorldBounds = true;
			this.tank.body.bounce.setTo(1, 1);

			this.tank.angle = game.rnd.angle();

			var randomInitialSpeed =  (Math.floor(Math.random() * 500) + 1 )
			game.physics.arcade.velocityFromRotation(this.tank.rotation, 0, this.tank.body.velocity);

		};


		// a very basic method that damages the enemy tank
        // 'amount' contains the amount of damage to apply against the tank's health
		// if the current tank is so damaged its health is 0, it is destroyed here
		EnemyTank.prototype.damage = function(amount) {
			this.health -= amount;

			if (this.health <= 0) {
				this.alive = false;
				
				this.shadow.kill();
				this.tank.kill();
				this.turret.kill();
				
				// true indicates the tank is dead - and signals we need to clean it up
				return true;
			}
			// otherwise, the tank is still alive, so return false
			return false;
		}

		// This method attempts to turn the tank in the opposite direction
		// which will hopefully drive it away from whatever it collided with.
		EnemyTank.prototype.turnAround = function(newSpeed) {
			// set the velocity to what was passed in - newSpeed
			// ignore new speed - and just randomize it
			var newRandomSpeed =  (Math.floor(Math.random() * 250) + 250 )
			this.physics.arcade.velocityFromRotation(this.tank.rotation, newRandomSpeed, this.tank.body.velocity);
			var oldTankAngle = this.tank.angle;
			// old tankAngle is in degrees, and can be anywhere between -180 and +180
			// we'll subtract 180 from it - and if it is less than -180, we'll add 360 to it.
			var newTankAngle = oldTankAngle - 180;
			// adjust, if we went too far negative
			if (newTankAngle < -180) {
				newTankAngle += 360;
			}
			// assign the new angle  back to the tank
			this.tank.angle = newTankAngle;
			// ideally, this just spun the tank around
		}

		
		EnemyTank.prototype.update = function() {

			this.shadow.x = this.tank.x;
			this.shadow.y = this.tank.y;
			this.shadow.rotation = this.tank.rotation;

			this.turret.x = this.tank.x;
			this.turret.y = this.tank.y;
			this.turret.rotation = this.game.physics.arcade.angleBetween(this.tank, this.player);

			var distanceFromPlayer = this.game.physics.arcade.distanceBetween(this.tank, this.player);
			//console.log("Tank Number: "+this.tank.name+" is this far from the player: "+distanceFromPlayer);
            
            // has the enemy tank spotted the player?
            // assume that if the enemy is within 1000pix - it has spotted the player
            if (this.tank.name == 0) {
                // only report tank 0
                if (distanceFromPlayer < 1000) {
                    // console.log("Tank 0 is in of visual range of the player");
                    if (this.tank.spottedPlayer == false) {
                        console.log("Tank 0 has spotted the player - range: "+distanceFromPlayer);
                        this.tank.spottedPlayer = true;
                    } else {
                        //console.log("this.tank.spottedPlayer must be true");
                    }
                } else {
                    
                    //console.log("Tank 0 is out of visual range of the player");
                    
                    if (this.tank.spottedPlayer == true) {
                        console.log("Tank 0 has lost sight of the player");
                        this.tank.spottedPlayer = false;
                    }
                }
            }
            

			// the enemy tanks fire when they are within 300 pix of the player
			if (distanceFromPlayer < 300) {
				// player tank is in range
				if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0) {
					// basically checks to see if enough time has elapsed since the tank last fired
					// and this.bullets.countDead() checks to see if there is at least one dead object in the group
					this.nextFire = this.game.time.now + this.fireRate;

					var bullet = this.bullets.getFirstDead();

					bullet.reset(this.turret.x, this.turret.y);

					// Enemy tank bullet speed - higher is faster
					bullet.rotation = this.game.physics.arcade.moveToObject(bullet, this.player, 500);
				}
			}

		};
        
        
        // attempt to spawn enemies.
            enemies = [];

			enemiesTotal = 5;
			enemiesAlive = 5;

			// EnemyTank = function(index, game, player, bullets)
			
			for (var i = 0; i < enemiesTotal; i++) {
				enemies.push(new EnemyTank(i, this, tank, enemyBullets));
			}

			//  A shadow below our (player) tank
			shadow = this.add.sprite(0, 0, 'tank', 'shadow');
			shadow.anchor.setTo(0.5, 0.5);

			//  Our bullet group
			bullets = this.add.group();
			bullets.enableBody = true;
			bullets.physicsBodyType = Phaser.Physics.ARCADE;
			bullets.createMultiple(5, 'bullet', 0, false);
			bullets.setAll('anchor.x', 0.5);
			bullets.setAll('anchor.y', 0.5);
			bullets.setAll('outOfBoundsKill', true);
			bullets.setAll('checkWorldBounds', true);

			//  Explosion pool
			explosions = this.add.group();

			for (var i = 0; i < 10; i++) {
				var explosionAnimation = explosions.create(0, 0, 'kaboom', [ 0 ], false);
				explosionAnimation.anchor.setTo(0.5, 0.5);
				explosionAnimation.animations.add('kaboom');
			}

			tank.bringToTop();
			turret.bringToTop();
            this.camera.follow(tank);
			this.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
			this.camera.focusOnXY(0, 0);

			cursors = this.input.keyboard.createCursorKeys();
			
			// I Prefer the ASWD keys for driving
			UpKey = this.input.keyboard.addKey(Phaser.Keyboard.W);
			LeftKey = this.input.keyboard.addKey(Phaser.Keyboard.A);
			RightKey = this.input.keyboard.addKey(Phaser.Keyboard.D);
			DownKey = this.input.keyboard.addKey(Phaser.Keyboard.S);

    },

    update: function () {
        //console.log("Game.update function called");
        //console.log("update this.time.now is supposedly: "+this.time.now);

        // check to see if any enemy bullet objects have hit the player tank
        this.physics.arcade.overlap(enemyBullets, tank, this.bulletHitPlayer,null, this);

        // assume all enemies are dead
        console.log("this.nextFire: "+this.nextFire);
        enemiesAlive = 0;

        for (var i = 0; i < enemies.length; i++) {
            if (enemies[i].alive) {
                enemiesAlive++;
                // original method - collide
                // game.physics.arcade.collide(tank, enemies[i].tank);
                // experimental method - overlap
                this.physics.arcade.overlap(tank, enemies[i].tank, this.enemyCollidePlayer, null, this);
                // Try to make enemy tanks collide with each other
                for (var j = 0; j < enemies.length; j++) {
                    // don't collide with ourself!
                    if (j != i) {
                        this.physics.arcade.overlap(enemies[j].tank, enemies[i].tank, this.enemyCollideEnemy, null, this);
						}
					}
					this.physics.arcade.overlap(bullets, enemies[i].tank, this.bulletHitEnemy, null, this);
					enemies[i].update();
				}
			}

			if (cursors.left.isDown || LeftKey.isDown) {
				tank.angle -= 1;
			} else if (cursors.right.isDown || RightKey.isDown) {
				tank.angle += 1;
			}

			if (cursors.up.isDown || UpKey.isDown) {
				//  The speed we'll travel at
				this.currentSpeed = 150;
			} else {
				if (this.currentSpeed > 0) {
					this.currentSpeed -= 4;
				}
			}

			if (this.currentSpeed > 0) {
				this.physics.arcade.velocityFromRotation(tank.rotation, this.currentSpeed, tank.body.velocity);
			}
			
			// need to check and see if the tank (player) collided with any enemy tanks
            // if so - just stop the player.
			this.physics.arcade.overlap(tank, enemies, this.playerHitEnemy, null, this);

			
			land.tilePosition.x = -this.camera.x;
			land.tilePosition.y = -this.camera.y;

			//  Position all the parts and align rotations
			shadow.x = tank.x;
			shadow.y = tank.y;
			shadow.rotation = tank.rotation;

			turret.x = tank.x;
			turret.y = tank.y;

			turret.rotation = this.physics.arcade.angleToPointer(turret);

			if (this.input.activePointer.isDown) {
				//  Boom!
				this.fire();
			}
        
    },
    
    bulletHitPlayer: function (tank, bullet) {
        // at the moment, nothing happens when the player tank gets hit
        // except we kill off a bullet.
        bullet.kill();
    },
    
    
    bulletHitEnemy: function(tank, bullet) {
        // when an enemy tank is hit by the player
        // we kill off the bullet
        bullet.kill();
        // and then decrement the tank's health
        // enemies is an array
        // tank.name is an index
        // thus, enemies[tank.name is a pointer to the tank in the enemies array
        var tankHealth = enemies[tank.name].health;
        var tankName  = enemies[tank.name].tank.name;
        console.log("Tank Id: "+tankName+" health (before) = "+tankHealth);
        var destroyed = enemies[tank.name].damage(1);
        // if 'destroyed' is true, the tank is out of health - so we destory it.
        if (destroyed) {
            var explosionAnimation = explosions.getFirstExists(false);
            explosionAnimation.reset(tank.x, tank.y);
            explosionAnimation.play('kaboom', 30, false, true);
        }
    },

    enemyCollidePlayer: function(player, enemy) {
        var tankName  = enemies[enemy.name].tank.name;

        if (enemy.body.touching.up) {
            //console.log("Tank Id: "+tankName+" going direction UP ran into the player tank");
            // try to steer the tank directly away from the collision point at speed 100
            enemies[enemy.name].turnAround(100);
        }

        if (enemy.body.touching.down) {
            //console.log("Tank Id: "+tankName+" going direction DOWN ran into the player tank");
            // try to steer the tank directly away from the collision point at speed 100
            enemies[enemy.name].turnAround(100);
        }

        if (enemy.body.touching.left) {
            //console.log("Tank Id: "+tankName+" going direction LEFT ran into the player tank");
            // try to steer the tank directly away from the collision point at speed 100
            enemies[enemy.name].turnAround(100);
        }

        if (enemy.body.touching.right) {
            //console.log("Tank Id: "+tankName+" going direction RIGHT ran into the player tank");
            // try to steer the tank directly away from the collision point at speed 100
            enemies[enemy.name].turnAround(100);
        }

    },
		
    playerHitEnemy: function(tank, enemies) {
        console.log("Detected a collision between the player and an enemy tank")
    },

    enemyCollideEnemy: function(enemy1, enemy2) {
        var tankName1  = enemies[enemy1.name].tank.name;
        var tankName2  = enemies[enemy2.name].tank.name;

        if (enemy1.body.touching.up) {
            //console.log("Tank "+tankName1+" going direction UP has collided with "+tankName2);
            // try to steer the tank directly away from the collision point at speed 100
            enemies[enemy1.name].turnAround(100);
        }

        if (enemy1.body.touching.down) {
            //console.log("Tank "+tankName1+" going direction DOWN has collided with "+tankName2);
            // try to steer the tank directly away from the collision point at speed 100
            enemies[enemy1.name].turnAround(100);
        }

        if (enemy1.body.touching.left) {
            //console.log("Tank "+tankName1+" going direction LEFT has collided with "+tankName2);
            // try to steer the tank directly away from the collision point at speed 100
            enemies[enemy1.name].turnAround(100);
        }

        if (enemy1.body.touching.right) {
            //console.log("Tank "+tankName1+" going direction RIGHT has collided with "+tankName2);
            // try to steer the tank directly away from the collision point at speed 100
            enemies[enemy1.name].turnAround(100);
        }
    },
    
    fire: function() {
        if (this.time.now > this.nextFire && bullets.countDead() > 0) {
            this.nextFire = this.time.now + this.fireRate;
            var bullet = bullets.getFirstExists(false);

            bullet.reset(turret.x, turret.y);

            bullet.rotation = this.physics.arcade.moveToPointer(bullet,
                    1000, this.input.activePointer, 500);
        }

    },

    quitGame: function (pointer) {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        console.log("Game.quitGame function called - returning to MainMenu state");
        this.state.start('MainMenu');

    }

};
