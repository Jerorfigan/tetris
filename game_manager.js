if(!window.tetris){
    window.tetris = {};
}

(function(){
    var GameManager = function(){
        this.canvas = null;
        this.uiCanvas = null;
        this.gameState = "init";
        this.grid = null;
        this.tetrominoQueue = null;
        this.ui = null;
        this.level = null;
    };

    function handleLevelChange(){
        // Increase block fall speed
        window.tetris.Settings.blockFallSpeed = 0.1 * Math.pow(this.level, 1.5) + 3;
        window.tetris.Settings.blockFallPeriod = 1 / window.tetris.Settings.blockFallSpeed;
    }

    GameManager.prototype.update = function(){
        switch(this.gameState){
            case "init":
                window.tetris.EventManager.fire("ShowMessage", window.tetris.Labels.initializingMsg);
                this.canvas = window.document.getElementById("tetris-canvas");
                this.uiCanvas = window.document.getElementById("tetris-ui-next-block-canvas");
                this.grid = new window.tetris.Grid(
                    window.tetris.Settings.gridWidth,
                    window.tetris.Settings.gridHeight);
                this.tetrominoQueue = new window.tetris.TetrominoQueue(this.grid);
                this.ui = new window.tetris.UI();
                this.level = 1;
                window.tetris.EventManager.fire("ShowMessage", window.tetris.Labels.playerControlsMsg);
                this.gameState = "playing";
                break;
            case "playing":
                // Check for pause
                if(window.tetris.Input.getPressCount("Space") > 0) {
                    window.tetris.Input.clearPressCount("Space");
                    window.document.getElementById("tetris-pause-message").style.visibility = "visible";
                    this.gameState = "paused";
                    break;
                }

                if(this.grid.isReadyToSpawnBlock()){
                    // Check if we should transition level
                    var requiredScoreForNextLevel = Math.pow(this.level, 3) + 1000 * this.level;
                    if(this.ui.getScore() >= requiredScoreForNextLevel){
                        this.level++;
                        handleLevelChange.call(this);
                        window.tetris.EventManager.fire("LevelChanged");
                    }

                    try{
                        this.grid.spawnTetromino(this.tetrominoQueue.getNext());
                    }catch(error) {
                        if (error == "GRID IS FULL") {
                            window.tetris.EventManager.fire("ShowMessage", window.tetris.Labels.restartGameMsg);
                            this.gameState = "game_over";
                        } else {
                            throw error;
                        }
                    }
                }else{
                    this.grid.update();
                }
                break;
            case "paused":
                if(window.tetris.Input.getPressCount("Space") > 0) {
                    window.tetris.Input.clearPressCount("Space");
                    window.document.getElementById("tetris-pause-message").style.visibility = "hidden";
                    this.gameState = "playing";
                }
                break;
            case "game_over":
                if(window.tetris.Input.getPressCount("Space") > 0){
                    window.tetris.Input.clearPressCount("Space");

                    // Reset objects
                    window.tetris.Settings.reset();
                    this.grid.reset();
                    this.level = 1;

                    // Fire events
                    window.tetris.EventManager.fire("GameRestart");
                    window.tetris.EventManager.fire("ShowMessage", window.tetris.Labels.playerControlsMsg);

                    // Transition game state
                    this.gameState = "playing";
                }
                break;
            default:
                throw "Unknown game state";
        }
    };

    GameManager.prototype.draw = function(){
        // Clear canvas
        var ctx2d = this.canvas.getContext("2d");
        ctx2d.clearRect(0,0,this.canvas.width, this.canvas.height);
        // Clear ui canvas to white
        var ctx2dui = this.uiCanvas.getContext("2d");
        ctx2dui.fillStyle = window.tetris.Settings.uiGridColor;
        ctx2dui.fillRect(0,0,this.uiCanvas.width, this.uiCanvas.height);

        this.grid.draw(this.canvas);
        this.tetrominoQueue.draw(this.uiCanvas);
        this.ui.draw();
    };

    window.tetris.GameManager = GameManager;
}());
