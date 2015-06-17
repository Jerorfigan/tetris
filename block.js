if(!window.tetris){
    window.tetris = {};
}

(function(){
    /* Private Members */

    // offsets stored as 3d array
    // first index is the block type (square type = 0, straight type = 1, L type = 2)
    // second index is the angle (0 degrees = 0, 90 degrees = 1, 180 degrees = 2, 270 degrees = 3)
    // third index is which offset
    var offsets = [
        // square type (0)
        /* P = pivot point
            0, 90, 180, 270 degrees (i.e. square doesn't actually rotate, making behavior simpler)
            ---------
            | P |   |
            ---------
            |   |   |
            ---------
        */
        [
            // 0 degrees (0)
            [{x:1,y:0},{x:0,y:1},{x:1,y:1}],
            // 90 degrees (1)
            [{x:1,y:0},{x:0,y:1},{x:1,y:1}],
            // 180 degrees (2)
            [{x:1,y:0},{x:0,y:1},{x:1,y:1}],
            // 270 degrees (3)
            [{x:1,y:0},{x:0,y:1},{x:1,y:1}]
        ],
        // straight type (1)
        /* P = pivot point
             0 degrees                             180 degrees
             -----                                 -----
             |   |        90 degrees               |   |        270 degrees
             -----        -----------------        -----        -----------------
             | P |        |   |   | P |   |        |   |        |   | P |   |   |
             -----        -----------------        -----        -----------------
             |   |                                 | P |
             -----                                 -----
             |   |                                 |   |
             -----                                 -----
         */
        [
            // 0 degrees (0)
            [{x:0,y:-1},{x:0,y:1},{x:0,y:2}],
            // 90 degrees (1)
            [{x:-2,y:0},{x:-1,y:0},{x:1,y:0}],
            // 180 degrees (2)
            [{x:0,y:-2},{x:0,y:-1},{x:0,y:1}],
            // 270 degrees (3)
            [{x:-1,y:0},{x:1,y:0},{x:2,y:0}]
        ],
        // L type (2)
        /* P = pivot point
            0 degrees                       180 degrees      270 degrees
            -----                           ---------                -----
            |   |        90 degrees         |   | P |                |   |
            -----        -------------      ---------        -------------
            |   |        | P |   |   |          |   |        |   |   | P |
            ---------    -------------          -----        -------------
            | P |   |    |   |                  |   |
            ---------    -----                  -----
         */
        [
            // 0 degrees (0)
            [{x:0,y:-2},{x:0,y:-1},{x:1,y:0}],
            // 90 degrees (1)
            [{x:1,y:0},{x:2,y:0},{x:0,y:-1}],
            // 180 degrees (2)
            [{x:-1,y:0},{x:0,y:1},{x:0,y:2}],
            // 270 degrees (3)
            [{x:-2,y:0},{x:-1,y:0},{x:0,y:-1}]
        ]
    ];

    var blockColors = [
        {fill: "#FF0000", inset: "#FF4D4D", outset: "#B20000"}, // red
        {fill: "#00FF00", inset: "#4DFF4D", outset: "#00B200"}, // green
        {fill: "#0000FF", inset: "#4D4DFF", outset: "#0000B2"}, // blue
        {fill: "#FF9900", inset: "#FFB84D", outset: "#B26B00"}, // orange
        {fill: "#FF00FF", inset: "#FF4DFF", outset: "#B200B2"}, // purple
        {fill: "#00FFFF", inset: "#4DFFFF", outset: "#00B2B2"}  // teal
    ];

    function getRandomBlockType(){
        return Math.floor(Math.random() * 3);
    }

    function getRandomBlockAngle(){
        return Math.floor(Math.random() * 4);
    }

    function getRandomBlockColor(){
        return Math.floor(Math.random() * blockColors.length);
    }
    /* End Private Members */

    var Block = function(){
        this.position = {
            x: window.tetris.Settings.blockSpawnPos.x,
            y: window.tetris.Settings.blockSpawnPos.y};
        this.timeUntilGravityUpdateInSeconds = window.tetris.Settings.blockFallPeriod;
        this.timeUntilDownForceUpdateInSeconds = window.tetris.Settings.blockDownForcePeriod;
        this.timeUntilHorizontalForceUpdateInSeconds = window.tetris.Settings.blockHorizontalForcePeriod;
        this.timeUntilRotationForceUpdateInSeconds = window.tetris.Settings.blockRotationForcePeriod;
        this.type = getRandomBlockType.call(this);
        this.angle = getRandomBlockAngle.call(this);
        this.color = getRandomBlockColor.call(this);
    };

    Block.prototype.applyRotation = function(){
        if(window.tetris.Input.getReleaseCount("Z") > 0 || window.tetris.Input.getReleaseCount("X") > 0){
            // Upon releasing Z/X, reset rotation timer to prevent accidental double rotates
            this.timeUntilRotationForceUpdateInSeconds = window.tetris.Settings.blockRotationForcePeriod;
            window.tetris.Input.clearReleaseCount("Z");
            window.tetris.Input.clearReleaseCount("X");
        }
        // On the first press, do an immediate update
        if(window.tetris.Input.getPressCount("Z") > 0 || window.tetris.Input.getPressCount("X") > 0){
            if(window.tetris.Input.getPressCount("Z") > 0) {
                this.angle -= 1;
                window.tetris.Input.clearPressCount("Z");
            }else if(window.tetris.Input.getPressCount("X") > 0){
                this.angle += 1;
                window.tetris.Input.clearPressCount("X");
            }
            // Upon detecting a keypress, reset rotation timer to prevent accidental double rotates
            this.timeUntilRotationForceUpdateInSeconds = window.tetris.Settings.blockRotationForcePeriod;
        }else if(window.tetris.Input.isKeyDown("Z") || window.tetris.Input.isKeyDown("X")){
            // Continued press, do update at interval
            this.timeUntilRotationForceUpdateInSeconds -= window.tetris.Settings.targetFramePeriodInSeconds;
            if(this.timeUntilRotationForceUpdateInSeconds <= 0){
                if(window.tetris.Input.isKeyDown("Z")) {
                    this.angle -= 1;
                }else if(window.tetris.Input.isKeyDown("X")){
                    this.angle += 1;
                }
                this.timeUntilRotationForceUpdateInSeconds = window.tetris.Settings.blockRotationForcePeriod;
            }
        }
        // wrap angle between 0 and 3
        if(this.angle < 0) this.angle = 3;
        if(this.angle > 3) this.angle = 0;
    };

    Block.prototype.applyHorizontalForce = function(){
        if(window.tetris.Input.getReleaseCount("Left") > 0 || window.tetris.Input.getReleaseCount("Right") > 0){
            // Upon releasing Left/Right, reset horizontal force timer to prevent accidental double rotates
            this.timeUntilHorizontalForceUpdateInSeconds = window.tetris.Settings.blockHorizontalForcePeriod;
            window.tetris.Input.clearReleaseCount("Left");
            window.tetris.Input.clearReleaseCount("Right");
        }
        // On the first press, do an immediate update
        if(window.tetris.Input.getPressCount("Left") > 0 || window.tetris.Input.getPressCount("Right") > 0) {
            if (window.tetris.Input.getPressCount("Left") > 0) {
                this.position.x -= 1;
                window.tetris.Input.clearPressCount("Left");
            } else if (window.tetris.Input.getPressCount("Right") > 0) {
                this.position.x += 1;
                window.tetris.Input.clearPressCount("Right");
            }
            // Reset horizontal update timer to prevent accidental double moves
            this.timeUntilHorizontalForceUpdateInSeconds = window.tetris.Settings.blockHorizontalForcePeriod;
        }else if(window.tetris.Input.isKeyDown("Left") || window.tetris.Input.isKeyDown("Right")){
            // Continued press, do update at interval
            this.timeUntilHorizontalForceUpdateInSeconds -= window.tetris.Settings.targetFramePeriodInSeconds;
            if(this.timeUntilHorizontalForceUpdateInSeconds <= 0){
                if(window.tetris.Input.isKeyDown("Left")){
                    this.position.x -= 1;
                }else if(window.tetris.Input.isKeyDown("Right")){
                    this.position.x += 1;
                }
                this.timeUntilHorizontalForceUpdateInSeconds = window.tetris.Settings.blockHorizontalForcePeriod;
            }
        }
    };

    Block.prototype.applyDownForce = function(){
        if(window.tetris.Input.isKeyDown("Down")){
            this.timeUntilDownForceUpdateInSeconds -= window.tetris.Settings.targetFramePeriodInSeconds;
            if(this.timeUntilDownForceUpdateInSeconds <= 0){
                this.position.y += 1;
                this.timeUntilDownForceUpdateInSeconds = window.tetris.Settings.blockDownForcePeriod;
            }
        }
    };

    Block.prototype.applyGravity = function(){
        this.timeUntilGravityUpdateInSeconds -= window.tetris.Settings.targetFramePeriodInSeconds;
        if(this.timeUntilGravityUpdateInSeconds <= 0){
            this.position.y += 1;
            this.timeUntilGravityUpdateInSeconds = window.tetris.Settings.blockFallPeriod;
        }
    };

    Block.prototype.resetState = function(state){
        this.position.x = state.position.x;
        this.position.y = state.position.y;
        this.angle = state.angle;
    };

    Block.prototype.getState = function(){
        return {
            position: {x: this.position.x, y: this.position.y},
            angle: this.angle
        };
    };

    Block.prototype.getPoints = function(){
        var points = [];
        for(var i = 0; i < offsets[this.type][this.angle].length; i++){
            points.push({
                x: this.position.x + offsets[this.type][this.angle][i].x,
                y: this.position.y + offsets[this.type][this.angle][i].y
            });
        }
        points.push({x: this.position.x, y: this.position.y});
        return points;
    };

    Block.prototype.getColor = function(){
        return blockColors[this.color];
    };

    window.tetris.Block = Block;
}());