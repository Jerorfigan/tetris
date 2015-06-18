if(!window.tetris){
    window.tetris = {};
}

(function(){
    var GameManager = function(){
        this.canvas = null;
        this.uiCanvas = null;
        this.gameState = "init";
        this.grid = null;
        this.blockQueue = null;
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
                this.blockQueue = new window.tetris.BlockQueue();
                this.ui = new window.tetris.UI();
                this.level = 1;
                window.tetris.EventManager.fire("ShowMessage", window.tetris.Labels.playerControlsMsg);
                this.gameState = "playing";
                break;
            case "playing":
                if(this.grid.isActive()){
                    this.grid.update();
                }else{
                    // Check if we should transition level
                    var requiredScoreForNextLevel = Math.pow(this.level, 3) + 200 * this.level;
                    if(this.ui.getScore() >= requiredScoreForNextLevel){
                        this.level++;
                        handleLevelChange.call(this);
                        window.tetris.EventManager.fire("LevelChanged");
                    }

                    this.grid.spawnBlock(this.blockQueue.getNext());
                    if(!this.grid.isInValidState()){
                        window.tetris.EventManager.fire("ShowMessage", window.tetris.Labels.restartGameMsg);
                        this.gameState = "game_over";
                        break;
                    }
                }
                break;
            case "game_over":
                if(window.tetris.Input.getPressCount("Space") > 0){
                    window.tetris.Input.clearPressCount("Space");

                    // Reset objects
                    window.tetris.Settings.reset();
                    this.grid.reset();

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
        this.blockQueue.draw(this.uiCanvas);
        this.ui.draw();
    };

    window.tetris.GameManager = GameManager;
}());
