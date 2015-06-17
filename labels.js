if(!window.tetris){
    window.tetris = {};
}

(function(){
    var Labels = function(){
        this.playerControlsMsg = "Arrow keys move block, Z and X rotate";
        this.restartGameMsg = "Press space to restart game";
        this.initializingMsg = "Initializing game...";
    };

    window.tetris.Labels = new Labels();
}());