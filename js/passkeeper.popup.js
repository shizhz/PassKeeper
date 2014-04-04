(function($) {
    'use strict';

    var defaultSettings = {
        'defaultTab': 'menu-login',
        'menu_id_login': 'menu-login',
        'menu_id_query': 'menu-query',
        'menu_id_new': 'menu-new'
    };

    function getSiteKey() {
        var url = location.href;
        var mark = url.indexOf('?');
        return (mark == -1 ? url : url.substring(0, mark));
    }

    function NOP() {}

    $.fn.passkeeper = function(options) {
        var settings = $.extend(defaultSettings, options);
        var popupBox = $(this);

        var $$ = function(jquerySelector) {
            return $(jquerySelector, popupBox);
        };

        var Notifier = {
            messages: {
                EMPTY_INPUT: 'Input Something',
                PASSKEEPER_PASSWORD_WRONG: 'Wrong Password for Passkeeper',
                USERNAME_PASSWORD_MISMATCH: 'Operation Done',
                NO_RECORD_FOUND: 'No Matching Result Found'
            },

            notify: function(msgKey) {
                $$('#pk-message').text(this.messages[msgKey]).parent().toggle(true);
            }
        };

        var Validator = {
            queue: [],

            add: function(checker, rollback, stopIfUnpassed) {
                rollback = rollback || NOP;
                this.queue.push([checker, rollback, stopIfUnpassed]);
                return this;
            },

            removeFrom: function(array, from) {
                from = from || 0;
                array = array || {};

                if ((typeof from != 'number') || (typeof array.pop != 'function')) {
                    throw 'Wrong arguments for removeFrom';
                }

                while (from > 0) {
                    array.pop();
                    from -= 1;
                }
            },

            clearAll: function() {
                this.queue = [];
            },

            validate: function(ohye, ohno) {
                ohye = ohye || NOP;
                ohno = ohno || NOP;

                if (this.queue.map((function(item, index, queue_) {
                    var checker = item[0];
                    var rollback = item[1];
                    var stopIfUnpassed = item[2];

                    if (!checker()) {
                        rollback();

                        if (stopIfUnpassed) {
                            this.removeFrom(queue_, queue_.length - index - 1);
                        }

                        return false;
                    }

                    return true;
                }).bind(this)).every(function(ele) {
                    return !!ele;
                })) {
                    ohye();
                } else {
                    ohno();
                }

                this.clearAll();
            }
        };

        var DataSource = {
            send: function(action_, params_, callback) {
                chrome.runtime.sendMessage({
                    action: action_,
                    params: params_
                }, function(response) {
                    callback(response);
                });
            },

            login: function(passwd, ohye, ohno) {
                this.send('login', {
                    'passwd': passed
                }, function(response) {
                    ( !! response.result ? ohye() : ohno());
                });
            },

            contains: function(k, callback) {
                this.send('contains', {
                    key: k
                }, function(response) {
                    callback( !! response.result);
                });
            },
        };

        var PopupBox = {
            menus: {
                'menu-login': 'passkeeper-login',
                'menu-query': 'passkeeper-query',
                'menu-new': 'passkeeper-new'
            },

            current: settings.defaultTab,

            focusFirst: function() {
                $$('input:visible:not([readonly]):first').focus();
            },

            clear: function() {
                $$('input:visible:not([readonly])').each(function() {
                    $(this).val('');
                });
            },

            onClickTab: function() {
                var menus = this.menus;
                var this_ = this;

                $.each(menus, function(key, value) {
                    $$('#' + key).on('click', function(event) {
                        var menuTabId = $(this).attr('id');

                        $.each(menus, function(k, v) {
                            $$('#' + v).toggle(k == menuTabId);
                            $$('#' + k).toggleClass('activeffect', k == menuTabId);
                        });

                        this_.focusFirst();
                        this_.clear();
                        this_.current = menuTabId;
                        event.preventDefault();
                    });
                });
            },

            emptyCheck: function() {
                var pass = true;
                $$('input:visible:not([readonly])').each(function() {
                    pass = pass && !! $.trim($(this).val());
                });

                return pass;
            },

            onLogin: function() {
                $$('#pk-btn-login').on('click', (function(event) {
                    Validator.add(this.emptyCheck, function() {
                        Notifier.notify('EMPTY_INPUT');
                    }, true).validate(function() {
                        // TODO: fill password
                    });
                }).bind(this));
            },

            onQuery: function() {
                $$('#pk-btn-query').on('click', (function(event) {
                    console.log('query btn clicked');
                    Validator.add(this.emptyCheck, function() {
                        Notifier.notify('EMPTY_INPUT');
                    }, true).validate(function() {
                        // TODO: query process
                    });
                }).bind(this));
            },

            onNew: function() {
                $$('#pk-btn-new').on('click', (function(event) {
                    Validator.add(this.emptyCheck, function() {
                        Notifier.notify('EMPTY_INPUT');
                    }, true).validate(function() {
                        // TODO: new or update
                    });
                }).bind(this));
            },

            onMessageClose: function() {
                var msgBox = $$('#pk-message-box');
                $('a', msgBox).on('click', function(event) {
                    $('#pk-message-box').toggle(false);
                });
            },

            onEnter: function() {
                $$('input:not([readonly])').keypress(function(event) {
                    if (event.which == 13) {
                        $$('a[id^=pk-btn]:visible').trigger('click');
                    }
                });
            },

            flushUI: function() {
                $$('#' + this.current).removeClass('activeffect').addClass('activeffect');
                $$('#' + this.current).trigger('click');
                $$('#pk-new-site').val(getSiteKey());
                $$('#pk-message-box').toggle(false);
            },

            registEvents: function() {
                this.onClickTab();
                this.onLogin();
                this.onQuery();
                this.onNew();
                this.onMessageClose();
                this.onEnter();
            },

            hide: function() {
                $(popupBox).toggle(false);
            },

            rotateTab: function() {
                if ($(popupBox).is(':visible')) {
                    var menuIds = Object.keys(this.menus);
                    var nextPosition = (menuIds.indexOf(this.current) + 1) % menuIds.length;
                    this.current = menuIds[nextPosition];
                } else {
                    $(popupBox).toggle(true);
                }
                this.flushUI();
            },

            init: function() {
                var this_ = this;
                Validator.add(function() {
                    return $(':password:visible').length > 0;
                }, function() {
                    console.log('No input[type=password] found, no need to init passkeeper');
                }, true).validate(function() {
                    DataSource.contains(getSiteKey(), (function(result) {
                        this.current = result ? settings.menu_id_login : settings.menu_id_new;

                        this.registEvents();
                        HotKeys.init();
                    }).bind(this_));
                });
            }
        };

        var HotKeys = {
            enable: false,
            modes: ['INSERT', 'NORMAL'],
            currentMode: 'INSERT',
            keys: {
                '27': false, // esc
                '37': false, // left key
                '39': false, // right key
                '17': false, // ctrl
                '73': false, // i
                '72': false, // h
                '76': false, // l
                '67': false, // c
                '13': false, // center
            },

            trigger: function() {
                if (this.keys['17'] && this.keys['73']) {
                    // Ctrl - i
                    PopupBox.rotateTab();
                } else if (this.keys['17'] && this.keys['67']) {
                    // Ctrl - c
                    PopupBox.hide();
                } else if (this.keys['13']) {}
            },

            init: function() {
                $(document).keydown((function(event) {
                    var key = event.which;
                    if (!this.keys[key]) {
                        this.keys[key] = true;
                    }
                    this.trigger();
                }).bind(this)).keyup((function(event) {
                    var key = event.which;
                    if (this.keys[key]) {
                        this.keys[key] = false;
                    }
                }).bind(this));
            }
        };

        return $(this).each(function() {
            PopupBox.init();
        });
    };
})(jQuery);

