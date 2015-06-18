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
        if(this.queue.length == 0)
            throw "no blocks in queue to draw";
        // override block position to make sense for the ui grid, we'll reset it after
        var block = this.queue[0];
        var state = block.getState();
        block.setState({
            position: {x: 2, y: 2},
            angle: state.angle
        });
        var points = block.getPoints();
        var color = block.getColor();
        // We're reusing Grid.prototype.drawSqr here so need to setup some this variables
        this.width = window.tetris.Settings.uiGridWidth;
        this.height = window.tetris.Settings.uiGridHeight;
        for(var i = 0; i < points.length; i++){
            window.tetris.Grid.prototype.drawSqr.call(this, canvas, points[i], color);
        }
        // Reset block state since we mucked with its position
        block.setState(state);
    };

    window.tetris.BlockQueue = BlockQueue;
}());