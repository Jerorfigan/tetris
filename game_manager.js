if(!window.tetris){
    window.tetris = {};
}

(function(){
    var GameManager = function(){
        this.canvas = window.document.getElementById("tetris-canvas");
        this.context2d = this.canvas.getContext("2d");
    };

    GameManager.prototype.update = function(){
        // TODO update game state
    };

    GameManager.prototype.draw = function(){
        // TODO draw game state
    };

    window.tetris.GameManager = GameManager;
}());
