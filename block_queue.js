if(!window.tetris){
    window.tetris = {};
}

(function(){
    /* Private members */
    function init(){
        this.queue = [];
        this.queue.push(new window.tetris.Block());
    }
    /* End private members */

    var BlockQueue = function(){
        this.queue = null;

        init.call(this);
    };

    BlockQueue.prototype.getNext = function(){
        this.queue.push(new window.tetris.Block());
        return this.queue.shift();
    };

    BlockQueue.prototype.draw = function(canvas){
        // Draw block in queue
        if(this.queue.length == 0){
            throw "no blocks in queue to draw";
        }
        var block = this.queue[0];
        window.tetris.Graphics.drawBlockCenteredInCanvas(canvas, block);
    };

    window.tetris.BlockQueue = BlockQueue;
}());