/**
 * JSON file to store level data.
 * This file contains global vaiables that store objects data used to build
 * environment or entities in a level. Used by scenemanager.
 *
 * IMPORTANT DEVELOPER NOTES:
 * Levels are built in 1st quadrant of cordinate plane.
 * Height is drawn from up to down.
 * Width is drawn from left to right.
 * Build levels above y = 0 because below that is the death zone!
 *
 *
 * Each level variable MUST HAVE:
 *      ID: 0,1,2...    (level number and this id must be an index in scene manager's level array)
 *      Label: "1-1"    level-sublevel
 *      width, height   (converted into PARAMS.BLOCKDIM)
 *      player: {x, y}  (starting pos)
 *      music: MUSIC.TRACK_NAME (found in utils class)
 *
 * The rest will be entities or environment objects. Probably have ground below player or you will fall yo your death.
 * doors must be in the format of door: { x : 1, y : 3 , killQuota : x,  exitLocation: {x: 1, y: 1, levelNum: 1}},
 */

/**TEST LEVEL = Debugging/testing rom aka LEVEL 0 */
var testLevel = {
    ID: 0,
    label: "Testing Room",
    width: 24, height: 14,
    player: { x: 1, y: 1 },
    music: MUSIC.FODLAN_WINDS,
    doors: [
        { x: 1, y: 3, killQuota: 0, exitLocation: { x: 5, y: 2, levelNum: 1 }, transition : false }, //door to level 3
        { x: 6, y: 7, killQuota: 0, exitLocation: { x: 3, y: 1, levelNum: 2 }, transition : false }, //door to level 2
        { x: 21, y: 3, killQuota: 0, exitLocation: { x: 4, y: 1, levelNum: 3 }, transition : false } //door to level 1
    ],

    npcs: [
        { x: 3, y: 5}
    ],

    signs: [
        {
            x: 6, y: 2,
            title: "IMPORTANT DISCLOSURE",
            text: ["According to all known laws of aviation",
                "there is no way a bee should be able to fly.",
                "Its wings are too small to get",
                "its fat little body off the ground.",
                "The bee, of course, flies anyway",
                "because bees don't care",
                "what humans think is impossible."
            ]
        }
    ],

    backgroundWalls: [
        { x: 0, y: 14, width: 24, height: 14 }
    ],
    ground: [
        { x: 0, y: 0, width: 30, height: 1, type: 1 },
        { x: 3, y: 4, width: 5, height: 1, type: 2 },
        { x: 10, y: 6, width: 5, height: 1, type: 2 }
    ],
    chests: [
        //{ x: 3, y: 1, direction : 1},
        { x: 13, y: 7, direction: 0 }
    ],
    bricks: [
        { x: 10, y: 1, width: 1, height: 1 },
    ],
    walls: [
        { x: -1, y: 14, height: 14, type: 2 },
        { x: 15, y: 14, height: 13, type: 2 },
        { x: 25, y: 14, height: 14, type: 2 }
    ],
    obelisks: [
        { x: 8, y: 1, brickX: 15, brickY: 1, brickWidth: 1, brickHeight: 1 }
    ],
    shrooms: [
        { x: 16, y: 1 }
    ],
    goblins: [
        { x: 12, y: 1 }
    ],
    skeletons: [
        { x: 12, y: 7 }
    ],
}

/**
 * Levels below
 */
