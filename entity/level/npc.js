class Npc {
    constructor(game, x, y) {
        Object.assign(this, { game, x, y });
        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/enemy/wizard.png");
        
        // Mapping animations and mob states
        this.animations = []; // [state][direction]
        this.states = { inactive: 0, awaking: 1, active: 2 };
        this.directions = { left: 0, right: 1 };
        this.direction = this.directions.left;
        this.state = this.states.inactive;
        this.scale = 2.5;

        // Bounding Box Offset / Stuff
        this.xOffset = -6 * this.scale;
        this.yOffset = 0 * this.scale;
        this.width = 88 * this.scale;
        this.height = 80 * this.scale;
        this.visionwidth = 700 * this.scale;

        // Shop
        this.shopActive = false;
        this.shopGUI = null;


        
        
        // Other
        this.loadAnimations();
        this.updateBB();
    };

    update() {

        var that = this;
        this.game.entities.forEach(function (entity) {

            if (entity.BB && that.VB.collide(entity.BB) && entity instanceof AbstractPlayer) {
                if(that.state != that.states.active){ // If inactive (idle) and player is in vision range, awake
                    that.state = that.states.awaking;
                    if (that.animations[that.state][that.direction].isDone()) {
                        that.state = that.states.active;
                        console.log("NPC Fully Activated, ready for GUI...");
                    }
                }
            }
            if(that.states.active && !that.shopActive){ // Activates shop once player in range, NPC is active and player click w key
                if (entity.BB && that.BB.collide(entity.BB) && entity instanceof AbstractPlayer) {
                    if (that.game.up) {
                        console.log("Opening Shop...");
                        that.shopActive = true;
                        that.shopGUI = new Shop(that.game);
                        that.game.addEntityToFront(that.shopGUI);
                        
                    }
                }
            }
            else if(that.shopActive && entity.BB && !that.BB.collide(entity.BB) && entity instanceof AbstractPlayer){ // Deactivates shop when player NOT in range, and shop is active
                that.shopActive = false;
                console.log("Closing Shop...");
                that.shopGUI.removeFromWorld = true;
            }
        });

    };

    updateBB() {
        this.BB = new BoundingBox(this.x + this.xOffset - this.game.camera.x, this.y + this.yOffset - this.game.camera.y, this.width, this.height);
        this.VB = new BoundingBox(this.x + 38 * this.scale - this.visionwidth / 2 - this.game.camera.x, this.y + this.yOffset - this.game.camera.y, this.visionwidth, 80 * this.scale);
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
        this.animations[0][0] = new Animator(this.spritesheet, 640, 560, 80, 80, 2, 10, 0, false, true, false);
        this.animations[0][1] = new Animator(this.spritesheet, 640, 560, 80, 80, 2, 10, 0, true, true, true);
        

        // awaking // 
        this.animations[1][0] = new Animator(this.spritesheet, 0, 560, 80, 80, 10, 0.15, 0, true, false, false);
        this.animations[1][1] = new Animator(this.spritesheet, 0, 480, 80, 80, 10, 0.15, 0, false, false, false);
        
        // active
        this.animations[2][0] = new Animator(this.spritesheet, 640, 0, 80, 80, 2, 2, 0, true, true, true);
        this.animations[2][1] = new Animator(this.spritesheet, 640, 0, 80, 80, 2, 2, 0, true, true, false);
        
    };

    draw(ctx) {
        this.animations[this.state][this.direction].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
    };

    drawDebug(ctx) {
        ctx.strokeStyle = "Red";
        ctx.strokeRect(this.x + this.xOffset - this.game.camera.x, this.y + this.yOffset - this.game.camera.y, this.width, this.height);
        ctx.strokeStyle = "Blue";
        ctx.strokeRect(this.x + 38 * this.scale - this.visionwidth / 2 - this.game.camera.x, this.y + this.yOffset - this.game.camera.y, this.visionwidth, 80 * this.scale);
    }

};