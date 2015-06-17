if(!window.tetris){
    window.tetris = {};
}

(function(){
    var Settings = function(){
        this.targetFps = 30; // frames per second
        this.targetFramePeriodInSeconds = 1 / this.targetFps; // seconds per frame
        this.gridWidth = 10; // in blocks
        this.gridHeight = 20; // in blocks
        this.blockSpawnPos = {x: Math.floor(this.gridWidth / 2), y: Math.min(2, this.gridHeight - 1)};
        this.blockFallSpeed = 1; // in grid blocks per second
        this.blockFallPeriod = 1 / this.blockFallSpeed; // in seconds per grid block
        // TODO define other game settings
    };

    window.tetris.Settings = new Settings();
}());