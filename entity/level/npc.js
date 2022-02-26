/**
 * This entity is used as the shopkeeper to buy equipment for the player
 */
class NPC extends AbstractEntity {

    constructor(game, x, y) {
        super(game, x, y, "Shopkeeper NPC", 10, 88, 88, 2.5)
        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/enemy/wizard.png");

        // Mapping animations and mob states
        this.animations = []; // [state][direction]
        this.states = { inactive: 0, awaking: 1, active: 2 };
        this.directions = { left: 0, right: 1 };
        this.direction = this.directions.left;
        this.state = this.states.inactive;
        this.scale = 2.5;

        this.fallAcc = 1000;

        // Bounding Box Offset / Stuff
        this.xOffset = -6 * this.scale;
        this.yOffset = 0 * this.scale;
        this.width = 88 * this.scale;
        this.height = 80 * this.scale;
        this.visionwidth = 700 * this.scale;

        // Shop
        this.showText = false;
        this.fontSize = DEFAULT_FONT_SIZE;
        this.shopGUI = null;

        // Other
        this.loadAnimations();
        this.updateBoxes();
        this.myHoverText = "Press \'W\' to shop";
    };

    activateShop() {
        this.shopGUI = new Shop(this.game);
        this.game.addEntityToFront(this.shopGUI);
        SHOP_ACTIVE = true;
    };

    deactivateShop() {
        this.shopGUI.removeFromWorld = true;
        SHOP_ACTIVE = false;
        this.shopGUI = null;
    };

    updateBoxes() {
        this.updateBB();
    }

    updateBB() {
        this.BB = new BoundingBox(this.x + this.xOffset, this.y + this.yOffset, this.width, this.height);
        this.VB = new BoundingBox(this.x + 38 * this.scale - this.visionwidth / 2, this.y + this.yOffset, this.visionwidth, 80 * this.scale);
    };

    update() {
        const TICK = this.game.clockTick;

        // Checks status of global SHOP_ACTIVE to determine whether to open instance of shop
        if (SHOP_ACTIVE && this.shopGUI == null) {
            this.activateShop();
        }
        else if (!SHOP_ACTIVE && this.shopGUI != null) {
            this.deactivateShop();
        }
        
        // Allows the npc to move onto active animation without needed player to collided with npc VB again
        if (this.animations[this.state][this.direction].isDone()) {
            this.state = this.states.active;
            //console.log("NPC Fully Activated, ready for GUI...");;
        }

        let self = this;
        //interactions with entities like player
        this.game.entities.forEach(function (entity) {

            if (entity instanceof AbstractPlayer) {
                /**
                 * Only manage the state or opening/closing the shop while the player is near.
                 * This is because the map could have multiple NPCs competing for the same shop setting
                 * global. The vision box is big so we only want to control the shop with the one the
                 * player is close to!
                 * */
                 let playerNear = entity.BB && self.VB.collide(entity.BB);
                if (playerNear) {
                    
                    if (self.state != self.states.awaking) {

                        if(self.x + self.BB.width /2 > entity.BB.x  + entity.BB.width / 2)
                            self.direction = self.directions.left;
                        else self.direction = self.directions.right;
                    }
                    if (self.state == self.states.inactive) { // If inactive (idle) and player is in vision range, awake
                        self.state = self.states.awaking;
                    }
                    if (self.state == self.states.active && !SHOP_ACTIVE) { // Activates shop once player in range, NPC is active and player click w key
                        if (entity.BB && self.BB.collide(entity.BB)) {
                            if (self.game.up) {
                                ASSET_MANAGER.playAsset(SFX.SELECT);
                                self.activateShop();
                            }
                        }
                    } else if (SHOP_ACTIVE && entity.BB && !self.BB.collide(entity.BB)) { 
                        ASSET_MANAGER.playAsset(SFX.CLICK);
                        self.deactivateShop();
                    }

                }
            }
        });

        //constant falling velocity
        this.velocity.y += this.fallAcc * TICK;
        //update position and bounding box
        this.x += this.velocity.x * TICK;
        this.y += this.velocity.y * TICK;

        //collision detection
        let dist = { x: 0, y: 0 };
        dist = super.checkEnvironmentCollisions(dist);
        super.updatePositionAndVelocity(dist);
        this.updateBoxes();
        this.animations[this.state][this.direction].update(TICK);
    };

    loadAnimations() {

        let numDir = 2;
        let numStates = 3;
        for (var i = 0; i < numStates; i++) { //defines action
            this.animations.push([]);
            for (var j = 0; j < numDir; j++) { //defines directon: left = 0, right = 1
                this.animations[i].push([]);
            }
        }

        // inactive
        this.animations[0][0] = new Animator(this.spritesheet, 640, 720, 80, 80, 2, 10, 0, false, true, false);
        this.animations[0][1] = new Animator(this.spritesheet, 640, 720, 80, 80, 2, 10, 0, true, true, true);


        // awaking // 
        this.animations[1][0] = new Animator(this.spritesheet, 0, 720, 80, 80, 10, 0.15, 0, true, false, false);
        this.animations[1][1] = new Animator(this.spritesheet, 0, 640, 80, 80, 10, 0.15, 0, false, false, false);

        // active
        this.animations[2][0] = new Animator(this.spritesheet, 0, 80, 80, 80, 4, 0.15, 0, false, true, false);
        this.animations[2][1] = new Animator(this.spritesheet, 0, 0, 80, 80, 4, 0.15, 0, true, true, false);

    };

    draw(ctx) {
        //text
        if (!SHOP_ACTIVE && this.state != this.states.inactive) {
            ctx.fillStyle = "SpringGreen";
            ctx.fillText(" " + this.name,
                (this.BB.x) - this.game.camera.x,
                (this.BB.y) - (this.fontSize * 1.5) - this.game.camera.y);
            ctx.fillText(this.myHoverText,
                (this.BB.x) - this.game.camera.x,
                (this.BB.y) - this.game.camera.y);
        }

        //npc
        this.animations[this.state][this.direction].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
    };

    drawDebug(ctx) {
        ctx.strokeStyle = "Red";
        ctx.strokeRect(this.x + this.xOffset - this.game.camera.x, this.y + this.yOffset - this.game.camera.y, this.width, this.height);
        ctx.strokeStyle = "Blue";
        ctx.strokeRect(this.x + 38 * this.scale - this.visionwidth / 2 - this.game.camera.x, this.y + this.yOffset - this.game.camera.y, this.visionwidth, 80 * this.scale);
    }

    /*required abstractentity methods but not used*/
    getDamageValue() {
        return 0;
    }
    setDamagedState() {

    }

    setDead() {

    }

};
