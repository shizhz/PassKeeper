(function($) {
    'use strict';

    function getSiteKey() {
        var url = location.href;
        var mark = url.indexOf('?');
        return (mark == -1 ? url : url.substring(0, mark));
    }

    var popupTemplateLoginAndQuery = $('' +
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
        '    </div>');

    var popupTemplateNew = $('' +
        '<div id="passkeeper-box" class="passkeeper-popup-box-new" tabindex="1">' +
        '    <nav>' +
        '        <ul>' +
        '            <li>' +
        '                <a href="javascript:void(0);" id="menu-new" class="menu-tab">New</a>' +
        '            </li>' +
        '        </ul>' +
        '    </nav>' +
        '    <div id="passkeeper-new" class="passkeeper-new">' +
        '        <div>' +
        '            <input type="text" readonly name="pk-new-site" id="pk-new-site" value="" />' +
        '            <input type="text" name="pk-new-username" id="pk-new-username" value="" placeholder="Username" />' +
        '            <input type="password" name="pk-new-password" id="pk-new-password" value="" placeholder="Password for This Site" />' +
        '            <input type="password" name="pk-password" id="pk-password" value="" placeholder="Password for Passkeeper" />' +
        '            <a href="#" id="pk-btn-new">Go</a>' +
        '        </div>' +
        '    </div>' +
        '    <div id="pk-message-box" class="passkeeper-message">' +
        '        <span id="pk-message"> Wrong password</span>' +
        '        <a href="#" class="btn-close">x</a>' +
        '    </div>' +
        '</div>');

    var defaultSettings = {
        'defaultTab': 'menu-login'
    };

    $.fn.passkeeper = function(options) {
        var settings = $.extend(defaultSettings, options);
        var popupBox = undefined;

        var $$ = function(jquerySelector) {
            return $(jquerySelector, popupBox);
        };

        var DataSource = {
            contains: function(k, yesFun, noFun) {
                chrome.runtime.sendMessage({
                    action: 'contains',
                    params: {
                        key: k
                    }
                }, function(response) {
                    var callback = ( !! response.result) ? yesFun : noFun;
                    callback.call();
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
                $$('input:visible:not([readonly]):first').focus();
            },

            clear: function() {
                $$('input:visible').each(function() {
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

            onLogin: function() {
                $$('#pk-btn-login').on('click', function(event) {
                    // TODO: login action
                    console.log('login btn clicked');
                });
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
                $$('#pk-btn-new').on('click', function(event) {
                    console.log('new btn clicked');
                });
            },

            initLoginAndQuery: function() {
                $$('#' + settings.defaultTab).removeClass('activeffect').addClass('activeffect');
                this.focusFirst();
                this.onClickTab();
                this.onLogin();
                this.onQuery();
            },

            initNew: function() {
                $$('input:visible[readonly]').val(getSiteKey());
                this.focusFirst();
                this.onNew();
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
                '13': false, // center
            },

            trigger: function() {
                // Ctrl - i
                if (this.keys['17'] && this.keys['73']) {
                    $(popupBox).toggle();
                    PopupBox.focusFirst();
                }

                if (this.keys['13']) {
                    $$('a[id^=pk-btn]:visible').trigger('click');
                }
            },

            init: function() {
                var this_ = this;
                $(document).keydown(function(event) {
                    var key = event.which;

                    this_.keys[key] === false && (this_.keys[key] = true);
                    this_.trigger();
                }).keyup(function(event) {
                    var key = event.which;
                    this_.keys[key] && (this_.keys[key] = false);
                });
            }
        };

        DataSource.contains(getSiteKey(), function() {
            popupBox = $(popupTemplateLoginAndQuery);
            PopupBox.initLoginAndQuery();
            HotKeys.init();
            $(popupBox).appendTo('body');
        }, function() {
            popupBox = $(popupTemplateNew);
            PopupBox.initNew();
            HotKeys.init();
            $(popupBox).appendTo('body');
        });
    };
})(jQuery);

$(function() {
    $.fn.passkeeper();
});
