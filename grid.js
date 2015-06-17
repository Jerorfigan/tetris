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
                data.push(0);
            }
            this.collisionGrid[col] = data;
        }
    }

    function updateCollisionGrid(points){
        for(var i = 0; i < points.length; i++){
            this.collisionGrid[points[i].x][points[i].y] = 1;
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
        return this.collisionGrid[point.x][point.y] == 1;
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
        this.staticBlocks = [];
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
                updateCollisionGrid.call(this, this.fallingBlock.getPoints());
                // Flag falling block as a static block
                this.staticBlocks.push(this.fallingBlock);
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

    Grid.prototype.draw = function(){
        // TODO: Draw grid

        // Draw falling block
        if(this.fallingBlock){
            this.fallingBlock.draw();
        }

        // Draw static blocks
        for(var i = 0; i < this.staticBlocks.length; i++){
            this.staticBlocks[i].draw();
        }
    };

    window.tetris.Grid = Grid;
}());