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
        var linesCleared = 0;
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

            // Check if we're about to do a line clear and fire event
            if(this.rowStats[targetRow].blocksFilled == this.width){
                linesCleared++;
                window.tetris.EventManager.fire("LineCleared", {prevLinesCleared: linesCleared - 1});
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
            onBeforeBlockDestroy.call(this, this.collisionGrid[col][target]);
            this.collisionGrid[col][target] = null;
        }
        this.rowStats[target].blocksFilled = 0;
    }

    function copyRow(dest, source){
        for(var col = 0; col < this.width; col++){
            onBeforeBlockDestroy.call(this, this.collisionGrid[col][dest]);
            onBeforeBlockMove.call(this, this.collisionGrid[col][source], {x: col, y: dest});
            this.collisionGrid[col][dest] = this.collisionGrid[col][source];
            this.collisionGrid[col][source] = null;
        }
        this.rowStats[dest].blocksFilled = this.rowStats[source].blocksFilled;
        this.rowStats[source].blocksFilled = 0;
    }

    function onBeforeBlockMove(block, dest){
        if(block != null){
            block.x = dest.x;
            block.y = dest.y;
        }
    }

    function onBeforeBlockDestroy(block){
        if(block == null) return;

        // Check if a block segment is being split, in which case we need to generate a new segment id
        // for the blocks constituting one side of the split segment
        var blockSegment = getBlockSegment.call(this, block);
        var newSegmentId = this.blockSegmentIDCounter++;
        for(var bii = 0; bii < blockSegment.blockIds.length; bii++){
            var otherBlockInSegment = this.blocks[blockSegment.blockIds[bii]];
            if(otherBlockInSegment.id == block.id) continue;
            // Assign all blocks in this block's segment below this block a new segment ID in preparation for the
            // split
            if(otherBlockInSegment.y > block.y){
                otherBlockInSegment.segmentId = newSegmentId;
            }
        }

        // Remove block from blocks hash
        delete this.blocks[block.id];
    }

    // Convert tetromino to block segment stored in grid
    function absorbTetromino(){
        var id = this.blockSegmentIDCounter++;
        var points = this.playerControlledTetromino.getPoints();
        var color = this.playerControlledTetromino.getColor();
        for(var pi = 0; pi < points.length; pi++){
            var point = points[pi];
            var block = {
                color: color,
                id: this.blockIDCounter++,
                segmentId: id,
                x: point.x,
                y: point.y
            };
            // For convenience, enable accessing block via grid or ID
            this.collisionGrid[block.x][block.y] = block;
            this.blocks[block.id] = block;
            // Update row stats
            this.rowStats[block.y].blocksFilled++;
        }
    }

    function getBlockSegment(block){
        // Build the block segment by finding all blocks in this segment
        var blocks = [];
        var searchQueue = [block];
        // Init blocks to be empty
        // Populate searchQueue with block
        // While searchQueue is not empty
            // Pop front of searchQueue and call it X
                // If segment id of X matches segment id of block
                    // If id of X not in blocks
                        // Add id of X to blocks
                        // Add adjacent blocks to searchQueue

        while(searchQueue.length > 0){
            var X = searchQueue.shift();
            if(X.segmentId == block.segmentId){
                if(blocks.indexOf(X.id) == -1){
                    blocks.push(X.id);
                    var adjacencyOffsets = [{x: 1, y: 0}, {x: 0, y: 1}, {x: -1, y: 0}, {x: 0, y: -1}];
                    for(var aoi = 0; aoi < adjacencyOffsets.length; aoi++){
                        var nextPoint = {x: X.x + adjacencyOffsets[aoi].x, y: X.y + adjacencyOffsets[aoi].y};
                        if (!isPointOutsideGrid(nextPoint) && this.collisionGrid[nextPoint.x][nextPoint.y] != null) {
                            searchQueue.push(
                                this.collisionGrid[nextPoint.x][nextPoint.y]
                            );
                        }
                    }
                }
            }
        }

        return {
            blockIds: blocks,
            id: block.segmentId
        };
    }

    function canBlockSegmentFall(blockSegment){
        var canFall = true;

        // Identify blocks in block segment with greatest y extent
        var minYs = {};
        for(var bii = 0; bii < blockSegment.blockIds.length; bii++){
            var block = this.blocks[blockSegment.blockIds[bii]];
            if(minYs[block.x] == null || (block.y > minYs[block.x].val)){
                minYs[block.x] = {block: block, val: block.y};
            }
        }
        // For each lowest block, check if the square beneath it is empty. If any are outside grid or not empty, the blockSegment cannot fall.
        for(var key in minYs){
            if (minYs.hasOwnProperty(key)) {
                var lowestBlock = minYs[key].block;
                var pointBelow = {x: lowestBlock.x, y: lowestBlock.y + 1};
                if(isPointOutsideGrid(pointBelow) || this.collisionGrid[pointBelow.x][pointBelow.y] != null){
                    canFall = false;
                    break;
                }
            }
        }

        return canFall;
    }

    function applyGravityToBlockSegment(blockSegment){
        this.timeUntilGravityUpdateInSeconds -= window.tetris.Settings.targetFramePeriodInSeconds;
        if(this.timeUntilGravityUpdateInSeconds <= 0){
            var blocksToUpdate = [];
            for(var bii = 0; bii < blockSegment.blockIds.length; bii++){
                var block = this.blocks[blockSegment.blockIds[bii]];
                blocksToUpdate.push(block);
            }
            // Need to sort by Y coord descending, to prevent corrupting collision grid
            blocksToUpdate.sort(function(a, b){
                if(a.y > b.y){
                    return -1;
                }else if (b.y > a.y){
                    return 1;
                }else{
                    return 0;
                }
            });
            for(var bi = 0; bi < blocksToUpdate.length; bi++){
                var blockToUpdate = blocksToUpdate[bi];
                // Update collision grid
                this.collisionGrid[blockToUpdate.x][blockToUpdate.y + 1] = blockToUpdate;
                this.rowStats[blockToUpdate.y + 1].blocksFilled++;
                this.collisionGrid[blockToUpdate.x][blockToUpdate.y] = null;
                this.rowStats[blockToUpdate.y].blocksFilled = Math.max(0, this.rowStats[blockToUpdate.y].blocksFilled - 1);
                blockToUpdate.y += 1;
            }
            this.timeUntilGravityUpdateInSeconds = window.tetris.Settings.blockFallPeriod;
        }
    }

    function getUnstableBlockSegments(){
        // Because the relationship between grid squares and block segments is many to one, we need to keep track of processed
        // block segments by hashing their IDs so that we don't process them twice.
        var unstableBlockSegments = [];
        var processedBlockSegments = {};
        for(var col = 0; col < this.width; col++){
            for(var row = this.height - 1; row >= 0; row--){
                // Is there a block in this square?
                if(this.collisionGrid[col][row] != null){
                    var blockSegment = getBlockSegment.call(this, this.collisionGrid[col][row]);
                    // If we haven't processed block segment before and it can fall
                    if(
                        processedBlockSegments[blockSegment.id] == undefined &&
                        canBlockSegmentFall.call(this, blockSegment)
                    ){
                        unstableBlockSegments.push(blockSegment);
                    }
                    processedBlockSegments[blockSegment.id] = 1;
                }
            }
        }

        return unstableBlockSegments;
    }
    /* End private functions */

    /* Constructor */
    var Grid = function(width, height){
        this.width = width;
        this.height = height;
        this.playerControlledTetromino = null;
        this.collisionGrid = null;
        this.blocks = {};
        this.rowStats = null;
        this.gridState = "stable";
        this.blockIDCounter = 1;
        this.blockSegmentIDCounter = 1;
        this.timeUntilGravityUpdateInSeconds = window.tetris.Settings.blockFallPeriod;

        initCollisionGrid.call(this);
        initRowStats.call(this);
    };

    Grid.prototype.update = function(){
        switch(this.gridState){
            case "stable":
                // When the grid is stable, we are simply updating the player controlled tetromino if there is one.
                // Once the player controlled tetromino is stationary, we absorb it into the grid (thus becoming a
                // block segment) and resolve row clears. If gravity is turned on, we transition to the
                // "unstable" state, otherwise we stay in "stable".
                if(this.playerControlledTetromino != null){
                    this.playerControlledTetromino.update();
                    if(this.playerControlledTetromino.isStationary()){
                        window.tetris.EventManager.fire("BlockPlaced");
                        absorbTetromino.call(this);
                        this.playerControlledTetromino = null;
                        resolveRowClears.call(this);
                        if(window.tetris.Settings.gridApplyGravity){
                            this.gridState = "unstable";
                        }
                    }
                }
                break;
            case "unstable":
                // This case applies gravity to block segments. Check if any block segments can fall and, if so, update them.
                // Once we've identified that no block segments can fall, transition to "stable" state.
                var unstableBlockSegments = getUnstableBlockSegments.call(this);
                for(var ubsi = 0; ubsi < unstableBlockSegments.length; ubsi++){
                    applyGravityToBlockSegment.call(this, unstableBlockSegments[ubsi]);
                }

                if(unstableBlockSegments == 0){
                    resolveRowClears.call(this);
                    unstableBlockSegments = getUnstableBlockSegments.call(this);
                    if(unstableBlockSegments.length == 0){
                        this.gridState = "stable";
                    }
                }
                break;
            default:
                throw "Unknown state";
        }
    };

    Grid.prototype.spawnTetromino = function(tetromino){
        if(!this.areGridSquaresEmpty(tetromino.getPoints())){
            throw "GRID IS FULL";
        }
        this.playerControlledTetromino = tetromino;
    };

    Grid.prototype.isReadyToSpawnBlock = function(){
        return this.gridState == "stable" && this.playerControlledTetromino == null;
    };

    Grid.prototype.draw = function(canvas){
        // Draw grid
        window.tetris.Graphics.drawGrid(canvas);

        // Draw falling tetromino
        if(this.playerControlledTetromino){
            this.playerControlledTetromino.draw(canvas);
        }

        // Draw blocks in collision grid
        for(var col = 0; col < this.width; col++){
            for(var row = 0; row < this.height; row++){
                var block = this.collisionGrid[col][row];
                if(block != null){
                    window.tetris.Graphics.drawBlock(
                        canvas,
                        window.tetris.Graphics.gameSpace2RenderSpace({x: block.x, y: block.y}),
                        block.color);
                }
            }
        }
    };

    Grid.prototype.reset = function(){
        this.playerControlledTetromino = null;
        this.collisionGrid = null;
        this.blocks = {};
        this.rowStats = null;
        this.gridState = "stable";
        this.blockIDCounter = 1;
        this.blockSegmentIDCounter = 1;

        initCollisionGrid.call(this);
        initRowStats.call(this);
    };

    Grid.prototype.areAnyPointsOutsideGrid = function(points){
        var pointsOutsideGrid = false;
        for(var pi = 0; pi < points.length; pi++){
            if(isPointOutsideGrid.call(this, points[pi])){
                pointsOutsideGrid = true;
                break;
            }
        }
        return pointsOutsideGrid;
    };

    Grid.prototype.areGridSquaresEmpty = function(points){
        var gridSquaresEmpty = true;
        for(var pi = 0; pi < points.length; pi++){
            if(this.collisionGrid[points[pi].x][points[pi].y] != null){
                gridSquaresEmpty = false;
                break;
            }
        }
        return gridSquaresEmpty;
    };

    window.tetris.Grid = Grid;
}());