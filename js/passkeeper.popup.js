(function($) {
    'use strict';

    var defaultSettings = {
        'defaultTab': 'menu-login'
    };

    $.fn.passkeeper = function(options) {
        var settings = $.extend(defaultSettings, options);
        var popupBox = $(this);

        var $$ = function (jquerySelector) {
            return $(jquerySelector, popupBox);
        };

        var DataSource = {
            contains: function (domainname) {
                console.log('contains called' + new Date());
                chrome.storage.local.set({'jd.com': 'messi@jd'}, function () {
                    console.log('message saved in local storage');
                });

                var data = chrome.storage.local.get('jd.com', function (data) {
                    console.log(data);
                });
                chrome.runtime.sendMessage({action: 'constains', args: {key: domainname}}, function (response) {
                    console.log('DataSource: ' + response.hello);
                });
            },
        };

        var PopupBox = {
            menus: {
                'menu-login': 'passkeeper-login',
                'menu-query': 'passkeeper-query'
            },

            current: settings.defaultTab,

            focusFirst: function() {
                $$('input:visible:first').focus();
            },

            clear: function() {
                $$('input:visible').each(function() {
                    $(this).val('');
                });
            },

            clicker: function() {
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

            init: function() {
                $$('#' + settings.defaultTab).removeClass('activeffect').addClass('activeffect');
                this.focusFirst();
                this.clicker();
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
            },

            trigger: function() {
                // Ctrl - i
                $(popupBox).toggle(this.keys['17'] && this.keys['73']);
            },

            hotkey: function (action) {
                var display = false;
                var this_ = this;
                var down = action == 'down';
                var up = action == 'up';

                return function (event) {
                    var key = event.which;
                    this_.keys[key] == false && (this_.keys[key] = true);
                }
            },

            init: function() {
                var this_ = this;
                $(document).keydown(function(event) {
                    var key = event.which;

                    this_.keys[key] == false && (this_.keys[key] = true);
                    this_.trigger();
                }).keyup(function(event) {
                    var key = event.which;
                    this_.keys[key] && (this_.keys[key] = false);
                });
                // TODO: register hotkeys to popupBox
            }
        };

        return this.each(function() {
            return this;
            DataSource.contains(location.hostname);
            PopupBox.init();
            HotKeys.init();
            $(popupBox).appendTo('body');
        });
    }
})(jQuery);

$(function() {
    $('' +
        '    <div id="passkeeper-box" class="passkeeper-popup-box" tabindex="1">' +
        '        <nav>' +
        '            <ul>' +
        '                <li><a href="javascript:void(0);" id="menu-login" class="menu-tab">Login</a>' +
        '                </li>' +
        '                <li><a href="javascript:void(0);" id="menu-query" class="menu-tab">Query</a>' +
        '                </li>' +
        '            </ul>' +
        '        </nav>' +
        '        <div id="passkeeper-login" class="passkeeper-login">' +
        '            <div>' +
        '                <input type="password" name="pk-login-password" id="pk-login-password" value="" placeholder="Password for Passkeeper" />' +
        '                <a href="#" id="pk-btn-login">Go</a>' +
        '            </div>' +
        '        </div>' +
        '        <div id="passkeeper-query" class="passkeeper-query">' +
        '            <div>' +
        '                <input type="text" name="pk-domainname" value="" placeholder="Domain Name">' +
        '                <input id="pk-query-password" type="password" name="pk-query-password" placeholder="Password for Passkeeper">' +
        '                <a id="pk-btn-query" href="#">Go</a>' +
        '            </div>' +
        '        </div>' +
        '        <div id="pk-message-box" class="passkeeper-message">' +
        '            <span id="pk-message"> Wrong password</span>' +
        '            <a href="#" class="btn-close">x</a>' +
        '        </div>' +
        '    </div>').passkeeper();
});
