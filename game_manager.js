if(!window.tetris){
    window.tetris = {};
}

(function(){
    var GameManager = function(){
        this.canvas = window.document.getElementById("tetris-canvas");
        this.context2d = this.canvas.getContext("2d");
        this.gameState = "playing";
        this.grid = new window.tetris.Grid(
            window.tetris.Settings.gridWidth,
            window.tetris.Settings.gridHeight);
    };

    GameManager.prototype.update = function(){
        switch(this.gameState){
            case "playing":
                if(this.grid.isActive()){
                    this.grid.update();
                }else{
                    this.grid.spawnBlock();
                    if(!this.grid.isInValidState()){
                        this.gameState = "game_over";
                        break;
                    }
                }
                break;
            case "game_over":
                break;
            default:
                throw "Unknown game state";
        }
    };

    GameManager.prototype.draw = function(){
        this.grid.draw();
    };

    window.tetris.GameManager = GameManager;
}());
