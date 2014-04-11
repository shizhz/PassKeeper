(function() {
    var root = this;
    var PK_BUCKET = 'PK_BUCKET';

    var Util = {
        now: function() {
            var date = new Date();
            return date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
        },

        copyProperties: function(sourceObj, targetObj) {
            Object.keys(sourceObj).forEach(function(key) {
                targetObj[key] = sourceObj[key];
            });
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
        token: null,

        tokenGen: function() {
            return this.token ? this.token : Math.random().toString(16).substring(2);
        },

        query: function(params) {
            var result_ = {};
            var entries = {};

            if (params.token == this.token) {
                Object.keys(this.db.bucket).filter(function(key) {
                    return key.indexOf(params.key) > -1;
                }).forEach((function(wantedKey) {
                    entries[wantedKey] = this.db.bucket[wantedKey];
                }).bind(this));

                result_.result = true;
            } else {
                result_.result = false;
            }
            result_.entries = entries;

            return result_;
        },

        get: function(params) {
            var result_ = {};

            if (params.token == this.token) {
                this.token = null;
                result_ = this.db.bucket[params.key] || {};
                result_.result = true;
            } else {
                result_.result = false;
            }

            return result_;
        },


        size: function() {
            return this.keys().length;
        },

        keys: function() {
            return this.db ? Object.keys(this.db.bucket) : [];
        },

        contains: function(params) {
            return this.keys().indexOf(params.key) >= 0;
        },

        sync: function() {
            chrome.storage.sync.set({
                PK_BUCKET: JSON.stringify(this.db)
            }, (function() {
                console.log('PK_BUCKET UPDATED');
            }).bind(this));
        },

        saveOrUpdate: function(params) {
            var merge = function(newer, older) {
                return !!newer ? (newer == '_clear_' ? "" : newer) : older;
            };

            if (this.token == params.token) {
                this.token = null;
                var key = params.key;
                var oldRecord = this.db.bucket[key] || {};
                var record = {
                    username: merge(params.username, oldRecord.username),
                    passwd: merge(params.password, oldRecord.passwd),
                    selectorLogin: merge(params.selectorLogin, oldRecord.selectorLogin),
                    selectorUsername: merge(params.selectorUsername, oldRecord.selectorUsername),
                    selectorPassword: merge(params.selectorPassword, oldRecord.selectorPassword)
                };

                this.db.bucket[key] = record;
                this.sync();

                return true;
            } else {
                return false;
            }
        },

        remove: function(params) {
            if (this.token == params.token) {
                this.token = null;
                delete this.db.bucket[params.key];
                this.sync();

                return true;
            } else {
                return false;
            }
        },

        info: function() {
            var db = this.db;
            return db ? '[' + db.name + '--created at--' + db.created + ']' : '[No db existed]';
        },

        login: function(params) {
            var passwd = params.passwd;
            var result_ = {};

            result_.result = this.db.passwd ? (passwd === this.db.passwd) : (passwd === 'foobar');

            if (result_.result) {
                result_.token = this.token = this.tokenGen();
            }

            return result_;
        },

        newPasswd: function(params) {
            if (this.token == params.token) {
                this.db.passwd = params.passwd;
                this.token = null;
                this.sync();
                return true;
            } else {
                return false;
            }
        },

        init: function(callback) {
            var this_ = this;

            chrome.storage.sync.get(PK_BUCKET, function(result) {
                var pkdb = result[PK_BUCKET];
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
                        console.log('PK_BUCKET INIT: ' + pkdb.toString());
                    });
                } else {
                    console.log('DB existed');
                }
                this_.db = pkdb;
                callback();
            });
        },

        dispatch: function(request) {
            var response = {};
            try {
                var action = request.action;
                var params = request.params;

                if (this[action]) {
                    var result = this[action].call(this, params);
                    if ((typeof result) === 'object') {
                        Util.copyProperties(result, response);
                    } else {
                        response.result = result;
                    }
                } else {
                    throw new DBError("No method '" + action + "' definition found in DBDriver");
                }
            } catch (e) {
                response.error = e.message;
            }

            return response;
        },
    };

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (!DBDriver.db) {
            DBDriver.init(function() {
                sendResponse(DBDriver.dispatch(request));
            });
            // https://developer.chrome.com/extensions/runtime#event-onMessage : This function becomes invalid when the event listener returns, unless you return true from the event listener to indicate you wish to send a response asynchronously (this will keep the message channel open to the other end until sendResponse is called).
            return true;
        } else {
            sendResponse(DBDriver.dispatch(request));
        }
    });
}).call(this);
