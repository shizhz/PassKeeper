(function() {
    var root = this;
    var DEBUG = true;
    var PK_BUCKET = 'PK_BUCKET';

    var logger = function(msg) {
        if (DEBUG) {
            console.log(msg);
        }
    };

    var Util = {
        now: function() {
            var date = new Date();
            return date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
        }
    };

    function DBError(message) {
        this.name = 'DBError';
        this.message = message;
    }

    DBError.prototype = new Error();

    function DB(name) {
        this.name = name || 'PassKeeper Bucket';
        this.created = Util.now();
        this.bucket = {};
    }

    var DBDriver = {
        db: undefined,

        get: function(params) {
            var key = params.key;
            return this.db.bucket[key] || '';
        },

        size: function() {
            return this.keys().length;
        },

        keys: function() {
            return this.db ? Object.keys(this.db.bucket) : [];
        },

        contains: function(params) {
            var key = params.key;
            return this.keys().indexOf(key) >= 0;
        },

        save: function(params) {
            var key = params.key;
            var record = params.record;
            var pre = this.get(key);

            this.db.bucket[key] = record;

            return pre;
        },

        info: function() {
            var db = this.db;
            return db ? '[' + db.name + '--created at--' + db.created + ']' : '[No db existed]';
        },

        init: function() {
            var this_ = this;

            chrome.storage.sync.get(PK_BUCKET, function(result) {
                var pkdb = result[PK_BUCKET];
                console.log(pkdb);
                try {
                    pkdb = JSON.parse(pkdb);
                } catch (e) {
                    chrome.storage.sync.remove(PK_BUCKET, function() {
                        console.log('Not a JSON format, remove this one and create a new DB object');
                    });
                    pkdb = undefined;
                }

                if (!pkdb) {
                    pkdb = new DB();
                    chrome.storage.sync.set({
                        PK_BUCKET: JSON.stringify(pkdb)
                    }, function() {
                        logger('PK_BUCKET INIT: ' + pkdb.toString());
                    });
                } else {
                    logger('DB existed');
                }
                this_.db = pkdb;
            });
        },

        dispatch: function(request) {
            var response = {};
            try {
                var action = request.action;
                var params = request.params;
                var result = null;

                if (this[action]) {
                    result = this[action].call(this, params);
                } else {
                    throw new DBError("No method '" + action + "' definition found in DBDriver");
                }

                response.result = result;

            } catch (e) {
                response.error = e.message;
            }

            return response;
        },
    };

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        var res = DBDriver.dispatch(request);
        sendResponse(res);
    });

    DBDriver.init();

}).call(this);
