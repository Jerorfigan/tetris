if(!window.tetris){
    window.tetris = {};
}

(function(){
    /* Private members */
    var eventList = [
        "GameRestart",
        "BlockPlaced",
        "LineCleared",
        "LevelChanged",
        "ShowMessage"
    ];
    var events = {};

    function validateEvent(eventName){
        if(!events[eventName]){
            throw "unrecognized event";
        }
    }

    function initEvents(){
        for(var i = 0; i < eventList.length; i++){
            events[eventList[i]] = {subscribers: []};
        }
    }
    /* End private members */
    
    var EventManager = function(){
        initEvents();
    };

    EventManager.prototype.fire = function(eventName, eventData){
        validateEvent(eventName);
        for(var i = 0; i < events[eventName].subscribers.length; i++){
            var subscriber = events[eventName].subscribers[i];
            subscriber.callback.call(subscriber.context, eventData);
        }
    };

    EventManager.prototype.subscribe = function(eventName, callback, context){
        validateEvent(eventName);
        events[eventName].subscribers.push({callback: callback, context: context});
    };

    window.tetris.EventManager = new EventManager();
}());