var level1_1 = {
    ID: 1,
    label: "1-1",
    width: 120, height: 15,
    player: { x: 0, y: 1 },
    music: MUSIC.FODLAN_WINDS,
    doors: [
        { x: 116, y: 12, killQuota: 3, exitLocation: { x: 3, y: 1, levelNum: 2 }, transition : false }, //door to level 2
        //{ x: 2, y: 3, killQuota: 0, exitLocation: { x: 1, y: 1, levelNum: 0 }, transition : false } //debugging room, DELETE THIS BEFORE SUBMISSION!
    ],

    npcs: [
        { x: 55, y: 6}
    ],

    signs: [
        {
            x: 6, y: 2,
            title: "[TUTORIAL: BASIC COMBAT/MOVEMENT]",
            text: ["-[A] to move left, [D] to move right",
                "-[SPACE] to jump and double tap to double jump",
                "-[LEFT-CLICK or P] to swing your sword. Double tap to attack twice.",
                " The second hit is slower, but deals more damage.",
                "-[MOUSE MOVE] + [RIGHT-CLICK] to shoot an arrow in cursor direction.",
                "-Alternatively, tap [O] to shoot an arrow forward in your direction",
                " and hold [W] or [S] to shoot diagonally up or down.",
                "-[SHIFT] to roll and dodge attacks."
            ]
        },
        {
            x: 36, y: 6,
            title: "[TUTORIAL: CROUCHING]",
            text: ["-Hold [S] to crouch.",
                "-While crouching you can move left or right.",
                "-You are still able to attack while crouching!",
                "-Use crouches to get through small spaces or attack quickly.",
                "-You can still roll or shoot an arrow while crouching."
            ]
        },

        {
            x: 53, y: 6,
            title: "[TUTORIAL: HEALING/SHOP]",
            text: ["-[E] to heal and use a potion in your inventory.",
                "-Potions will heal you for up to half your maximum hp.",
                "-Potions are limited so use them sparingly.",
                "-You can get more potions or other equipment by spending",
                " diamonds at the SHOP, which are found somewhere in each level.",
                "-Get diamonds from chests or from enemy drops."
            ]
        },


        {
            x: 92, y: 2,
            title: "[TUTORIAL: WALLJUMP]",
            text: ["-While falling hold a direction against a wall to wallslide",
                "-While wallsliding tap [SPACE] to walljump in the other direction.",
                "         Chain together walljumps to scale vertical heights!",
                "-If hanging on a ledge press [W] to get up"
            ]
        },

        {
            x: 110, y: 11,
            title: "[TUTORIAL: CHESTS/DOORS]",
            text: ["-To open a chest get near it and press [W]",
                "-In general [W] is used to interact with the map.",
                "-Chests contain valuable resources so search for them on each level!",
                "-To progress to the next level press [W] next to the door.",
                "-There is a KILL QUOTA that must be met before progressing to the next floor!"

            ]
        },
    ],

    chests: [{ x: 112, y: 10, direction: 0 }],
    ground: [
        { x: 0, y: 0, width: 15, height: 1, type: 1 },
        { x: 60, y: 0, width: 34, height: 1, type: 1 },
        { x: 15, y: 1, width: 1, height: 1, type: 0 },
        { x: 16, y: 1, width: 1, height: 1, type: 1 },
        { x: 17, y: 1, width: 1, height: 1, type: 2 },
        { x: 20, y: 2, width: 1, height: 1, type: 0 },
        { x: 21, y: 2, width: 3, height: 1, type: 1 },
        { x: 24, y: 2, width: 1, height: 1, type: 2 },
        { x: 25, y: 1, width: 3, height: 1, type: 1 },
        { x: 28, y: 2, width: 1, height: 1, type: 0 },
        { x: 29, y: 2, width: 1, height: 1, type: 1 },
        { x: 30, y: 4, width: 1, height: 1, type: 0 },
        { x: 31, y: 4, width: 28, height: 1, type: 1 },
        { x: 59, y: 4, width: 1, height: 1, type: 2 },
        { x: 94, y: 9, width: 1, height: 1, type: 0 },
        { x: 95, y: 9, width: 25, height: 1, type: 1 }
    ],
    bricks: [
        { x: 30, y: 15, width: 90, height: 3 },
        { x: 30, y: 12, width: 60, height: 2 },
        { x: 30, y: 10, width: 30, height: 1 },
        { x: 75, y: 10, width: 15, height: 1 },
        { x: 30, y: 9, width: 25, height: 1 },
        { x: 80, y: 9, width: 10, height: 1 },
        { x: 32, y: 8, width: 18, height: 1 },
        { x: 85, y: 8, width: 5, height: 5 },
        { x: 95, y: 8, width: 25, height: 9 },
        { x: 32, y: 7, width: 13, height: 1 },
        { x: 40, y: 6, width: 5, height: 1 },
        { x: 31, y: 3, width: 28, height: 1 },
        { x: 30, y: 2, width: 29, height: 1 },
        { x: 21, y: 1, width: 4, height: 1 },
        { x: 28, y: 1, width: 31, height: 1 },
        { x: 15, y: 0, width: 3, height: 1 },
        { x: 20, y: 0, width: 40, height: 1 },
        { x: 94, y: 0, width: 1, height: 1 }
    ],
    walls: [
        { x: -1, y: 15, height: 16, type: 0 },
        { x: 90, y: 12, height: 8, type: 2 },
        { x: 90, y: 4, height: 1, type: 3 },
        { x: 94, y: 8, height: 8, type: 0 },
        { x: 30, y: 3, height: 1, type: 0 },
        { x: 59, y: 3, height: 3, type: 2 },
        { x: 20, y: 1, height: 1, type: 0 },
        { x: 120, y: 15, height: 16, type: 0 }
    ],
    backgroundWalls: [
        { x: 30, y: 12, width: 90, height: 12 }
    ],
    torches: [
        { x: 31, y: 7 },
        { x: 59, y: 7 },
        { x: 70, y: 5 },
        { x: 85, y: 3 },
        { x: 94, y: 12 },
        { x: 115, y: 12 }
    ],
    shrooms: [
        { x: 16, y: 2 },
        { x: 62, y: 1 },
        { x: 72, y: 5 }
    ],
    goblins: [
        { x: 112, y: 12 }
    ],
    skeletons: [
        { x: 47, y: 7 }
    ],
}

