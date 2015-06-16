if(!window.tetris){
    window.tetris = {};
}

window.onload = function(){
    // Setup polyfill for window.requestAnimationFrame
    (function() {
        var lastTime = 0;

        function requestAnimPolyfill(func) {
            var currTime = (new Date()).getTime();
            var timeToWait = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { func(currTime + timeToWait); }, timeToWait);
            lastTime = currTime + timeToWait;
            return id;
        }

        window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || requestAnimPolyfill;
    })();

    // Setup and kick off game driver
    (function () {
        var Driver = function () {
            this.lastUpdate = 0;
            this.framePeriod = (1 / window.tetris.Settings.targetFps) * 1000;
            this.gameManager = new window.tetris.GameManager();
            this.gameUI = new window.tetris.UI();
        };

        Driver.prototype.loop = function (currTime) {
            if(currTime - this.lastUpdate > this.framePeriod){
                this.gameManager.update();
                this.gameManager.draw();
                this.lastUpdate = currTime;
            }

            var thisObj = this;
            window.requestAnimationFrame(function(){
                Driver.prototype.loop.apply(thisObj, arguments);
            });
        };

        window.tetris.Driver = new Driver();
        window.tetris.Driver.loop(0);
    }());
}