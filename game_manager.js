if(!window.tetris){
    window.tetris = {};
}

(function(){
    var GameManager = function(){
        this.canvas = null;
        this.gameState = "init";
        this.grid = null;
    };

    GameManager.prototype.update = function(){
        switch(this.gameState){
            case "init":
                window.tetris.UI.showMessage(window.tetris.Labels.initializingMsg);
                this.canvas = window.document.getElementById("tetris-canvas");
                this.grid = new window.tetris.Grid(
                    window.tetris.Settings.gridWidth,
                    window.tetris.Settings.gridHeight);
                window.tetris.UI.showMessage(window.tetris.Labels.playerControlsMsg);
                this.gameState = "playing";
                break;
            case "playing":
                if(this.grid.isActive()){
                    this.grid.update();
                }else{
                    this.grid.spawnBlock();
                    if(!this.grid.isInValidState()){
                        window.tetris.UI.showMessage(window.tetris.Labels.restartGameMsg);
                        this.gameState = "game_over";
                        break;
                    }
                }
                break;
            case "game_over":
                if(window.tetris.Input.getPressCount("Space") > 0){
                    window.tetris.Input.clearPressCount("Space");
                    this.grid.reset();
                    window.tetris.UI.showMessage(window.tetris.Labels.playerControlsMsg);
                    this.gameState = "playing";
                }
                break;
            default:
                throw "Unknown game state";
        }
    };

    GameManager.prototype.draw = function(){
        // Clear canvas to white
        var ctx2d = this.canvas.getContext("2d");
        ctx2d.fillStyle = "#FFFFFF";
        ctx2d.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.grid.draw(this.canvas);
    };

    window.tetris.GameManager = GameManager;
}());