$(function() {
    $('<div id="passkeeper-box" class="passkeeper-popup-box" tabindex="1"> ' +
        '      <nav> ' +
        '          <ul> ' +
        '              <li> ' +
        '                  <a href="javascript:void(0);" id="menu-login" class="menu-tab">Login</a> ' +
        '              </li> ' +
        '              <li> ' +
        '                  <a href="javascript:void(0);" id="menu-query" class="menu-tab">Query</a> ' +
        '              </li> ' +
        '              <li> ' +
        '                  <a href="javascript:void(0);" id="menu-new" class="menu-tab">New || Update</a> ' +
        '              </li> ' +
        '          </ul> ' +
        '      </nav> ' +
        '      <div id="pk-message-box" class="passkeeper-message"> ' +
        '          <span id="pk-message"></span> ' +
        '          <a href="#" class="btn-close">x</a> ' +
        '      </div> ' +
        '      <div id="passkeeper-login" class="passkeeper-login"> ' +
        '          <div> ' +
        '              <input type="password" name="pk-login-password" id="pk-login-password" value="" placeholder="Password for Passkeeper" /> ' +
        '              <a href="#" id="pk-btn-login">Go</a> ' +
        '          </div> ' +
        '      </div> ' +
        '      <div id="passkeeper-query" class="passkeeper-query"> ' +
        '          <div> ' +
        '              <input type="text" name="pk-domainname" value="" placeholder="Domain Name"> ' +
        '              <input id="pk-query-password" type="password" name="pk-query-password" placeholder="Password for Passkeeper"> ' +
        '              <a id="pk-btn-query" href="#">Go</a> ' +
        '          </div> ' +
        '      </div> ' +
        '      <div id="passkeeper-new" class="passkeeper-new"> ' +
        '          <div> ' +
        '              <input type="text" readonly name="pk-new-site" id="pk-new-site" value="" /> ' +
        '              <input type="text" name="pk-new-username" id="pk-new-username" value="" placeholder="Username" /> ' +
        '              <input type="password" name="pk-new-password" id="pk-new-password" value="" placeholder="Password for This Site" /> ' +
        '              <input type="password" name="pk-password" id="pk-password" value="" placeholder="Password for Passkeeper" /> ' +
        '              <a href="#" id="pk-btn-new">Go</a> ' +
        '          </div> ' +
        '      </div> ' +
        '  </div> ').appendTo('body').passkeeper();
});
