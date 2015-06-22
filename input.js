if(!window.tetris){
    window.tetris = {};
}

(function(){
    var keys = {
        "Down": {keyCode: 40, isDown: false, pressCount: 0, releaseCount: 0},
        "Z": {keyCode: 90, isDown: false, pressCount: 0, releaseCount: 0},
        "X": {keyCode: 88, isDown: false, pressCount: 0, releaseCount: 0},
        "Left": {keyCode: 37, isDown: false, pressCount: 0, releaseCount: 0},
        "Right": {keyCode: 39, isDown: false, pressCount: 0, releaseCount: 0},
        "Space": {keyCode: 32, isDown: false, pressCount: 0, releaseCount: 0}
    };

    function toggleKey(event, isDown){
        var recognizedKey = false;
        if (event.defaultPrevented) {
            return; // Should do nothing if the key event was already consumed.
        }

        if (event.key !== undefined && keys[event.key] !== undefined){
            recognizedKey = true;
            keys[event.key].isDown = isDown;
            if(isDown){
                keys[event.key].pressCount++;
            }else{
                keys[event.key].releaseCount++;
            }
        } else if (event.keyIdentifier !== undefined && keys[event.keyIdentifier] !== undefined){
            recognizedKey = true;
            keys[event.keyIdentifier].isDown = isDown;
            if(isDown){
                keys[event.keyIdentifier].pressCount++;
            }else{
                keys[event.keyIdentifier].releaseCount++;
            }
        } else if (event.keyCode !== undefined){
            for(var key in keys){
                if(keys.hasOwnProperty(key)){
                    if(keys[key].keyCode == event.keyCode){
                        recognizedKey = true;
                        keys[key].isDown = isDown;
                        if(isDown){
                            keys[key].pressCount++;
                        }else{
                            keys[key].releaseCount++;
                        }
                        break;
                    }
                }
            }
        }

        if(recognizedKey){
            event.preventDefault();
        }
    }

    function onKeyDown(event){
        toggleKey(event, true);
    }

    function onKeyUp(event){
        toggleKey(event, false);
    }

    var Input = function(){
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);
    };

    Input.prototype.isKeyDown = function(key){
        if(!keys[key]){
            throw "unrecognized key";
        }
        return keys[key].isDown;
    };

    Input.prototype.getPressCount = function(key){
        if(!keys[key]){
            throw "unrecognized key";
        }
        return keys[key].pressCount;
    };

    Input.prototype.clearPressCount = function(key){
        if(!keys[key]){
            throw "unrecognized key";
        }
        keys[key].pressCount = 0;
    };

    Input.prototype.getReleaseCount = function(key){
        if(!keys[key]){
            throw "unrecognized key";
        }
        return keys[key].releaseCount;
    };

    Input.prototype.clearReleaseCount = function(key){
        if(!keys[key]){
            throw "unrecognized key";
        }
        keys[key].releaseCount = 0;
    };

    window.tetris.Input = new Input();
}());