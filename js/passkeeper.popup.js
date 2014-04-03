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
                var msgBox = $$('#pk-message');
                var left_ = $(popupBox).offset().left + ($(popupBox).width() / 2 - msgBox.width() / 2);
                var top_ = $(popupBox).offset().top + ($(popupBox).height() - msgBox.height() - 2);

                // TODO: position is wrong
                msgBox.text(this.messages[msgKey]).parent().toggle(true).parent().offset({
                    top: top_,
                    left: left_
                })
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

            validate: function(ohye, ohno) {
                var pass = true;
                $$('input:visible:not([readonly])').each(function() {
                    pass = pass && !! $.trim($(this).val());
                });

                (pass ? ohye() : ohno());

            },

            onLogin: function() {
                $$('#pk-btn-login').on('click', (function(event) {
                    console.log('login btn clicked');
                    this.validate(function() {
                        // TODO: fill username and password
                        console.log('passed, get userinfo and fill password');
                    }, function() {
                        Notifier.notify('EMPTY_INPUT');
                    });
                }).bind(this));
            },

            onQuery: function() {
                // TODO: register query go action
                $$('#pk-btn-query').on('click', function(event) {
                    // TODO: query action
                    console.log('query btn clicked');
                });
            },

            onNew: function() {
                // TODO: register new go action
                $$('#pk-btn-new').on('click', (function(event) {
                    console.log('new btn clicked');
                    this.validate(function() {
                        // TODO: fill username and password
                        console.log('passed, get userinfo and fill password');
                    }, function() {
                        Notifier.notify('EMPTY_INPUT');
                    });
                }).bind(this));
            },

            initLoginAndQuery: function() {
                $$('#' + settings.defaultTab).removeClass('activeffect').addClass('activeffect');
                this.focusFirst();
                this.onClickTab();
                this.onLogin();
                this.onQuery();
            },

            initNew: function() {
                this.focusFirst();
                this.onNew();
            },

            flushUI: function() {
                $$('#' + this.current).removeClass('activeffect').addClass('activeffect');
                $$('#' + this.current).trigger('click');
                $$('#pk-new-site').val(getSiteKey());
            },

            registEvents: function() {
                this.onClickTab();
                this.onLogin();
                this.onQuery();
                this.onNew();
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
                if ($(':password:visible').length > 0) {
                    DataSource.contains(getSiteKey(), (function(result) {
                        this.current = result ? settings.menu_id_login : settings.menu_id_new;

                        this.registEvents();
                        HotKeys.init();
                    }).bind(this));
                } else {
                    console.log('No input[type=password] found, no need to init passkeeper');
                }
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
                } else if (this.keys['13']) {
                    $$('a[id^=pk-btn]:visible').trigger('click');
                }
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
        '      <div id="pk-message-box" class="passkeeper-message"> ' +
        '          <span id="pk-message"> Wrong password</span> ' +
        '          <a href="#" class="btn-close">x</a> ' +
        '      </div> ' +
        '  </div> ').appendTo('body').passkeeper();
});
