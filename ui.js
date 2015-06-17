if(!window.tetris){
    window.tetris = {};
}

(function(){
    var UI = function(){
        this.messageTag = window.document.getElementById("tetris-message");
    };

    UI.prototype.showMessage = function(message){
        this.messageTag.innerHTML = message;
    };

    window.tetris.UI = new UI();
}());
