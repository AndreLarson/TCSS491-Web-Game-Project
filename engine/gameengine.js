// This game shell was happily modified from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011

class GameEngine {

    constructor(options) {
        // What you will use to draw
        // Documentation: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
        this.ctx = null;

        // Everything that will be updated and drawn each frame
        this.entities = [];

        // Information on the input
        this.click = null;
        this.mouse = null;
        this.wheel = null;

        //controls
        this.left = null; //A
        this.right = null; //D
        this.down = null; //S
        this.up = null; //W
        this.jump = null; //space
        this.attack = null; //left click
        this.roll = null; //left shift
        this.shoot = null; //right click
        this.heal = null;

        //counter for an attack chain corresponding to attack presses
        this.comboCounter = 0;

        // this.keys = {};


        //height for debug
        this.surfaceWidth = null;
        this.surfaceHeight = null;

        // THE KILL SWITCH
        this.running = false;

        // Options and the Details
        this.options = options || {
            prevent: {
                contextMenu: true,
                scrolling: true,
            },
            debugging: false,
        };
    };

    init(ctx) {
        this.ctx = ctx;
        this.surfaceWidth = this.ctx.canvas.width;
        this.surfaceHeight = this.ctx.canvas.height;

        this.startInput();
        this.timer = new Timer();
    };

    start() {
        this.running = true;
        const gameLoop = () => {
            this.loop();
            if (this.running) {
                requestAnimFrame(gameLoop, this.ctx.canvas);
            }
        };
        gameLoop();
    };

    startInput() {
        var that = this;
        const getXandY = e => ({
            x: e.clientX - this.ctx.canvas.getBoundingClientRect().left,
            y: e.clientY - this.ctx.canvas.getBoundingClientRect().top
        });

        this.ctx.canvas.addEventListener("mousemove", e => {
            if (this.options.debugging) {
                console.log("MOUSE_MOVE", getXandY(e));
            }
            this.mouse = getXandY(e);
        });


        //mouse was clicked
        this.ctx.canvas.addEventListener("click", e => {
            if (this.options.debugging) {
                console.log("CLICK", getXandY(e));
            }

            this.click = getXandY(e);

            //set attack
            switch (e.which) {
                case 1:
                    //alert('Left Mouse button pressed.');
                    that.attack = true;
                    that.comboCounter += 1;
                    break;
                case 2:
                    //alert('Middle Mouse button pressed.');
                    break;
                case 3:
                    //alert('Right Mouse button pressed.');
                    break;

            }


        });

        //release mouse click
        this.ctx.canvas.addEventListener("mouseup", e => {
            if (this.options.debugging) {
                console.log("CLICK", getXandY(e));
            }

            this.click = getXandY(e);

            switch (e.which) {
                case 1:
                    //alert('Left Mouse button release.');
                    break;
                case 2:
                    //alert('Middle Mouse button release.');
                    break;
                case 3:
                    //alert('Right Mouse button release.');
                    break;

            }


        });

        this.ctx.canvas.addEventListener("wheel", e => {
            if (this.options.debugging) {
                console.log("WHEEL", getXandY(e), e.wheelDelta);
            }
            if (this.options.prevent.scrolling) {
                e.preventDefault(); // Prevent Scrolling
            }
            this.wheel = e;
        });

        this.ctx.canvas.addEventListener("contextmenu", e => {
            if (this.options.debugging) {
                console.log("RIGHT_CLICK", getXandY(e));
            }
            if (this.options.prevent.contextMenu) {
                e.preventDefault(); // Prevent Context Menu
            }
            this.rightclick = getXandY(e);
            this.shoot = true;
        });

        //keyboard press control logic
        this.ctx.canvas.addEventListener("keydown", function (e) {
            e.preventDefault(); //prevent scrolling from pressing a key
            switch (e.code) {
                case "KeyD":
                case "ArrowRight":
                    that.right = true;
                    break;
                case "KeyA":
                case "ArrowLeft":
                    that.left = true;
                    break;
                case "KeyS":
                case "ArrowDown":
                    that.down = true;
                    break;
                case "KeyW":
                case "ArrowUp":
                    that.up = true;
                    break;
                case "KeyP":
                    that.attack = true;
                    break;
                case "ShiftLeft":
                    that.roll = true;
                    break;
                case "Space":
                    that.jump = true;
                    break;
                case "KeyH":
                    that.heal = true;
                    break;
            }
        }, false);

        //keyboard release control logic
        this.ctx.canvas.addEventListener("keyup", function (e) {
            switch (e.code) {
                case "KeyD":
                case "ArrowRight":
                    that.right = false;
                    break;
                case "KeyA":
                case "ArrowLeft":
                    that.left = false;
                    break;
                case "KeyS":
                case "ArrowDown":
                    that.down = false;
                    break;
                case "KeyW":
                case "ArrowUp":
                    that.up = false;
                    break;
                case "Space":
                    break;
            }
        }, false);

        // window.addEventListener("keydown", event => this.keys[event.key] = true);
        // window.addEventListener("keyup", event => this.keys[event.key] = false);
    };

    addEntity(entity) {
        this.entities.push(entity);
    };

    addEntityToFront(entity) {
        this.entities.unshift(entity);
    };

    draw() {
        // Clear the whole canvas with transparent color (rgba(0, 0, 0, 0))
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // Draw latest things first
        for (let i = this.entities.length - 1; i >= 0; i--) {
            this.entities[i].draw(this.ctx, this);
        }


        //update the camera (scene manager)
        this.camera.draw(this.ctx);
    };

    update() {
        let entitiesCount = this.entities.length;

        for (let i = 0; i < entitiesCount; i++) {
            let entity = this.entities[i];

            if (!entity.removeFromWorld) {
                entity.update();
            }
        }

        for (let i = this.entities.length - 1; i >= 0; --i) {
            if (this.entities[i].removeFromWorld) {
                this.entities.splice(i, 1);
            }
        }

        //update the camera (scene manager)
        this.camera.update();
    };

    loop() {
        this.clockTick = this.timer.tick();
        this.update();
        this.draw();
    };

};

// KV Le was here :)