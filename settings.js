if(!window.tetris){
    window.tetris = {};
}

(function(){
    var Settings = function(){
        // fps settings
        this.targetFps = 30; // frames per second
        this.targetFramePeriodInSeconds = 1 / this.targetFps; // seconds per frame

        // grid settings
        this.gridWidth = 10; // in blocks
        this.gridHeight = 20; // in blocks
        this.gridBlockDrawWidth = 20; // in pixels
        this.gridBlockDrawHeight = 20; // in pixels
        this.gridOutlineDrawWidth = 2; // in pixels
        this.gridOutlineColor = "#606060";
        this.gridBlockOutlineWidth = 2; // in pixels
        this.gridBlockOutlineColor = "#303030";
        this.gridBlockInsetWidth = 2; // in pixels

        // block settings
        this.blockSpawnPos = {x: Math.floor(this.gridWidth / 2), y: Math.min(2, this.gridHeight - 1)};
        this.blockFallSpeed = 3; // in grid blocks per second
        this.blockFallPeriod = 1 / this.blockFallSpeed; // in seconds per grid block
        this.blockDownForceSpeed = 18; // in grid blocks per second
        this.blockDownForcePeriod = 1 / this.blockDownForceSpeed; // in seconds per grid block
        this.blockHorizontalForceSpeed = 10; // in grid blocks per second
        this.blockHorizontalForcePeriod = 1 / this.blockHorizontalForceSpeed; // in seconds per grid block
        this.blockRotationForceSpeed = 1; // in 90 degree increments per second
        this.blockRotationForcePeriod = 1 / this.blockRotationForceSpeed; // in seconds per 90 degree increment
        // TODO define other game settings
    };

    window.tetris.Settings = new Settings();
}());