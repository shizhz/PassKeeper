(function() {
    var root = this;
    var DEBUG = true;
    var PK_BUCKET = 'PK_BUCKET';

    var logger = function(msg) {
        DEBUG || console.log(msg);
    };

    var Util = {
        now: function() {
            var date = Date();
            return now.getFullYear() + "-" + now.getMonth() + "-" + now.getDate() + ' ' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
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
        return '[' + this.name = " --created-- " + this.created + ']';
    };

    DB.prototype.get = function(key) {
        return this.bucket[key] || '';
    };

    DB.prototype.size = function() {
        // body...
    }


    var DBDriver = {
        db: undefined,

        init: function() {
            var this_ = this;
            logger('INIT DBDRIVER');
            chrome.storage.sync.get(PK_BUCKET, function(result) {
                logger('sync get called');
                var db = result[PK_BUCKET] || new DB();
                logger(db.toString());
                chrome.storage.sync.set({ PK_BUCKET: db }, function() {
                    logger('PK_BUCKET INIT: ' + db);
                    this_.db = db;
                });
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
        var action = request.action;
        DBDriver[action] && DBDriver[action].call(DBDriver, request);
    });

    logger('background script loaded');
    DBDriver.init();
    logger('background script loaded');

}).call(this);
