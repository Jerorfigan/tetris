if(!window.tetris){
    window.tetris = {};
}

(function(){
    var Settings = function(){
        this.reset();
    };

    Settings.prototype.reset = function(){
        // fps settings
        this.targetFps = 30; // frames per second
        this.targetFramePeriodInSeconds = 1 / this.targetFps; // seconds per frame

        // canvas settings
        this.canvasWidth = 500; // in pixels
        this.canvasHeight = 500; // in pixels

        // grid settings
        this.gridWidth = 10; // in blocks
        this.gridHeight = 20; // in blocks
        this.gridBlockDrawWidth = 20; // in pixels
        this.gridBlockDrawHeight = 20; // in pixels
        this.gridOutlineDrawWidth = 2; // in pixels
        this.gridOutlineColor = "#FFFFFF";
        this.gridBlockOutlineWidth = 2; // in pixels
        this.gridBlockOutlineColor = "#000";
        this.gridBlockInsetWidth = 2; // in pixels
        this.gridApplyGravity = window.document.getElementById("tetris-gravity-switch").checked;

        // block settings
         this.blockFallSpeed = 3; // in grid blocks per second
        this.blockFallPeriod = 1 / this.blockFallSpeed; // in seconds per grid block
        this.blockDownForceSpeed = 18; // in grid blocks per second
        this.blockDownForcePeriod = 1 / this.blockDownForceSpeed; // in seconds per grid block
        this.blockHorizontalForceSpeed = 10; // in grid blocks per second
        this.blockHorizontalForcePeriod = 1 / this.blockHorizontalForceSpeed; // in seconds per grid block
        this.blockRotationForceSpeed = 1; // in 90 degree increments per second
        this.blockRotationForcePeriod = 1 / this.blockRotationForceSpeed; // in seconds per 90 degree increment

        // grid ui settings
        this.uiGridColor = "#000";

        // score settings
        this.pointsForBlockPlace = 10;
        this.pointsForLineClearBase = 100;
        this.pointsForLineClearMult = 2;
        this.pointsForBackToBackTetris = 1200;
    };

    window.tetris.Settings = new Settings();
}());