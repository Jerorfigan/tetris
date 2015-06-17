if(!window.tetris){
    window.tetris = {};
}

(function(){
    /* Private functions */

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
        [
            // TODO add offsets for L type
        ]
    ];

    function getRandomBlockType(){
        //return Math.floor(Math.random() * 3);
        // TODO remove test code...test code has removed block L type (2) for the time being since not yet implemented
        return Math.floor(Math.random() * 2);
    }

    function getRandomBlockAngle(){
        return Math.floor(Math.random() * 4);
    }
    /* End private functions */

    var Block = function(){
        this.position = {
            x: window.tetris.Settings.blockSpawnPos.x,
            y: window.tetris.Settings.blockSpawnPos.y};
        this.timeUntilGravityUpdateInSeconds = window.tetris.Settings.blockFallPeriod;
        this.type = getRandomBlockType.call(this);
        this.angle = getRandomBlockAngle.call(this);
    };

    Block.prototype.applyRotation = function(){
        // TODO apply rotation from user input
    };

    Block.prototype.applyDownForce = function(){
        // TODO apply down force from user input
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
        return points;
    };

    Block.prototype.draw = function(){
        // TODO draw block
    };

    window.tetris.Block = Block;
}());