if(!window.tetris){
    window.tetris = {};
}

(function(){
    /* Private members */
    function init(){
        this.queue = [];
        this.queue.push(new window.tetris.Tetromino(this.grid));
    }
    /* End private members */

    var TetrominoQueue = function(grid){
        this.grid = grid;
        this.queue = null;

        init.call(this);
    };

    TetrominoQueue.prototype.getNext = function(){
        this.queue.push(new window.tetris.Tetromino(this.grid));
        return this.queue.shift();
    };

    TetrominoQueue.prototype.draw = function(canvas){
        // Draw tetrominos in queue
        if(this.queue.length == 0){
            throw "no tetrominos in queue to draw";
        }
        var tetromino = this.queue[0];
        window.tetris.Graphics.drawTetrominoCenteredInCanvas(canvas, tetromino);
    };

    window.tetris.TetrominoQueue = TetrominoQueue;
}());