var level1_2 = {
    ID: 2,
    label: "1-2",
    width: 120, height: 36,
    player: { x: 1, y: 1 },
    music: MUSIC.CHASING_DAYBREAK,
    doors: [
        { x: 116, y: 3, killQuota: 7, exitLocation: { x: 4, y: 1, levelNum: 3 }, transition : false }, //next level to 3
        { x: 0, y: 3, killQuota: 0, exitLocation: { x: 114, y: 10, levelNum: 1 }, transition : false } //go back to level 1
    ],

    signs: [{
        x: 4, y: 2,
        title: "[TUTORIAL: MORE COMBAT TIPS]",
        text: ["-Each hit has a base 10% chance to CRIT and do x2 damage!",
               "-Cancel an attack animation with a roll to do damage while staying evasive.",
               "-After an enemy spots you they will chase you down for a certain amount of time.",
               "-If you shoot an arrow and it got stuck then you can retrieve it.",
        ]
    }
    ],

    ground: [
        { x: 0, y: 0, width: 45, height: 1, type: 1 },
        { x: 61, y: 0, width: 60, height: 1, type: 1 },
        { x: 45, y: 6, width: 1, height: 1, type: 0 },
        { x: 46, y: 6, width: 14, height: 1, type: 1 },
        { x: 1, y: 6, width: 41, height: 1, type: 1 },
        { x: 5, y: 19, width: 35, height: 1, type: 1 },
        { x: 4, y: 19, width: 1, height: 1, type: 0 }
    ],
    bricks: [
        { x: 45, y: 0, width: 16, height: 1 },
        { x: 46, y: 5, width: 14, height: 5 },
        { x: 0, y: 5, width: 41, height: 2 },
        { x: 5, y: 18, width: 55, height: 7 },
        { x: 57, y: 11, width: 3, height: 1 },
        { x: 58, y: 10, width: 2, height: 1 },
        { x: 59, y: 9, width: 1, height: 1 },
        { x: 5, y: 11, width: 5, height: 1 },
        { x: 5, y: 10, width: 3, height: 1 },
        { x: 5, y: 9, width: 1, height: 1 },
        { x: 0, y: 24, width: 30, height: 2 },
        { x: 30, y: 20, width: 2, height: 1 },
        { x: 0, y: 36, width: 65, height: 8 },
        { x: 10, y: 28, width: 15, height: 2 },
        { x: 25, y: 28, width: 1, height: 1 },
        { x: 10, y: 26, width: 5, height: 1 },
        { x: 35, y: 24, width: 25, height: 2 },
        { x: 41, y: 22, width: 19, height: 4 },
        { x: 65, y: 36, width: 55, height: 14 },
        { x: 65, y: 19, width: 55, height: 8 },
        { x: 85, y: 22, width: 35, height: 3 },
        { x: 9, y: 28, width: 1, height: 1 }
    ],
    walls: [
        { x: 41, y: 5, height: 2, type: 2 },
        { x: 40, y: 22, height: 4, type: 0 },
        { x: 64, y: 28, height: 6, type: 0 },
        { x: 64, y: 19, height: 15, type: 0 },
        { x: 60, y: 24, height: 25, type: 2 },
        { x: 45, y: 5, height: 5, type: 0 },
        { x: 0, y: 24, height: 19, type: 2 },
        { x: 4, y: 18, height: 10, type: 0 },
        { x: 0, y: 28, height: 4, type: 2 },
        { x: 30, y: 24, height: 2, type: 2 },
        { x: 34, y: 24, height: 3, type: 0 },
        { x: 84, y: 22, height: 3, type: 0 },
        { x: 120, y: 36, height: 37, type: 0 }
    ],
    backgroundWalls: [
        { x: 0, y: 36, width: 120, height: 36 }
    ],
    shrooms: [
        { x: 15, y: 20 },
        { x: 12, y: 1 },
        { x: 40, y: 25 },
        { x: 47, y: 25 },
        { x: 102, y: 1 }
    ],
    goblins: [
        { x: 10, y: 7 },
        { x: 8, y: 7 },
        { x: 17, y: 20 },
        { x: 72, y: 1 },
        { x: 105, y: 1 }
    ],
    skeletons: [
        { x: 70, y: 3 },
        { x: 75, y: 3 },
        { x: 100, y: 3 }
    ],
    windows: [
        { x: 2, y: 9, width: 1, height: 1.5 },
        { x: 2, y: 12, width: 1, height: 1.5 },
        { x: 2, y: 15, width: 1, height: 1.5 },
        { x: 2, y: 18, width: 1, height: 1.5 },
        { x: 67, y: 8, width: 4, height: 7 },
        { x: 77, y: 8, width: 4, height: 7 },
        { x: 87, y: 8, width: 4, height: 7 },
        { x: 97, y: 8, width: 4, height: 7 },
        { x: 107, y: 8, width: 4, height: 7 },
        { x: 17, y: 10, width: 2, height: 3 },
        { x: 27, y: 10, width: 2, height: 3 },
        { x: 37, y: 10, width: 2, height: 3 },
        { x: 47, y: 10, width: 2, height: 3 },
        { x: 39, y: 28, width: 2, height: 3 },
        { x: 46, y: 28, width: 2, height: 3 }
    ],
    chests: [
        { x: 2, y: 25, direction: 1 },
        { x: 80, y: 20, direction: 0 }
    ],
    banners: [
        { x: 71, y: 4 },
        { x: 76, y: 4 },
        { x: 81, y: 4 },
        { x: 86, y: 4 },
        { x: 91, y: 4 },
        { x: 96, y: 4 },
        { x: 101, y: 4 },
        { x: 106, y: 4 },
        { x: 2, y: 3 },
        { x: 19, y: 3 }
    ],
    torches: [
        { x: 10, y: 3 },
        { x: 8, y: 9 },
        { x: 20, y: 3 },
        { x: 30, y: 3 },
        { x: 40, y: 3 },
        { x: 35, y: 6 },
        { x: 25, y: 6 },
        { x: 15, y: 6 },
        { x: 25, y: 26 },
        { x: 35, y: 22 },
        { x: 83, y: 22 },
        { x: 77, y: 21 },
        { x: 71, y: 22 },
        { x: 1, y: 27 },
        { x: 7, y: 21 },
        { x: 17, y: 22 }
    ],
    chains: [
        { x: 16, y: 9 },
        { x: 18.5, y: 9 },
        { x: 26, y: 9 },
        { x: 28.5, y: 9 },
        { x: 36, y: 9 },
        { x: 38.5, y: 9 },
        { x: 46, y: 9 },
        { x: 48.5, y: 9 },
        { x: 38, y: 27 },
        { x: 47.5, y: 27 }
    ],
    ceilingChains: [
        { x: 4, y: 3, height: 1.5 },
        { x: 4.5, y: 3, height: 2 },
        { x: 11, y: 3, height: 1.2 },
        { x: 11.5, y: 3, height: 2.2 },
        { x: 12, y: 3, height: 1.5 },
        { x: 15, y: 3, height: 2 },
        { x: 21, y: 3, height: 1.5 },
        { x: 27, y: 3, height: 1.5 },
        { x: 27.5, y: 4, height: 2 },
        { x: 37, y: 3, height: 1.5 },
        { x: 37.5, y: 3, height: 2 },
        { x: 38, y: 4, height: 2 },
        { x: 58, y: 9, height: 2 },
        { x: 6, y: 9, height: 1.5 },
        { x: 6.5, y: 10, height: 2 },
        { x: 1, y: 22, height: 1.5 },
        { x: 1.3, y: 22, height: 2 },
        { x: 1.6, y: 23, height: 2 },
        { x: 3, y: 22, height: 1.5 },
        { x: 3.3, y: 22, height: 2 },
        { x: 3.6, y: 23, height: 2 },
        { x: 12, y: 22, height: 2 },
        { x: 12.3, y: 22, height: 1.5 },
        { x: 12.6, y: 23, height: 2 },
        { x: 20, y: 22, height: 2 },
        { x: 22, y: 22, height: 2 },
        { x: 22.3, y: 22, height: 1.5 },
        { x: 22.6, y: 23, height: 2 },
        { x: 24, y: 22, height: 2 },
        { x: 67, y: 22, height: 2 },
        { x: 67.3, y: 22, height: 1.5 },
        { x: 67.6, y: 23, height: 2 },
        { x: 78, y: 22, height: 1.5 },
        { x: 78.3, y: 22, height: 2 },
        { x: 78.6, y: 23, height: 2 }
    ],
    columns: [
        { x: 74, y: 11, height: 11 },
        { x: 84, y: 11, height: 11 },
        { x: 94, y: 11, height: 11 },
        { x: 104, y: 11, height: 11 },
        { x: 53, y: 11, height: 5 },
        { x: 34, y: 11, height: 5 },
        { x: 24, y: 11, height: 5 },
        { x: 14, y: 11, height: 5 }
    ],
    supports: [
        { x: 64, y: 11, width: 56 },
        { x: 10, y: 11, width: 47 }
    ]
}

