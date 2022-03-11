class Wizard extends AbstractBoss {
    constructor(game, x, y, left, right, top, bottom) {
        // basic boss setup
        super(game, x, y, false, STATS.WIZARD.NAME, STATS.WIZARD.MAX_HP, STATS.WIZARD.WIDTH, STATS.WIZARD.HEIGHT, STATS.WIZARD.SCALE, STATS.WIZARD.PHYSICS);
        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/enemy/wizard.png");
        this.activeBoss = true;
        this.animations = [];
        this.loadAnimations();
        this.updateBoxes();
        this.lastBB = this.BB;

        // dimension of the frame in spritesheet
        this.tWidth = 80 * this.scale;
        this.tHeight = 80 * this.scale;

        // radius velocity to allow defined radial path
        this.velocity.r = 300;

        /** battle phases */

        this.phases = { initial: 0, middle: 1, desparate: 2, final: 3 };
        this.phase = this.phases.initial;

        // actions
        this.actions = { stunned: -1, fire_ring: 0, no_attack: 1, arrow_rain: 2, beam: 3, dash: 4 };
        this.action = this.actions.no_attack;
        this.totalActions = 5;

        // states/animation
        this.states = {
            idle1: 0, idleto2: 1, idle2: 2, idleto1: 3,
            stoptofly: 4, fly: 5, flytostop: 6, attack: 7, atoidle: 8, death: 9,
            throw: 10, raise: 11, casting: 12, lower: 13, stun: 14
        };
        this.state = this.states.idle1;

        // directions
        this.directions = { right: 0, left: 1 };
        this.direction = this.directions.left;

        // define special state booleans
        this.hit = false;
        this.avoid = true;
        this.fire = false;
        this.tracking = false;

        // spawned attacks
        this.fireball = null;
        this.fireCircle = [];
        this.beamDamage = 5; //initial beam damage. it ramps up with phases.
        this.dashTimer = 0;
        this.maxDashTime = 1;

        // timers for cooldown
        this.actionCooldown = 5;
        this.damagedCooldown = 0;
        this.telportTimer = 0;
        this.appearTime = 0;
        this.disappearTime = 0;
        this.ringWait = 0;
        this.arrowTimer = 0;
        this.aura = "none";
        this.auraAmount = 1; //decreases to 0 to show it is charging

        // skeleton spawn logic
        this.skeletonVar = 1; // used to choose a random int between 0 and skeletonVar - 1
        this.skeletonBase = 1; // wizard will spawn at least skeletonBase skeletons
        this.skeletonChance = 15; // percentage chance that the wizard will spawn skeletons (out of 100)

        /** constructing teleportation information */

        this.teleporting = false;
        this.teleportLocation = { x: 0, y: 0 };

        // canvas for teleportation
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = 80;
        this.canvas.height = 80;

        // the relative bounding box to lock wizard's teleportation/movement defined in levels
        // use if to help keep wizard from going ob or too far above player (if attack isn't meant to do that of course)
        this.left = left;
        this.right = right;
        this.top = top;
        this.bottom = bottom;

        /** buff wizard based on the player */
        this.player = this.game.camera.player;
        let inventory = this.player.myInventory;


        // hp buff: base 1000, max 500
        this.max_hp += 125 * inventory.healthUpgrade;

        // fireball buff: base 5, max 8
        this.fireballDmg = 5 + inventory.attackUpgrade / 2;

        // buff if player is fully upgraded
        // hp buff: max 2000
        // fireball buff: max 10
        //
        this.maxStats = inventory.healthUpgrade >= 4 && inventory.attackUpgrade >= 4 && inventory.arrowUpgrade >= 4 && inventory.armorUpgrade >= 3;
        if (this.maxStats) {
            this.max_hp += 200;
            this.fireballDmg += 2;
        }

        this.hp = this.max_hp;

        //music
        this.playMusic = true;
        this.myBossMusic = MUSIC.FOG;
        this.myEndMusic = MUSIC.MEMORIES; //Andre I hope you recognize this :)
        //this.cueBossMusic(); //once it spawns in play the boss music
    }

    // use after any change to this.x or this.y
    updateBoxes() {
        this.getOffsets();
        this.AR = new BoundingBox(this.x + (40 * this.scale), this.y + this.offsetyBB, this.width - (80 * this.scale), this.heightBB);
        this.VB = new BoundingBox(this.x - (80 * this.scale), this.y, this.width + (160 * this.scale), this.height);
        this.BB = new BoundingBox(this.x + this.offsetxBB * this.scale, this.y + this.offsetyBB * this.scale, this.widthBB * this.scale, this.heightBB * this.scale);
        this.center = { x: this.BB.left + this.BB.width / 2, y: this.BB.top + this.BB.height / 2 };
    };

    getDamageValue() {
        let damage = 0;
        if (this.state == this.states.fly && this.action == this.actions.dash) {
            damage = 15;
        }

        //damage multiplier
        switch (this.phase) {
            case this.phases.middle:
                damage *= 1.1;
                break;
            case this.phases.desparate:
                damage *= 1.2;
                break;
            case this.phases.final:
                damage *= 1.3;
                break;
        }

        return damage;
    }

    setDamagedState() {
        this.vulnerable = false;
        this.hit = true;
        if (this.state != this.states.stun && (this.hp / this.max_hp < 0.75 && this.phase < this.phases.middle ||
            this.hp / this.max_hp < 0.50 && this.phase < this.phases.desparate ||
            this.hp / this.max_hp < 0.25 && this.phase < this.phases.final)) {
            this.state = this.states.stun;
            this.fireCircle.forEach(fireball => fireball.removeFromWorld = true);
            this.fireCircle = [];
            this.actionCooldown = 4;
            this.action = this.actions.stunned;
            if (this.fireball)
                this.fireball.removeFromWorld = true;
        }
        if (this.state == this.states.stun) {
            this.resetAnimationTimers(this.state);
        }
        // allows teleport to activate upon hit
        else if (this.avoid) {
            this.activateTeleport();
        }
    }

    checkCooldowns() {
        let TICK = this.game.clockTick;
        this.actionCooldown -= TICK;
        this.ringWait -= TICK;
        // action change
        if (this.actionCooldown <= 0 && !this.teleporting) {
            this.resetAnimationTimers(this.state);
            if (this.state == this.states.stun) {
                if (this.hp / this.max_hp < 0.25 && this.phase < this.phases.final) {
                    this.phase = this.phases.final;
                    this.skeletonChance = 30;
                    this.skeletonBase = 2;
                    this.activateTeleport();
                    //this.disappearTime = 5;
                }
                else if (this.hp / this.max_hp < 0.50 && this.phase < this.phases.desparate) {
                    this.phase = this.phases.desparate;
                    this.skeletonChance = 25;
                    this.activateTeleport();
                }
                else if (this.hp / this.max_hp < 0.75 && this.phase < this.phases.middle) {
                    this.phase = this.phases.middle;
                    this.skeletonChance = 20;
                    this.skeletonVar = 3;
                    this.activateTeleport();
                }
            }
            if (this.fireCircle.length == 0) {
                let random = randomInt(this.totalActions);
                this.changeAction(random);
            }
            else if (this.phase >= this.phases.desparate && this.action != this.actions.fire_ring && this.fireCircle.length > 0 && this.ringWait <= 0) {
                this.changeAction(this.actions.fire_ring);
                this.state = this.states.raise;
                this.fireCircle.forEach(fireball => fireball.stay = true);

            }
            else {
                let random = randomInt(this.totalActions - 1) + 1;
                this.changeAction(random);
            }

            //uncomment and put in an action number to overide and test attacks
            //this.changeAction(4);
        }
        // wizard hit cooldown
        if (!this.vulnerable) {
            this.damagedCooldown += TICK;
            this.hitCooldown += TICK;
            if (this.damagedCooldown >= PARAMS.DMG_COOLDOWN) {
                this.damagedCooldown = 0;
                //this.canAttack = true;
                //this.runAway = false;
                if (!this.teleporting)
                    this.vulnerable = true;
                this.hit = false;
            }
        }
    }

    getOffsets() {
        switch (this.state) {
            default:
                this.offsetxBB = 21;
                this.offsetyBB = 10;
                this.widthBB = 32;
                this.heightBB = 60;
        }
    }

    checkEntityInteractions(dist, TICK) {
        let self = this;
        this.game.entities.forEach(function (entity) {
            let states = [];
            if (entity instanceof AbstractPlayer) {
                /*
                const dest = { x: entity.BB.left + entity.BB.width / 2, y: entity.BB.top + entity.BB.height / 2 };
                const init = { x: self.BB.left + self.BB.width / 2, y: self.BB.top + self.BB.height / 2 };
                const distX = dest.x - init.x;
                const distY = dest.y - init.y;
                const dist = Math.sqrt(distX * distX + distY * distY);
                if (self.state == self.states.idle) {

                }
                if (states.length > 1 && Math.random() > 0.25) {
                    //states.pop();
                }
                if (states.length > 0) {
                    //let state = states.pop();
                    //self.state = state;
                }
                let playerInVB = entity.BB && self.VB.collide(entity.BB);
                let playerAtkInVB = entity.HB != null && self.VB.collide(entity.HB);
                if (playerInVB || playerAtkInVB || self.aggro) {
                }*/
                //else {
                /*if (self.state == self.state.attack1) {
                    self.velocity.x = 0;
                    self.velocity.y = 0;
                }

                if (self.state != self.states.idle1)
                    self.resetAnimationTimers(self.state);
                self.state = self.states.idle1;*/
                //}
                if (entity.HB && self.BB.collide(entity.HB)) {
                    self.setDamagedState();
                }
            }


        });
        return dist;
    }

    resetAnimationTimers(action) {
        this.animations[action][0].elapsedTime = 0;
        this.animations[action][1].elapsedTime = 0;
    }

    update() {
        //cue boss music if it hasn't played yet
        if (this.playMusic) {
            this.playMusic = false;
            this.cueBossMusic();
        }
        let TICK = this.game.clockTick;
        if (this.dead) {
            super.setDead();
            this.animations[this.state][this.direction].update(TICK);
            this.fireCircle.forEach(fireball => fireball.removeFromWorld = true);
            if (this.fireball)
                this.fireball.removeFromWorld = true;
            if (this.animations[this.state][this.direction].isDone()) {
                this.playEndMusic();
            }
        }
        else if (this.state == this.states.stun) {
            this.velocity.y += this.fallAcc * TICK;
            this.y += this.velocity.y * TICK;
            this.updateBoxes();
            let dist = { x: 0, y: 0 }; //the displacement needed between entities
            dist = super.checkEnvironmentCollisions(dist); //check if colliding with environment and adjust entity accordingly
            this.updatePositionAndVelocity(dist); //set where entity is based on interactions/collisions put on dist
            this.checkEntityInteractions(dist, TICK);
            this.checkCooldowns();
            this.animations[this.state][this.direction].update(TICK);
            if (this.animations[this.state][this.direction].currentFrame() > 3) {
                this.animations[this.state][this.direction].elapsedTime -= .15;
            }
        }
        else {
            this.checkCooldowns();
            let dist = { x: 0, y: 0 };
            let self = this;
            dist = this.checkEntityInteractions(dist, TICK);
            if (this.state != this.states.stun) {
                // if avoiding player teleport when player is too close, if not teleporting already
                if (this.avoid && !this.teleporting) {
                    this.game.entities.forEach(function (entity) {
                        if (entity instanceof AbstractPlayer) {
                            let ex = entity.BB.left + entity.BB.width / 2;
                            let ey = entity.BB.top + entity.BB.height / 2;
                            let distx = ex - self.center.x;
                            let disty = ey - self.center.y;
                            let dist = Math.sqrt(distx * distx + disty * disty);
                            if (dist < 60 * self.scale) {
                                self.activateTeleport();
                            }
                        }
                    });
                }
            }

            // define all of the actionss
            let actions = this.actions;
            let phases = this.phases;
            switch (this.action) {
                case actions.fire_ring:
                    switch (this.phase) {
                        //pass in how many fireballs per phase
                        case phases.initial:
                            this.fireRing(3);
                            break;
                        case phases.middle:
                            this.fireRing(6);
                            break;
                        case phases.desparate:
                            this.fireRing(9)
                            break;
                        case phases.final:
                            this.fireRing(13);
                            break;
                    }
                    break;
                case actions.arrow_rain:
                    switch (this.phase) {
                        //pass in number of base arrows to spawn in
                        case phases.initial:
                            this.arrowRain(3);
                            break;
                        case phases.middle:
                            this.arrowRain(4);
                            break;
                        case phases.desparate:
                            this.arrowRain(5);
                            break;
                        case phases.final:
                            this.arrowRain(7);
                            break;
                    }
                    break;
                case actions.beam:
                    //beam is invincible once it reaches half hp phase
                    //phases are handled by shootWindblast() method
                    this.beam();
                    break;
                case actions.dash:
                    this.dashAttack();
                    break;
            }

            // allow teleport when activated
            if (this.teleporting) {
                this.teleport();
            }
            else this.animations[this.state][this.direction].update(TICK);
        }
        // does not update animation if teleporting, which allows current frame to be the frame to use when teleporting

        //vertically track the player
        //used in the beam phase
        if (this.tracking) {
            let buffer = this.BB.height / 2;

            if (this.BB.top + buffer > this.player.BB.top) {
                if (this.velocity.y > 0) this.velocity.y = 0;
                this.velocity.y -= (this.fallAcc) * TICK;
            } else {
                if (this.velocity.y < 0) this.velocity.y = 0;
                this.velocity.y += (this.fallAcc) * TICK;
            }

            this.y += this.velocity.y * TICK;
            this.updateBoxes();
            let dist = { x: 0, y: 0 }; //the displacement needed between entities
            dist = super.checkEnvironmentCollisions(dist); //check if colliding with environment and adjust entity accordingly
            this.updatePositionAndVelocity(dist); //set where entity is based on interactions/collisions put on dist
            this.checkEntityInteractions(dist, TICK);
            this.checkCooldowns();
            this.checkDirection();
        }

        this.lastBB = this.BB;
    }

    /**
    * Checks position of player and checks direction to match
    */
    checkDirection() {
        if (this.player.BB.x > this.BB.x) this.direction = this.directions.right;
        else this.direction = this.directions.left;
    }

    /**
     * activate teleport so that teleportations can be done
     */
    activateTeleport() {
        let player = this.game.camera.player;
        let ex = player.BB.left + player.BB.width / 2;
        let ey = player.BB.top + player.BB.height / 2;
        this.teleporting = true;
        this.hit = false;
        this.vulnerable = false;
        this.teleportLocation.x = ex;
        this.teleportLocation.y = ey;
        this.disappearTime = .75;
        if (randomInt(100) < this.skeletonChance) this.loadEvent(randomInt(this.skeletonVar) + this.skeletonBase);
    }

    /**
     * logic for teleporting
     */
    teleport() {
        let TICK = this.game.clockTick;
        let BB = new BoundingBox(0, 0, 1, 1);
        this.BB = BB;
        this.disappearTime -= TICK;
        // teleports to a random location a certain distance from the player
        if (this.disappearTime <= 0) {
            let xOffset = this.center.x - this.x;
            let yOffset = this.center.y - this.y;
            let angle = Math.random() * 2 * Math.PI;
            let xFinal = Math.cos(angle) * 200 * this.scale;
            this.updateBoxes();
            if (this.left * PARAMS.BLOCKDIM > this.BB.left - 20 * this.scale)
                xFinal = Math.abs(xFinal) + this.center.x;
            else if (this.right * PARAMS.BLOCKDIM < this.BB.right + 20 * this.scale)
                xFinal = -Math.abs(xFinal) + this.center.x;
            else xFinal += this.center.x;
            let yFinal = Math.sin(angle) * 200 * this.scale;
            if (this.bottom * PARAMS.BLOCKDIM < this.BB.bottom + 20 * this.scale)
                yFinal = -Math.abs(yFinal) + this.center.y;
            else yFinal += this.center.y;
            if (xFinal - this.BB.width / 2 < this.left * PARAMS.BLOCKDIM)
                xFinal = this.left * PARAMS.BLOCKDIM + this.BB.width / 2;
            if (xFinal + this.BB.width / 2 > this.right * PARAMS.BLOCKDIM)
                xFinal = this.right * PARAMS.BLOCKDIM - this.BB.width / 2;
            if (yFinal - this.BB.height / 2 < this.top * PARAMS.BLOCKDIM)
                yFinal = this.top * PARAMS.BLOCKDIM - this.BB.height / 2;
            if (yFinal + this.BB.height / 2 > this.bottom * PARAMS.BLOCKDIM)
                yFinal = this.bottom * PARAMS.BLOCKDIM - this.BB.height / 2;
            this.x = xFinal - xOffset;
            this.y = yFinal - yOffset;
            this.BB = BB;
            this.reappearTime = .3;
            this.disappearTime = 100;
        }
        // appear where disappear determined
        else if (this.reappearTime > 0) {
            this.reappearTime -= TICK;
            this.updateBoxes();
            if (this.reappearTime < 0.15) {
                if (this.game.camera.player.x < this.center.x)
                    this.direction = this.directions.left;
                if (this.game.camera.player.x > this.center.x)
                    this.direction = this.directions.right;
            }
            if (this.reappearTime <= 0) {
                this.vulnerable = true;
                this.teleporting = false;
            }
            else this.BB = BB;
        }
    }

    /** ATTACKS BELOW */

    /**
     * logic for the fire ring which creates a ring of fire to follow and then release
     * @param {*} max the max amount of fireballs to cast in the circle
     */
    fireRing(max) {
        let TICK = this.game.clockTick;
        let states = this.states;
        let dir = this.direction;
        let animation = this.animations[this.state][this.direction];
        let isDone = animation.isDone();
        let frame = animation.currentFrame();
        switch (this.state) {
            case states.idleto2:
                if (frame == 3 && !this.fire) {
                    this.fire = true;
                    if (this.direction == this.directions.left)
                        this.fireball = new Fireball(this.game, this,
                            this.center.x - 16 * this.scale,
                            this.center.y - 4 * this.scale,
                            this.scale, this.direction, false, this.fireballDmg);
                    else
                        this.fireball = new Fireball(this.game, this,
                            this.center.x + 16 * this.scale,
                            this.center.y - 4 * this.scale,
                            this.scale, this.direction, false, this.fireballDmg);
                    if (this.phase >= this.phases.desparate)
                        this.fireball.blue = true;
                    this.fireball.state = this.fireball.states.ignite1;
                    this.game.addEntityToFront(this.fireball);
                    if (this.phase == this.phases.final) {
                        let angle = 0;
                        for (var i = 0; i < max; i++) {
                            this.fireCircle.push(new FireballCircular(this.game, this,
                                0, 0, this.scale, this.direction, true, this.fireballDmg));
                        }
                        let self = this;
                        this.fireCircle.forEach(fireball => {
                            self.game.addEntity(fireball);
                            fireball.state = fireball.states.ignite1;
                            fireball.stay = true;
                            fireball.r = 50 * fireball.scale;
                            fireball.angle = angle;
                            angle += 2 * Math.PI / max;
                        });
                    }
                }
                else if (isDone) {
                    this.resetAnimationTimers(this.state);
                    this.fire = false;
                    if (this.phase == this.phases.final) {
                        this.state = states.idle2;
                    }
                    else
                        this.state = states.throw;
                }
                break;
            case states.idle2:
                if (this.fireball.animations[this.fireball.states.ignite2][this.fireball.dir].isDone()) {
                    let random = randomInt(this.totalActions - 1) + 1;
                    this.changeAction(random);
                    this.activateTeleport();
                    this.ringWait = 10;
                    if (this.fireball)
                        this.fireball.removeFromWorld = true;
                    this.fireCircle.forEach(fireball => fireball.stay = false);
                }
                break;
            case states.throw:
                if (isDone) {
                    this.fire = false;
                    this.resetAnimationTimers(this.state);
                    if (this.fireCircle.length == max) {
                        if (this.phase == this.phases.desparate) {
                            let random = randomInt(this.totalActions - 1) + 1;
                            this.changeAction(random);
                            this.activateTeleport();
                            this.ringWait = 10;
                        }
                        else
                            this.state = states.idle1;
                    }
                }
                if (frame == 5 && !this.fire) {
                    this.fire = true;
                    let fireball = null;
                    if (this.fireCircle.length == max - 1) {
                        if (this.fireball)
                            this.fireball.removeFromWorld = true;
                    }
                    if (this.direction == this.directions.left)
                        fireball = new FireballCircular(this.game, this,
                            this.center.x - 10 * this.scale,
                            this.center.y - 4 * this.scale,
                            this.scale, this.direction, false, this.fireballDmg);
                    else
                        fireball = new FireballCircular(this.game, this,
                            this.center.x + 10 * this.scale,
                            this.center.y - 4 * this.scale,
                            this.scale, this.direction, false, this.fireballDmg);
                    if (this.phase >= this.phases.desparate)
                        fireball.blue = true;
                    this.fireCircle.push(fireball);
                    this.game.addEntity(fireball);
                }
                break;
            case states.idle1:
                if (this.BB.top + this.BB.height * 1.5 > this.top * PARAMS.BLOCKDIM) {
                    this.y -= this.velocity.r * TICK;
                    this.updateBoxes();
                }
                else {
                    this.y += this.top * PARAMS.BLOCKDIM - (this.BB.top + this.BB.height * 1.5);
                    this.updateBoxes();
                    this.state = states.raise;
                    this.fireCircle.forEach(fireball => fireball.stay = true);
                }
                break;
            case states.raise:
                if (isDone) {

                    this.resetAnimationTimers(this.state);
                    this.state = states.casting;
                    this.ringWait = .5;
                }
                break;
            case states.casting:
                if (this.ringWait <= 0) {
                    this.fireCircle.forEach(fireball => fireball.release = true);
                    this.fireCircle = [];
                    this.state = states.lower;
                }
                break;
            case states.lower:
                if (isDone) {
                    this.resetAnimationTimers(this.state);
                    this.state = states.idle1;
                    this.activateTeleport();
                    this.actionCooldown = 0;
                }
                break;
        }
    }

    /**
     * Summons 3 to 5 skeletons
     *
     */
    loadEvent(numberOfEnemies) {
        let enemies = [];
        let h = this.game.camera.level.height;
        let spawnOffset = 80;
        for (var i = 0; i < numberOfEnemies; i++) {
            let enemy = new Skeleton(this.game, this.x + (i * spawnOffset), this.bottom, false, 6); // the 6 is for the rebirth state
            enemy.y = Math.ceil((enemy.y * PARAMS.BLOCKDIM) - enemy.BB.bottom + 20); // tried using postion entity but it needed a bit more of an offset
            enemy.aggro = true;
            enemies.push(enemy);
        }
        this.event = new Event(this.game, [], [], enemies, true, false);
        this.game.addEntity(this.event);
    };

    /**
     * changes the type of attack being done
     * Summons arrows and then teleports after a certain amount of time
     * Has an indicator with a green aura
     * 
     * @param base number of arrows to spawn in
     */
    arrowRain(numArrows) {
        let TICK = this.game.clockTick;
        let states = this.states;
        let dir = this.direction;
        let animation = this.animations[this.state][this.direction];
        let isDone = animation.isDone();
        let frame = animation.currentFrame();
        let self = this;

        switch (this.state) {
            //initial starting state
            case states.raise:
                if (isDone) {
                    this.resetAnimationTimers(this.state);
                    this.state = states.casting;
                }
                break;
            //casting state shoots arrows after done charging aura
            case states.casting:

                if (!this.teleporting) {
                    //green aura that decreases to indicate when the attack will hit
                    if (this.auraAmount > 0) {
                        this.auraAmount -= (1000 * TICK) / 1000; //decrease aura amount over time
                        this.aura = "drop-shadow(0 0 " + this.auraAmount + "rem magenta) opacity(100%)";
                        if (this.auraAmount < 0) this.auraAmount = 0;
                    } else {
                        this.aura = "none";
                    }

                    //spawns arrows if done charging
                    if (!this.arrow) {
                        if (this.auraAmount <= 0) {
                            this.arrow = true;
                            this.summonArrows(numArrows + randomInt(3));
                        }
                    }

                    //if arrow was fire start counting the timer and if done switch state and reset to default
                    if (this.arrow) {
                        this.arrowTimer += TICK;
                        let finished = this.arrowTimer > 1.5;
                        if (finished) {
                            this.state = states.lower;
                            this.resetAnimationTimers(this.state);
                            this.arrow = false;
                            this.arrowTimer = 0;
                            this.auraAmount = 1;
                        }
                    }
                }

                break;
            //ending state to start animation loop again
            case states.lower:
                if (isDone) {
                    this.state = states.raise;
                    this.activateTeleport();
                    this.resetAnimationTimers(this.state);
                    this.arrow = false;
                }
                break;
        }
    }

    /**
     * Spawns arrows randomly a set distance that targets the player
     * @param {*} theAmount 
     */
    summonArrows(theAmount) {
        let spaceX = 100; //space in between arrows
        let spaceY = 50;
        let arrow_type = this.player.myInventory.arrowUpgrade;
        let target = { x: this.player.BB.mid, y: this.player.BB.top };
        let startX;
        let startY;
        let random = randomInt(4);

        if (random == 0) { //from the wizard position
            startX = this.x;
            startY = this.y;
        } else if (random == 1) { //from above the player
            startX = this.player.BB.left;
            startY = this.player.BB.top - 500;
        } else if (random == 2) { //start left of player
            startX = this.player.BB.left - 600;
            startY = this.player.BB.top - (this.BB.height / 2);
        } else { //start right of player
            startX = this.player.BB.right + 600;
            startY = this.player.BB.top - (this.BB.height / 2);
        }

        for (let i = 0; i < theAmount; i++) {
            let arrow = new Arrow(this.game, startX + (i * spaceX), startY - (i * spaceY), target, arrow_type, false);
            this.game.addEntityToFront(arrow);
            ASSET_MANAGER.playAsset(SFX.BOW_SHOT);
        }


    }

    /**
    * Summons multiple projectiles together that looks like a wind beam
    */
    beam() {
        let TICK = this.game.clockTick;
        let states = this.states;
        let dir = this.direction;
        let animation = this.animations[this.state][this.direction];
        let isDone = animation.isDone();
        let frame = animation.currentFrame();
        let self = this;

        switch (this.state) {
            case states.attack:
                if (this.teleporting) animation.elapsedTime = 0; //keep reset until done teleporting
                else {
                    //tracking until shooting projectile
                    (frame < 6) ? this.tracking = true : this.tracking = false;

                    if (frame == 6) {
                        //shoot main projectile
                        this.shootWindblast();
                    } else if (frame == 8) {
                        //chance to follow up with an extra trailing blast at the end
                        if (randomInt(11) >= 8) this.shootWindblast();
                    }
                    if (isDone) {
                        //randomly chose to shoot again or teleport away after cooldown animation
                        let rand = randomInt(11);
                        if (rand <= 6) this.state = states.atoidle;
                        this.resetAnimationTimers(this.state);
                    }
                }
                break;
            case states.atoidle:
                if (isDone) { //once cooldown is done teleport and attack again
                    this.activateTeleport();
                    this.state = states.attack;
                    this.resetAnimationTimers(states.attack);
                    this.resetAnimationTimers(states.atoidle);
                }
                break;

        }
    }

    /**
     * Summons a projectile used to make up a beam
     * At the desprate phase and beyond the projectiles become indestructible
     */
    shootWindblast() {

        let damage = this.beamDamage; //damage of the blast
        let speed = 1.0;              //speed multiplier based on phase
        let isDestroyable = true;     //if this projectile can be destroyed or not. Later phases it cant
        //set speed and damage based on the phase
        if (this.phase > this.phases.initial) {
            speed = speed + (this.phase / 10); //multiplier of the initial windball speed

            //hard phase: cant be destroyed and does more damage
            if (this.phase >= this.phases.desparate) {
                damage *= 1.5;
                isDestroyable = false;
            }
        }

        if (this.direction == this.directions.right)
            this.game.addEntity(new WindBall(this.game, this.BB.right - this.BB.width, this.BB.top - 10, this.direction, 2, damage, isDestroyable, speed));
        else
            this.game.addEntity(new WindBall(this.game, this.BB.left - this.BB.width * 2, this.BB.top - 10, this.direction, 2, damage, isDestroyable, speed));
    }

    /**
     * Charges at the player
     */
    dashAttack() {
        let TICK = this.game.clockTick;
        let states = this.states;
        let dir = this.direction;
        let animation = this.animations[this.state][this.direction];
        let isDone = animation.isDone();
        let frame = animation.currentFrame();
        let self = this;

        switch (this.state) {

            //STARTUP PHASE: tracks player pos
            case states.stoptofly:
                this.tracking = true;
                if (isDone && this.BB.bottom >= this.player.BB.top) {
                    this.state = states.fly;
                    this.tracking = false;
                    this.resetAnimationTimers(states.stoptofly);
                    this.resetAnimationTimers(states.flytostop);
                    this.resetAnimationTimers(states.fly);
                }
                break;

            //ATTACK PHASE: charges in player's direction
            case states.fly:
                this.dashTimer += TICK;

                //set speed of the dash based on the phase
                let speed = 800;
                let scaler = 1;
                //increase speed depending on the phase
                switch (this.phase) {
                    case this.phases.middle:
                        scaler = 1.2;
                        break;
                    case this.phases.desparate:
                        scaler = 1.3;
                        break;
                    case this.phases.final:
                        scaler = 1.5;
                        break;
                }

                //set velocity
                speed *= scaler;
                if (this.direction == this.directions.right) {
                    if (this.velocity.x < 0) this.velocity.x = 0;
                    this.velocity.x += speed;
                } else {
                    if (this.velocity.x > 0) this.velocity.x = 0;
                    this.velocity.x -= speed;
                }

                //update the positioning based on velocity
                this.x += this.velocity.x * TICK;
                this.updateBoxes();
                let dist = { x: 0, y: 0 }; //the displacement needed between entities
                dist = super.checkEnvironmentCollisions(dist); //check if colliding with environment and adjust entity accordingly
                this.updatePositionAndVelocity(dist); //set where entity is based on interactions/collisions put on dist
                this.checkEntityInteractions(dist, TICK);

                //max x velocity
                if (this.velocity.x >= PLAYER_PHYSICS.MAX_RUN * scaler) this.velocity.x = PLAYER_PHYSICS.MAX_RUN * scaler;
                if (this.velocity.x <= -PLAYER_PHYSICS.MAX_RUN * scaler) this.velocity.x = -PLAYER_PHYSICS.MAX_RUN * scaler;

                //hitbox same as bounding box
                this.HB = this.BB;
                //stop dashing after a set amount of time and reset
                if (this.dashTimer > this.maxDashTime) {
                    this.dashTimer = 0;
                    this.state = states.stoptofly;
                    this.HB = null;
                    this.velocity.x = 0;
                    this.velocity.y = 0;
                    this.resetAnimationTimers(states.stoptofly);
                    this.resetAnimationTimers(states.flytostop);
                }
                break;
            case states.stoptofly:
                if (isDone) {
                    this.activateTeleport();
                    this.state = states.stoptofly;
                    this.resetAnimationTimers(states.stoptofly);
                    this.resetAnimationTimers(states.flytostop);
                    this.resetAnimationTimers(states.fly);
                }
                break;


        }
    }



    /**
     * changes the type of attack being done and gives it the default values
     * @param {number} action the current action
     */
    changeAction(action) {
        let actions = this.actions;
        this.action = action;
        this.resetAnimationTimers(this.state);
        this.auraAmount = 1;
        this.aura = "none";
        this.tracking = false;
        console.log(action);
        switch (action) {
            case actions.no_attack:
                this.avoid = true;
                this.actionCooldown = 5;
                this.state = this.states.idle1;
                break;
            case actions.fire_ring:
                this.avoid = false;
                this.actionCooldown = 10;
                this.state = this.states.idleto2;
                //this.state = this.states.raise;
                this.fire = false;
                break;
            case actions.arrow_rain:
                this.avoid = false;
                this.actionCooldown = 12;
                this.state = this.states.raise;
                this.arrow = false;
                this.arrowTimer = 0;
                this.auraAmount = 1;
                break;
            case actions.beam:
                this.avoid = false;
                this.actionCooldown = 15;
                this.state = this.states.attack;
                break;
            case actions.dash:
                this.avoid = false;
                this.actionCooldown = 8;
                this.state = this.states.stoptofly;
                break;
        }

    }

    draw(ctx) {
        let TICK = this.game.clockTick;
        if (this.dead) {
            super.drawWithFadeOut(ctx, this.animations[this.state][this.direction]);
        }
        else {
            // visuals of being hit

            // telport visuals
            if (this.teleporting) {
                this.ctx.filter = "brightness(150000%)";
                if (this.disappearTime > 0 && this.disappearTime < 1) {
                    this.tWidth -= 4000 * TICK;
                    if (this.tWidth < 0) this.tWidth = 0;
                    this.tHeight += 4000 * TICK;
                    if (this.tHeight > 300 * this.scale) this.tHeight = 300 * this.scale;
                }
                else if (this.reappearTime > 0) {
                    this.tWidth += 4000 * TICK;
                    if (this.tWidth > 80 * this.scale) this.tWidth = 80 * this.scale;
                    this.tHeight -= 4000 * TICK;
                    if (this.tHeight < 80 * this.scale) this.tHeight = 80 * this.scale;
                }
                let w = 80 * this.scale - this.tWidth;
                let h = 80 * this.scale - this.tHeight;

                this.animations[this.state][this.direction].drawFrame(this.game.clockTick, this.ctx, 0, 0, 1);
                ctx.drawImage(this.canvas, this.x - this.game.camera.x + w / 2, this.y - this.game.camera.y + h / 2, this.tWidth, this.tHeight);
            }
            // nonteleporting visuals
            else {
                if (this.hit) {
                    ctx.filter = "brightness(150000%)";
                }
                else ctx.filter = this.aura;
                this.animations[this.state][this.direction].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
                this.tWidth = 80 * this.scale;
                this.tHeight = 80 * this.scale;
            }
            ctx.filter = "none";
        }
    }

    /**
    * Stop the current level music and play boss music
    */
    cueBossMusic() {
        MUSIC_MANAGER.pauseBackgroundMusic(); //stop the background music for you know what :)
        MUSIC_MANAGER.autoRepeat(this.myBossMusic); //OH LAWD HE COMIN
        MUSIC_MANAGER.playAsset(this.myBossMusic);  //...why do I hear boss music?
    }

    /**
    * Stop whatever background music is playing and play the ending music
    */
    playEndMusic() {
        MUSIC_MANAGER.pauseBackgroundMusic();
        MUSIC_MANAGER.autoRepeat(this.myEndMusic);
        MUSIC_MANAGER.playAsset(this.myEndMusic);
    }

    loadAnimations() {
        for (let i = 0; i < 15; i++) {
            this.animations.push([]);
            for (let j = 0; j < 2; j++) {
                this.animations[i].push([]);
            }
        }

        // idle
        this.animations[0][0] = new Animator(this.spritesheet, 6, 0, 80, 80, 4, 0.15, 0, true, true, false);
        this.animations[1][0] = new Animator(this.spritesheet, 326, 160, 80, 80, 5, 0.15, 0, true, false, false);
        this.animations[2][0] = new Animator(this.spritesheet, 6, 160, 80, 80, 4, 0.15, 0, true, true, false);
        this.animations[3][0] = new Animator(this.spritesheet, 326, 160, 80, 80, 5, 0.15, 0, false, false, false);
        this.animations[0][1] = new Animator(this.spritesheet, 0, 80, 80, 80, 4, 0.15, 0, false, true, false);
        this.animations[1][1] = new Animator(this.spritesheet, 80, 240, 80, 80, 5, 0.15, 0, false, false, false);
        this.animations[2][1] = new Animator(this.spritesheet, 480, 240, 80, 80, 4, 0.15, 0, false, true, false);
        this.animations[3][1] = new Animator(this.spritesheet, 80, 240, 80, 80, 5, 0.15, 0, true, false, false);

        // fly forward
        this.animations[4][0] = new Animator(this.spritesheet, 166, 320, 80, 80, 4, 0.15, 0, true, false, false);
        this.animations[5][0] = new Animator(this.spritesheet, 6, 320, 80, 80, 3, 0.15, 0, false, true, false);
        this.animations[6][0] = new Animator(this.spritesheet, 166, 320, 80, 80, 4, 0.15, 0, false, false, false);
        this.animations[4][1] = new Animator(this.spritesheet, 0, 400, 80, 80, 4, 0.15, 0, false, false, false);
        this.animations[5][1] = new Animator(this.spritesheet, 240, 400, 80, 80, 3, 0.15, 0, false, true, false);
        this.animations[6][1] = new Animator(this.spritesheet, 0, 400, 80, 80, 4, 0.15, 0, true, false, false);

        // attack
        this.animations[7][0] = new Animator(this.spritesheet, 6, 480, 80, 80, 9, 0.15, 0, true, false, false);
        this.animations[8][0] = new Animator(this.spritesheet, 326, 480, 80, 80, 4, 0.15, 0, false, false, false);
        this.animations[7][1] = new Animator(this.spritesheet, 0, 560, 80, 80, 9, 0.15, 0, false, false, false);
        this.animations[8][1] = new Animator(this.spritesheet, 0, 560, 80, 80, 4, 0.15, 0, true, false, false);

        // death
        this.animations[9][0] = new Animator(this.spritesheet, 6, 640, 80, 80, 10, 0.15, 0, true, false, false);
        this.animations[9][1] = new Animator(this.spritesheet, 6, 720, 80, 80, 10, 0.15, 0, false, false, false);

        // throw fireball
        this.animations[10][0] = new Animator(this.spritesheet, 6, 800, 80, 80, 9, 0.07, 0, false, false, false);
        this.animations[10][1] = new Animator(this.spritesheet, 0, 880, 80, 80, 9, 0.07, 0, true, false, false);

        // raise amulet
        this.animations[11][0] = new Animator(this.spritesheet, 246, 1040, 80, 80, 2, 0.15, 0, true, false, false);
        this.animations[11][1] = new Animator(this.spritesheet, 0, 960, 80, 80, 2, 0.15, 0, false, false, false);

        // casting
        this.animations[12][0] = new Animator(this.spritesheet, 6, 1040, 80, 80, 3, 0.15, 0, true, true, false);
        this.animations[12][1] = new Animator(this.spritesheet, 160, 960, 80, 80, 3, 0.15, 0, false, true, false);

        // lower amulet
        this.animations[13][0] = new Animator(this.spritesheet, 166, 1040, 80, 80, 2, 0.15, 0, false, false, false);
        this.animations[13][1] = new Animator(this.spritesheet, 0, 960, 80, 80, 2, 0.15, 0, true, false, false);

        // stunned
        this.animations[14][0] = new Animator(this.spritesheet, 6, 1200, 80, 80, 4, 0.15, 0, true, false, false);
        this.animations[14][1] = new Animator(this.spritesheet, 0, 1120, 80, 80, 4, 0.15, 0, false, false, false);
    }

}
