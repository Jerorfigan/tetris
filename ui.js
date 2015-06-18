if(!window.tetris){
    window.tetris = {};
}

(function(){
    /* Private members */
    function initData(){
        this.data.level = 1;
        this.data.score = 0;
        this.data.lines = 0;
    }

    function showMessage(message){
        this.messageTag.innerHTML = message;
    }

    function onBlockPlaced(){
        this.data.score += window.tetris.Settings.pointsForBlockPlace;
    }

    function onLineClear(eventData){
        this.data.lines++;
        this.data.score +=
            window.tetris.Settings.pointsForLineClearBase *
            Math.pow(window.tetris.Settings.pointsForLineClearMult,eventData.prevLinesCleared);
    }
    /* End private members */

    var UI = function(){
        this.data = {
            level: null,
            score: null,
            lines: null
        };
        initData.call(this);

        this.messageTag = window.document.getElementById("tetris-message");
        this.levelTag = window.document.getElementById("tetris-level");
        this.scoreTag = window.document.getElementById("tetris-score");
        this.linesTag = window.document.getElementById("tetris-lines");

        // register events
        window.tetris.EventManager.subscribe("ShowMessage", showMessage, this);
        window.tetris.EventManager.subscribe("BlockPlaced", onBlockPlaced, this);
        window.tetris.EventManager.subscribe("LineCleared", onLineClear, this);
        window.tetris.EventManager.subscribe("GameRestart", initData, this);
    };

    UI.prototype.draw = function(){
        this.levelTag.innerHTML = this.data.level;
        this.scoreTag.innerHTML = this.data.score;
        this.linesTag.innerHTML = this.data.lines;
    };

    window.tetris.UI = UI;
}());