var level1_3 = {
    ID: 3,
    label: "1-3",
    width: 120, height: 42,
    player: { x: 1, y: 1 },
    music: MUSIC.BETWEEN_HEAVEN_AND_EARTH,
    signs: [
        {
            x: 4, y: 2,
            title: "[TUTORIAL: OBELISK]",
            text: ["-These strange devices can unlock inaccessible/secret areas!",
                   "-To activate: hit them or press \'W'\ next to it."
            ]
        },
    ],
    doors: [
        { x: 1, y: 3, killQuota: 0, exitLocation: { x: 114, y: 1, levelNum: 2 }, transition : false }, //go back to level 2
        { x: 117, y: 25, killQuota: 4, exitLocation: { x: 1, y: 3, levelNum: 3 }, transition : true }, // change to level 4 once theres a level 4
        { x: 34, y: 35, killQuota: 1, exitLocation: { x: 1, y: 3, levelNum: 3 }, transition : false } // change to treasure room
    ],
    ground: [
        { x: 0, y: 0, width: 10, type: 1 }
    ],
    obelisks: [
        { x: 7, y: 1, brickX: 10, brickY: 15, brickWidth: 3, brickHeight: 15 },
        { x: 79, y: 15, brickX: 81, brickY: 17, brickWidth: 3, brickHeight: 3 },
        { x: 100, y: 23, brickX: 105, brickY: 30, brickWidth: 11, brickHeight: 8 }
    ],
    shrooms: [
        { x: 107, y: 32 },
        { x: 36, y: 35 },
        { x: 77, y: 27 },
        { x: 61, y: 9}
    ],
    goblins: [
        { x: 110, y: 32 },
    ],
    skeletons: [
        { x: 112, y: 32 },
        { x: 73, y: 27 },
        { x: 77, y: 27 },
    ],
    chests: [
        { x: 77, y: 15, direction: 0 },
        { x: 53, y: 5, directon: 1 },
    ],
    bricks: [
        { x: 120, y: 42, width: 1, height: 43 },
        { x: 105, y: 42, width: 1, height: 12 },
        { x: 115, y: 42, width: 1, height: 12 },
        { x: 10, y: 2, width: 3, height: 3 },
        { x: 13, y: 0, width: 20, height: 1 },
        { x: 33, y: 2, width: 3, height: 3 },
        { x: 36, y: 0, width: 48, height: 1 },
        { x: 77, y: 14, width: 7, height: 14 },
        { x: 71, y: 25, width: 13, height: 8 },
        { x: 71, y: 17, width: 2, height: 1 },
        { x: 71, y: 16, width: 1, height: 1 },
        { x: 84, y: 12, width: 15, height: 13 },
        { x: 99, y: 22, width: 21, height: 23 },
        { x: 30, y: 32, width: 13, height: 2 },
        { x: 28, y: 42, width: 2, height: 12 },
        { x: 30, y: 42, width: 13, height: 5 },
        { x: 27, y: 42, width: 1, height: 33 },
        { x: 26, y: 42, width: 1, height: 31 },
        { x: 24, y: 42, width: 1, height: 15 },
        { x: 23, y: 42, width: 1, height: 7 },
        { x: 25, y: 42, width: 1, height: 33 },
        { x: 30, y: 30, width: 10, height: 1 },
        { x: 31, y: 29, width: 7, height: 1 },
        { x: 33, y: 28, width: 4, height: 1 },
        { x: 30, y: 33, width: 2, height: 1 },
        { x: 30, y: 37, width: 10, height: 1 },
        { x: 30, y: 36, width: 1, height: 1 },
        { x: 35, y: 27, width: 1, height: 18 },
        { x: 34, y: 27, width: 1, height: 16 },
        { x: 36, y: 27, width: 1, height: 17 },
        { x: 4, y: 42, width: 1, height: 33 },
        { x: 5, y: 42, width: 1, height: 34 },
        { x: 15, y: 42, width: 1, height: 33 },
        { x: 16, y: 42, width: 1, height: 31 },
        { x: 91, y: 42, width: 1, height: 18 },
        { x: 90, y: 42, width: 1, height: 16 },
        { x: 89, y: 42, width: 1, height: 10 },
        { x: 69, y: 42, width: 21, height: 12 },
        { x: 85, y: 30, width: 5, height: 1 },
        { x: 87, y: 29, width: 3, height: 1 },
        { x: 89, y: 28, width: 1, height: 1 },
        { x: 84, y: 22, width: 1, height: 1 },
    ],
    platforms: [
        { x: 22, y: 2, width: 2, height: 1 },
        { x: 40, y: 7, width: 2, height: 1 },
        { x: 49, y: 12, width: 2, height: 1 },
        { x: 59, y: 22, width: 5, height: 1 },
        { x: 69, y: 12, width: 5, height: 1 },
        { x: 89, y: 17, width: 3, height: 1 },
        { x: 95, y: 21, width: 1, height: 1 },
        { x: 45, y: 30, width: 2, height: 1 },
        { x: 51, y: 4, width: 4, height: 1 },
        { x: 60, y: 8, width: 3, height: 1 }
    ],
    walls: [
        { x: 57, y: 22, height: 8, type: 0 },
        { x: 53, y: 25, height: 8, type: 2 },
        { x: 70, y: 25, height: 12, type: 0 }
    ],
    backgroundWalls: [
        { x: 0, y: 42, width: 120, height: 42 }
    ],
    columns: [
        { x: 5, y: 8, height: 8 },
        { x: 15, y: 9, height: 9 },
        { x: 26, y: 11, height: 11 },
        { x: 35, y: 9, height: 9 }
    ],
    spikes: [
        { x: 13, y: 1, width: 20 },
        { x: 36, y: 1, width: 41 },
        { x: 84, y: 13, width: 15 }
    ]
}
