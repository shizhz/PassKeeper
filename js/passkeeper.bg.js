(function() {
    var root = this;
    var PK_BUCKET = 'PK_BUCKET';

    var DBDriver = {
        init: function () {
            chrome.storage.sync.get(PK_BUCKET, function (result) {
                console.log('init func: ' + result[PK_BUCKET]);
                if(!result[PK_BUCKET]) {
                    chrome.storage.sync.set({ PK_BUCKET: {} }, function () {
                        console.log('PK_BUCKET INIT');
                    });
                } else {
                    console.log('DB EXISTED');
                }
            });
        },

        load: function (key) {
            console.log('load called');
        },

        contains: function (request) {
            this.load();
            console.log(request.args.key);
        }
    };

    chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
        var action = request.action;
        console.log('call to function ' + action);
        DBDriver[action] && DBDriver[action].call(DBDriver, request);
    } );

    DBDriver.init();

}).call(this);
