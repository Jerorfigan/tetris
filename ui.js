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

    function onBlockPlaced(eventData){
        // translateDownUpdates is a count of how many units the block was translated down due to the player holding the
        // down arrow. As placing the block is harder when its being dropped quicker, we're awarding the player additional
        // points for this.
        this.data.score += window.tetris.Settings.pointsForBlockPlace + eventData.translateDownUpdates;
    }

    function onLinesCleared(eventData){
        this.data.lines += eventData.linesCleared;

        if(onLinesCleared.prevLinesCleared != undefined && onLinesCleared.prevLinesCleared == 4 && eventData.linesCleared == 4){
            // Got a double tetris!
            this.data.score += window.tetris.Settings.pointsForBackToBackTetris;
        }else{
            this.data.score +=
                window.tetris.Settings.pointsForLineClearBase *
                Math.pow(window.tetris.Settings.pointsForLineClearMult, eventData.linesCleared - 1);
        }

        onLinesCleared.prevLinesCleared = eventData.linesCleared;
    }

    function onLevelChange(){
        this.data.level++;
    }
    /* End private members */

    var UI = function(){
        this.data = {
            level: null,
            score: null,
            lines: null
        };
    };

    UI.prototype.init = function(){
        initData.call(this);

        this.messageTag = window.document.getElementById("tetris-message");
        this.levelTag = window.document.getElementById("tetris-level");
        this.scoreTag = window.document.getElementById("tetris-score");
        this.linesTag = window.document.getElementById("tetris-lines");
        this.gravitySwitch = window.document.getElementById("tetris-gravity-switch");

        // register events
        window.tetris.EventManager.subscribe("ShowMessage", showMessage, this);
        window.tetris.EventManager.subscribe("BlockPlaced", onBlockPlaced, this);
        window.tetris.EventManager.subscribe("LinesCleared", onLinesCleared, this);
        window.tetris.EventManager.subscribe("GameRestart", initData, this);
        window.tetris.EventManager.subscribe("LevelChanged", onLevelChange, this);

        this.gravitySwitch.addEventListener("change", function(eventObject){
            window.tetris.Settings.gridApplyGravity = eventObject.target.checked;
        });
    };

    UI.prototype.draw = function(){
        this.levelTag.innerHTML = this.data.level;
        this.scoreTag.innerHTML = this.data.score;
        this.linesTag.innerHTML = this.data.lines;
    };

    UI.prototype.getScore = function(){
        return this.data.score;
    };

    window.tetris.UI = UI;
}());
