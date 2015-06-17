if(!window.tetris){
    window.tetris = {};
}
(function(){
    /* Private functions */
    function initCollisionGrid(){
        this.collisionGrid = [];
        for(var col = 0; col < this.width; col++){
            var data = [];
            for(var i = 0; i < this.height; i++){
                data.push(null);
            }
            this.collisionGrid[col] = data;
        }
    }

    function updateCollisionGrid(block){
        var points = block.getPoints();
        for(var i = 0; i < points.length; i++){
            this.collisionGrid[points[i].x][points[i].y] = block;
        }
    }

    function areAnyPointsOccupiedInCollisionGrid(points){
        var oneOrMorePointsAreOccupied = false;
        for(var i = 0; i < points.length; i++){
            oneOrMorePointsAreOccupied = oneOrMorePointsAreOccupied || isPointOccupiedInCollisionGrid.call(this, points[i]);
            if(oneOrMorePointsAreOccupied){
                break;
            }
        }
        return oneOrMorePointsAreOccupied;
    }

    function areAnyPointsOutsideGrid(points){
        var oneOrMorePointsAreOutsideGrid = false;
        for(var i = 0; i < points.length; i++){
            oneOrMorePointsAreOutsideGrid = oneOrMorePointsAreOutsideGrid || isPointOutsideGrid.call(this, points[i]);
            if(oneOrMorePointsAreOutsideGrid){
                break;
            }
        }
        return oneOrMorePointsAreOutsideGrid;
    }

    function isPointOccupiedInCollisionGrid(point){
        return this.collisionGrid[point.x][point.y] != null;
    }

    function isPointOutsideGrid(point){
        return point.x >= window.tetris.Settings.gridWidth ||
               point.x < 0 ||
               point.y >= window.tetris.Settings.gridHeight ||
               point.y < 0;
    }
    /* End private functions */

    /* Constructor */
    var Grid = function(width, height){
        this.width = width;
        this.height = height;
        this.fallingBlock = null;
        this.collisionGrid = null;

        initCollisionGrid.call(this);
    };

    Grid.prototype.update = function(){
        // Resolve falling block if there is one
        if(this.fallingBlock){
            // Apply rotation to falling block
            var state = this.fallingBlock.getState();
            this.fallingBlock.applyRotation();
            if(
                areAnyPointsOccupiedInCollisionGrid.call(this, this.fallingBlock.getPoints()) ||
                areAnyPointsOutsideGrid.call(this, this.fallingBlock.getPoints())
            ){
                // Rotation resulted in invalid position, reset block state
                this.fallingBlock.resetState(state);
            }

            // Apply down force to falling block
            state = this.fallingBlock.getState();
            this.fallingBlock.applyDownForce();
            if(
                areAnyPointsOccupiedInCollisionGrid.call(this, this.fallingBlock.getPoints()) ||
                areAnyPointsOutsideGrid.call(this, this.fallingBlock.getPoints())
            ){
                // Down force resulted in invalid position, reset block state
                this.fallingBlock.resetState(state);
            }

            // Apply gravity to falling block
            state = this.fallingBlock.getState();
            this.fallingBlock.applyGravity();
            if(
                areAnyPointsOccupiedInCollisionGrid.call(this, this.fallingBlock.getPoints()) ||
                areAnyPointsOutsideGrid.call(this, this.fallingBlock.getPoints())
            ){
                // Gravity caused block collision, reset block state
                this.fallingBlock.resetState(state);
                // Update collision grid
                updateCollisionGrid.call(this, this.fallingBlock);
                this.fallingBlock = null;
                // TODO Check for and perform row clears
            }
        }
    };

    Grid.prototype.spawnBlock = function(){
        this.fallingBlock = new window.tetris.Block();
    };

    // An invalid state is a state where the falling block is in a collision
    Grid.prototype.isInValidState = function(){
        return !this.fallingBlock || !areAnyPointsOccupiedInCollisionGrid.call(this, this.fallingBlock.getPoints());
    };

    Grid.prototype.isActive = function(){
        return !!this.fallingBlock;
    };

    Grid.prototype.draw = function(canvas){
        // Draw grid
        this.drawGrid(canvas);

        // Draw falling block
        if(this.fallingBlock){
            var points = this.fallingBlock.getPoints();
            for(var i = 0; i < points.length; i++){
                this.drawSqr(canvas, {x: points[i].x, y: points[i].y}, this.fallingBlock.getColor());
            }
        }

        // Draw blocks in collision grid
        for(var col = 0; col < this.width; col++){
            for(var row = 0; row < this.height; row++){
                if(this.collisionGrid[col][row]){
                    this.drawSqr(canvas, {x: col, y: row}, this.collisionGrid[col][row].getColor());
                }
            }
        }
    };

    Grid.prototype.drawGrid = function(canvas){
        var ctx2d = canvas.getContext("2d");
        var gridBlockDrawWidth = window.tetris.Settings.gridBlockDrawWidth;
        var gridBlockDrawHeight = window.tetris.Settings.gridBlockDrawHeight;
        var gridDrawWidth = this.width * gridBlockDrawWidth;
        var gridDrawHeight = this.height * gridBlockDrawHeight;

        ctx2d.save();
        ctx2d.translate(canvas.width/2, canvas.height/2);
        ctx2d.strokeStyle = window.tetris.Settings.gridLineStrokeColor;
        ctx2d.lineWidth = window.tetris.Settings.gridLineDrawWidth;

        for(var x = -gridDrawWidth/2; x < gridDrawWidth/2; x += gridBlockDrawWidth){
            for(var y = -gridDrawHeight/2; y < gridDrawHeight/2; y += gridBlockDrawHeight){
                ctx2d.strokeRect(x,y,gridBlockDrawWidth,gridBlockDrawHeight);
            }
        }

        ctx2d.restore();
    };

    Grid.prototype.drawSqr = function(canvas, point, color){
        var ctx2d = canvas.getContext("2d");
        var gridBlockDrawWidth = window.tetris.Settings.gridBlockDrawWidth;
        var gridBlockDrawHeight = window.tetris.Settings.gridBlockDrawHeight;
        var gridDrawWidth = this.width * gridBlockDrawWidth;
        var gridDrawHeight = this.height * gridBlockDrawHeight;
        var gridLineDrawWidth = window.tetris.Settings.gridLineDrawWidth;

        ctx2d.save();
        ctx2d.translate(canvas.width/2 - gridDrawWidth/2, canvas.height/2 - gridDrawHeight/2);
        ctx2d.fillStyle = color;
        ctx2d.fillRect(point.x * gridBlockDrawWidth + gridLineDrawWidth/2,
            point.y * gridBlockDrawHeight + gridLineDrawWidth/2,
            gridBlockDrawWidth - gridLineDrawWidth,
            gridBlockDrawHeight - gridLineDrawWidth);
        ctx2d.restore();
    };

    window.tetris.Grid = Grid;
}());