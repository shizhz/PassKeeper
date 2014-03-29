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

    DB.prototype.toString = function() {
        return '[' + this.name + " --created-- " + this.created + ']';
    };

    DB.prototype.get = function(key) {
        return this.bucket[key] || '';
    };

    DB.prototype.size = function() {
        // body...
    };


    var DBDriver = {
        db: undefined,

        init: function() {
            var this_ = this;

            chrome.storage.sync.get(PK_BUCKET, function(result) {
                var pkdb = result[PK_BUCKET];
                pkdb = JSON.parse(pkdb);

                if (!pkdb) {
                    pkdb = new DB();
                    chrome.storage.sync.set({
                        PK_BUCKET: JSON.stringify(pkdb);
                    }, function() {
                        logger('PK_BUCKET INIT: ' + pkdb.toString());
                        this_.db = pkdb;
                    });
                } else {
                     logger('DB existed');
                     console.log(pkdb);
                     logger(pkdb.toString());
                }
            });
        },

        load: function(key) {
            logger('load called ' + Utils.now());
            logger(this.db.toString());
        },

        contains: function(request) {
            this.load();
        }
    };

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        logger('message arrieved');
        var action = request.action;
        DBDriver[action] && DBDriver[action].call(DBDriver, request);
    });

    DBDriver.init();

}).call(this);
