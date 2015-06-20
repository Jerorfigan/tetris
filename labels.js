if(!window.tetris){
    window.tetris = {};
}

(function(){
    var Labels = function(){
        this.playerControlsMsg = "arrow keys move block, Z and X rotate, space to pause";
        this.restartGameMsg = "press space to restart game";
        this.initializingMsg = "initializing game...";
    };

    window.tetris.Labels = new Labels();
}());