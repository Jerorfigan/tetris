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

    function initRowStats(){
        this.rowStats = [];

        for(var row = 0; row < this.height; row++){
            this.rowStats.push({blocksFilled: 0});
        }
    }

    function updateCollisionGrid(block){
        var points = block.getPoints();
        for(var i = 0; i < points.length; i++){
            this.collisionGrid[points[i].x][points[i].y] = block;
            this.rowStats[points[i].y].blocksFilled++;
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

    function resolveRowClears(){
        // While there are still valid rows to check
            // Find next full or empty row from bottom and label this A
            // Find next partially filled row and label this B
            // If we found a partially filled row
                // Replace A with B
            // Else
                // Clear A
                // Decrement row
        var targetRow = this.height - 1;
        var nextPartiallyFilledRow = null;
        while(true){
            // Find next filled or empty row
            while(
                targetRow >= 0 &&
                this.rowStats[targetRow].blocksFilled != this.width && // Not full
                this.rowStats[targetRow].blocksFilled != 0 // Not empty
            ){
                targetRow--;
            }
            // No more rows to check
            if(targetRow < 0) return;

            // Find next partially filled row to swap into the filled/empty row
            if(!nextPartiallyFilledRow){
                nextPartiallyFilledRow = targetRow - 1;
            }
            while(
                nextPartiallyFilledRow >= 0 &&
                (this.rowStats[nextPartiallyFilledRow].blocksFilled == this.width || // Is full
                 this.rowStats[nextPartiallyFilledRow].blocksFilled == 0) // Is empty
            ){
                nextPartiallyFilledRow--;
            }

            // If we found a next partially filled row, copy that row into target
            if(nextPartiallyFilledRow >= 0){
                copyRow.call(this, targetRow, nextPartiallyFilledRow);
            }else{
                // Otherwise just clear target if nonempty and go to next row
                if(this.rowStats[targetRow].blocksFilled != 0){
                    clearRow.call(this, targetRow);
                }
                targetRow--;
            }
        }
    }

    function clearRow(target){
        for(var col = 0; col < this.width; col++){
            this.collisionGrid[col][target] = null;
        }
        this.rowStats[target].blocksFilled = 0;
    }

    function copyRow(dest, source){
        for(var col = 0; col < this.width; col++){
            this.collisionGrid[col][dest] = this.collisionGrid[col][source];
            this.collisionGrid[col][source] = null;
        }
        this.rowStats[dest].blocksFilled = this.rowStats[source].blocksFilled;
        this.rowStats[source].blocksFilled = 0;
    }
    /* End private functions */

    /* Constructor */
    var Grid = function(width, height){
        this.width = width;
        this.height = height;
        this.fallingBlock = null;
        this.collisionGrid = null;
        this.rowStats = null;

        initCollisionGrid.call(this);
        initRowStats.call(this);
    };

    Grid.prototype.update = function(){
        // Resolve falling block if there is one
        if(this.fallingBlock){
            // Apply rotation to falling block
            var state = this.fallingBlock.getState();
            this.fallingBlock.applyRotation();
            if(
                areAnyPointsOutsideGrid.call(this, this.fallingBlock.getPoints()) ||
                areAnyPointsOccupiedInCollisionGrid.call(this, this.fallingBlock.getPoints())
            ){
                // Rotation resulted in invalid position, reset block state
                this.fallingBlock.setState(state);
            }

            // Apply horizontal force to falling block
            state = this.fallingBlock.getState();
            this.fallingBlock.applyHorizontalForce();
            if(
                areAnyPointsOutsideGrid.call(this, this.fallingBlock.getPoints()) ||
                areAnyPointsOccupiedInCollisionGrid.call(this, this.fallingBlock.getPoints())
            ){
                // Horizontal force resulted in invalid position, reset block state
                this.fallingBlock.setState(state);
            }

            // Apply down force to falling block
            state = this.fallingBlock.getState();
            this.fallingBlock.applyDownForce();
            if(
                areAnyPointsOutsideGrid.call(this, this.fallingBlock.getPoints()) ||
                areAnyPointsOccupiedInCollisionGrid.call(this, this.fallingBlock.getPoints())
            ){
                // Down force resulted in invalid position, reset block state
                this.fallingBlock.setState(state);
            }

            // Apply gravity to falling block
            state = this.fallingBlock.getState();
            this.fallingBlock.applyGravity();
            if(
                areAnyPointsOutsideGrid.call(this, this.fallingBlock.getPoints()) ||
                areAnyPointsOccupiedInCollisionGrid.call(this, this.fallingBlock.getPoints())
            ){
                // Gravity caused block collision, reset block state
                this.fallingBlock.setState(state);
                // Update collision grid
                updateCollisionGrid.call(this, this.fallingBlock);
                this.fallingBlock = null;
                resolveRowClears.call(this);
            }
        }
    };

    Grid.prototype.spawnBlock = function(block){
        this.fallingBlock = block;
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

    Grid.prototype.reset = function(){
        this.fallingBlock = null;
        this.collisionGrid = null;
        this.rowStats = null;

        initCollisionGrid.call(this);
        initRowStats.call(this);
    };

    Grid.prototype.drawGrid = function(canvas){
        var ctx2d = canvas.getContext("2d");
        var gridBlockDrawWidth = window.tetris.Settings.gridBlockDrawWidth;
        var gridBlockDrawHeight = window.tetris.Settings.gridBlockDrawHeight;
        var gridBlockOutlineWidth = window.tetris.Settings.gridBlockOutlineWidth;
        var gridOutlineDrawWidth = window.tetris.Settings.gridOutlineDrawWidth;
        var gridDrawWidth =
            this.width * gridBlockDrawWidth +
            this.width * gridBlockOutlineWidth + gridBlockOutlineWidth
            + gridOutlineDrawWidth;
        var gridDrawHeight =
            this.height * gridBlockDrawHeight +
            this.height * gridBlockOutlineWidth + gridBlockOutlineWidth
            + gridOutlineDrawWidth;

        ctx2d.save();
        ctx2d.translate(canvas.width/2, canvas.height/2);
        ctx2d.strokeStyle = window.tetris.Settings.gridOutlineColor;
        ctx2d.lineWidth = gridOutlineDrawWidth;

        /*for(var x = -gridDrawWidth/2; x < gridDrawWidth/2; x += gridBlockDrawWidth){
            for(var y = -gridDrawHeight/2; y < gridDrawHeight/2; y += gridBlockDrawHeight){
                ctx2d.strokeRect(x,y,gridBlockDrawWidth,gridBlockDrawHeight);
            }
        }*/
        // Just draw outline
        ctx2d.strokeRect(-gridDrawWidth/2,-gridDrawHeight/2,gridDrawWidth,gridDrawHeight);

        ctx2d.restore();
    };

    Grid.prototype.drawSqr = function(canvas, point, color){
        var ctx2d = canvas.getContext("2d");
        var gridBlockDrawWidth = window.tetris.Settings.gridBlockDrawWidth;
        var gridBlockDrawHeight = window.tetris.Settings.gridBlockDrawHeight;
        var gridBlockOutlineWidth = window.tetris.Settings.gridBlockOutlineWidth;
        var gridOutlineDrawWidth = window.tetris.Settings.gridOutlineDrawWidth;
        var gridBlockInsetWidth = window.tetris.Settings.gridBlockInsetWidth;
        var gridDrawWidth =
            this.width * gridBlockDrawWidth +
            this.width * gridBlockOutlineWidth + gridBlockOutlineWidth
            + gridOutlineDrawWidth;
        var gridDrawHeight =
            this.height * gridBlockDrawHeight +
            this.height * gridBlockOutlineWidth + gridBlockOutlineWidth
            + gridOutlineDrawWidth;

        ctx2d.save();
        ctx2d.translate(canvas.width/2 - gridDrawWidth/2, canvas.height/2 - gridDrawHeight/2);
        ctx2d.fillStyle = color.fill;
        ctx2d.strokeStyle = window.tetris.Settings.gridBlockOutlineColor;
        ctx2d.lineWidth = gridBlockOutlineWidth;
        // Draw square
        ctx2d.fillRect(point.x * gridBlockDrawWidth + gridOutlineDrawWidth/2 + (point.x + 1) * gridBlockOutlineWidth,
            point.y * gridBlockDrawHeight + gridOutlineDrawWidth/2 + (point.y + 1) * gridBlockOutlineWidth,
            gridBlockDrawWidth,
            gridBlockDrawHeight);
        // Draw square outline
        ctx2d.strokeRect(point.x * (gridBlockDrawWidth + gridBlockOutlineWidth) + gridOutlineDrawWidth/2 + gridBlockOutlineWidth/2,
            point.y * (gridBlockDrawHeight + gridBlockOutlineWidth)  + gridOutlineDrawWidth/2 + gridBlockOutlineWidth/2,
            gridBlockDrawWidth + gridBlockOutlineWidth,
            gridBlockDrawHeight + gridBlockOutlineWidth);
        // Draw square outset
        ctx2d.strokeStyle = color.outset;
        ctx2d.strokeRect(point.x * (gridBlockDrawWidth + gridBlockOutlineWidth) + gridOutlineDrawWidth/2 + gridBlockOutlineWidth + gridBlockInsetWidth/2,
            point.y * (gridBlockDrawHeight + gridBlockOutlineWidth)  + gridOutlineDrawWidth/2 + gridBlockOutlineWidth + gridBlockInsetWidth/2,
            gridBlockDrawWidth - gridBlockInsetWidth,
            gridBlockDrawHeight - gridBlockInsetWidth);
        // Draw square inset
        ctx2d.beginPath();
        ctx2d.moveTo(
            point.x * (gridBlockDrawWidth + gridBlockOutlineWidth) + gridOutlineDrawWidth/2 + gridBlockOutlineWidth,
            point.y * (gridBlockDrawHeight + gridBlockOutlineWidth)  + gridOutlineDrawWidth/2 + gridBlockOutlineWidth);
        ctx2d.lineTo(
            point.x * (gridBlockDrawWidth + gridBlockOutlineWidth) + gridOutlineDrawWidth/2 + gridBlockOutlineWidth + gridBlockDrawWidth,
            point.y * (gridBlockDrawHeight + gridBlockOutlineWidth)  + gridOutlineDrawWidth/2 + gridBlockOutlineWidth);
        ctx2d.lineTo(
            point.x * (gridBlockDrawWidth + gridBlockOutlineWidth) + gridOutlineDrawWidth/2 + gridBlockOutlineWidth + gridBlockDrawWidth,
            point.y * (gridBlockDrawHeight + gridBlockOutlineWidth)  + gridOutlineDrawWidth/2 + gridBlockOutlineWidth + gridBlockDrawHeight);
        ctx2d.closePath();
        ctx2d.clip();
        ctx2d.strokeStyle = color.inset;
        ctx2d.strokeRect(point.x * (gridBlockDrawWidth + gridBlockOutlineWidth) + gridOutlineDrawWidth/2 + gridBlockOutlineWidth + gridBlockInsetWidth/2,
            point.y * (gridBlockDrawHeight + gridBlockOutlineWidth)  + gridOutlineDrawWidth/2 + gridBlockOutlineWidth + gridBlockInsetWidth/2,
            gridBlockDrawWidth - gridBlockInsetWidth,
            gridBlockDrawHeight - gridBlockInsetWidth);
        ctx2d.restore();
    };

    window.tetris.Grid = Grid;
}());