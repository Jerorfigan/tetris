if(!window.tetris){
    window.tetris = {};
}

(function(){
    /* Private members */
    function getGridDrawWidth(){
        var gridBlockDrawWidth = window.tetris.Settings.gridBlockDrawWidth;
        var gridBlockOutlineWidth = window.tetris.Settings.gridBlockOutlineWidth;
        var gridOutlineDrawWidth = window.tetris.Settings.gridOutlineDrawWidth;

        return window.tetris.Settings.gridWidth * (gridBlockDrawWidth + gridBlockOutlineWidth) + gridBlockOutlineWidth + 2 * gridOutlineDrawWidth;
    }

    function getGridDrawHeight(){
        var gridBlockDrawHeight = window.tetris.Settings.gridBlockDrawHeight;
        var gridBlockOutlineWidth = window.tetris.Settings.gridBlockOutlineWidth;
        var gridOutlineDrawWidth = window.tetris.Settings.gridOutlineDrawWidth;

        return window.tetris.Settings.gridHeight * (gridBlockDrawHeight + gridBlockOutlineWidth) + gridBlockOutlineWidth + 2 * gridOutlineDrawWidth;
    }

    /* End private members */
    var Graphics = function(){

    };

    Graphics.prototype.gameSpace2RenderSpace = function(point){
        var gridBlockDrawWidth = window.tetris.Settings.gridBlockDrawWidth;
        var gridBlockDrawHeight = window.tetris.Settings.gridBlockDrawHeight;
        var gridBlockOutlineWidth = window.tetris.Settings.gridBlockOutlineWidth;
        var gridOutlineDrawWidth = window.tetris.Settings.gridOutlineDrawWidth;
        var gridDrawWidth = getGridDrawWidth();
        var gridDrawHeight = getGridDrawHeight();
        var canvasWidth = window.tetris.Settings.canvasWidth;
        var canvasHeight = window.tetris.Settings.canvasHeight;

        return {
            x: point.x * (gridBlockDrawWidth + gridBlockOutlineWidth) +
            gridBlockOutlineWidth +
            gridBlockDrawWidth/2 +
            gridOutlineDrawWidth +
            (canvasWidth - gridDrawWidth) / 2,
            y: point.y * (gridBlockDrawHeight + gridBlockOutlineWidth) +
            gridBlockOutlineWidth +
            gridBlockDrawHeight/2 +
            gridOutlineDrawWidth +
            (canvasHeight - gridDrawHeight) / 2
        };
    };

    Graphics.prototype.drawGrid = function(canvas){
        var ctx2d = canvas.getContext("2d");
        var gridDrawWidth = getGridDrawWidth();
        var gridDrawHeight = getGridDrawHeight();

        ctx2d.save();
        ctx2d.translate(canvas.width/2, canvas.height/2);
        ctx2d.strokeStyle = window.tetris.Settings.gridOutlineColor;
        ctx2d.lineWidth = window.tetris.Settings.gridOutlineDrawWidth;
        ctx2d.strokeRect(-gridDrawWidth/2,-gridDrawHeight/2,gridDrawWidth,gridDrawHeight);
        ctx2d.restore();
    };

    Graphics.prototype.drawBlock = function(canvas, point, color){
        var ctx2d = canvas.getContext("2d");
        var gridBlockDrawWidth = window.tetris.Settings.gridBlockDrawWidth;
        var gridBlockDrawHeight = window.tetris.Settings.gridBlockDrawHeight;
        var gridBlockOutlineWidth = window.tetris.Settings.gridBlockOutlineWidth;
        var gridBlockInsetWidth = window.tetris.Settings.gridBlockInsetWidth;

        ctx2d.save();
        ctx2d.translate(point.x, point.y);
        ctx2d.fillStyle = color.fill;
        ctx2d.strokeStyle = window.tetris.Settings.gridBlockOutlineColor;
        ctx2d.lineWidth = gridBlockOutlineWidth;
        // Draw square
        ctx2d.fillRect(-gridBlockDrawWidth/2, -gridBlockDrawHeight/2, gridBlockDrawWidth, gridBlockDrawHeight);
        // Draw square outline
        ctx2d.strokeRect(-gridBlockDrawWidth/2 - gridBlockOutlineWidth/2, -gridBlockDrawHeight/2 - gridBlockOutlineWidth/2,
            gridBlockDrawWidth + gridBlockOutlineWidth,
            gridBlockDrawHeight + gridBlockOutlineWidth);
        // Draw square outset
        ctx2d.strokeStyle = color.outset;
        ctx2d.strokeRect(-gridBlockDrawWidth/2 + gridBlockInsetWidth/2, -gridBlockDrawHeight/2 + gridBlockInsetWidth/2,
            gridBlockDrawWidth - gridBlockInsetWidth,
            gridBlockDrawHeight - gridBlockInsetWidth);
        // Draw square inset
        ctx2d.beginPath();
        ctx2d.moveTo(-gridBlockDrawWidth/2, -gridBlockDrawHeight/2);
        ctx2d.lineTo(gridBlockDrawWidth/2, -gridBlockDrawHeight/2);
        ctx2d.lineTo(gridBlockDrawWidth/2, gridBlockDrawHeight/2);
        ctx2d.closePath();
        ctx2d.clip();
        ctx2d.strokeStyle = color.inset;
        ctx2d.strokeRect(-gridBlockDrawWidth/2 + gridBlockInsetWidth/2, -gridBlockDrawHeight/2 + gridBlockInsetWidth/2,
            gridBlockDrawWidth - gridBlockInsetWidth,
            gridBlockDrawHeight - gridBlockInsetWidth);
        ctx2d.restore();
    };

    Graphics.prototype.drawTetrominoCenteredInCanvas = function(canvas, tetromino){
        // Convert tetromino points to render points and find the lower and upper
        // x and y bounds
        var points = tetromino.getPoints();
        var renderPoints = [];
        var xMin = null, xMax = null, yMin = null, yMax = null;
        for(var i = 0; i < points.length; i++){
            var renderPoint = this.gameSpace2RenderSpace(points[i]);
            if(xMin == null || renderPoint.x < xMin) xMin = renderPoint.x;
            if(yMin == null || renderPoint.y < yMin) yMin = renderPoint.y;
            if(xMax == null || renderPoint.x > xMax) xMax = renderPoint.x;
            if(yMax == null || renderPoint.y > yMax) yMax = renderPoint.y;
            renderPoints.push(renderPoint);
        }
        // Derive the center point for the tetromino as the average of the lower and upper bounds
        var centerRefPoint = {x: (xMax - xMin)/2 + xMin, y: (yMax - yMin)/2 + yMin};
        // Derive the offset from the center point for each render point
        var offsetsFromCenterRefPoint = [];
        for(var i = 0; i < renderPoints.length; i++){
            offsetsFromCenterRefPoint.push(
                {
                    x: renderPoints[i].x - centerRefPoint.x,
                    y: renderPoints[i].y - centerRefPoint.y
                });
        }
        // Finally derive the final render point as the center of the canvas + the offset
        var canvasCenterPoint = {x: canvas.width/2, y: canvas.height/2};
        var finalRenderPoints = [];
        for(var i = 0; i < offsetsFromCenterRefPoint.length; i++){
            finalRenderPoints.push(
                {
                    x: offsetsFromCenterRefPoint[i].x + canvasCenterPoint.x,
                    y: offsetsFromCenterRefPoint[i].y + canvasCenterPoint.y
                });
        }

        for(var i = 0; i < finalRenderPoints.length; i++){
            this.drawBlock(canvas, finalRenderPoints[i], tetromino.getColor());
        }
    };

    window.tetris.Graphics = new Graphics();
}());
