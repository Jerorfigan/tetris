if(!window.tetris){
    window.tetris = {};
}

(function(){
    /* Private members */
    function handleLevelChange(){
        // Increase block fall speed
        window.tetris.Settings.blockFallSpeed = 0.1 * Math.pow(this.level, 1.5) + 3;
        window.tetris.Settings.blockFallPeriod = 1 / window.tetris.Settings.blockFallSpeed;
    }

    function createHighScore(name, score){
        var ajax = new XMLHttpRequest();
        ajax.onreadystatechange = function(){
            if(ajax.readyState==4 && ajax.status==200){
                console.log("new high score created");
            }
        };
        ajax.open("POST", "http://ambrosemcjunkin.com/ajax/tetris/createHighScore", false);
        ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        var postData = encodeURIComponent(JSON.stringify({name: name, score: score}));
        ajax.send("data=" + postData);
    }

    function getHighScores(){
        var thisObj = this;
        var ajax = new XMLHttpRequest();
        ajax.onreadystatechange = function(){
            if(ajax.readyState==4 && ajax.status==200){
                thisObj.highScores = JSON.parse(ajax.responseText);
            }
        };
        ajax.open("GET", "http://ambrosemcjunkin.com/ajax/tetris/getHighScores", false);
        ajax.send();
    }

    function isScoreHighScore(score){
        var isHighScore = false;
        if(this.highScores == null || this.highScores.length < 3){
            isHighScore = true;
        }else{
            for(var hsi = 0; hsi < this.highScores.length; hsi++){
                if(score > this.highScores[hsi].score){
                    isHighScore = true;
                    break;
                }
            }
        }
        return isHighScore;
    }

    function updateLocalHighScores(name, score){
        if(this.highScores == null || this.highScores.length == 0){
            this.highScores = [{name: name, score: score}];
        }else{
            var addedToArray = false;
            for(var hsi = 0; hsi < this.highScores.length; hsi++){
                if(score > this.highScores[hsi].score){
                    this.highScores.splice(hsi, 0, {name: name, score: score});
                    addedToArray = true;
                    break;
                }
            }
            if(!addedToArray){
                this.highScores.push({name: name, score: score})
            }
            if(this.highScores.length > 3)
            {
                this.highScores.splice(3,1);
            }
        }
    }
    /* End private members */

    var GameManager = function(){
        this.canvas = null;
        this.uiCanvas = null;
        this.gameState = "init";
        this.grid = null;
        this.tetrominoQueue = null;
        this.ui = null;
        this.level = null;
        this.highScores = null;
    };

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
                this.ui.init();
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
                            getHighScores.call(this);
                            if(isScoreHighScore.call(this, this.ui.getScore())){
                                window.document.getElementById("tetris-high-score-name-input-container").style.visibility = "visible";
                                window.document.getElementById("tetris-high-score-name-input").value = "";
                                this.gameState = "wait_for_name_input";
                            }else{
                                this.gameState = "game_over";
                            }
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
            case "wait_for_name_input":
                if(this.ui.getName() != null){
                    window.document.getElementById("tetris-high-score-name-input-container").style.visibility = "hidden";
                    createHighScore.call(this, this.ui.getName(), this.ui.getScore());
                    // Update local copy of high scores with new high score
                    updateLocalHighScores.call(this, this.ui.getName(), this.ui.getScore());
                    this.gameState = "game_over";
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

        if(this.gameState == "playing" || this.gameState == "paused" || this.gameState == "wait_for_name_input"){
            this.grid.draw(this.canvas);
            this.tetrominoQueue.draw(this.uiCanvas);
            this.ui.draw();
        }else if(this.gameState == "game_over"){
            if(this.highScores != null){
                window.tetris.Graphics.drawHighScores(this.canvas, this.highScores);
            }
        }
    };

    window.tetris.GameManager = GameManager;
}());
