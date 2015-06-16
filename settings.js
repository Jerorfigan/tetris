if(!window.tetris){
    window.tetris = {};
}

(function(){
    var Settings = function(){
        this.targetFps = 30;
        // TODO define other game settings
    };

    window.tetris.Settings = new Settings();
}());