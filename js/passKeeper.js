(function($) {
    'use strict';

    var defaultSettings = {
        'defaultTab': 'menu-login'
    };

    $.fn.passkeeper = function(options) {
        var settings = $.extend(defaultSettings, options);

        var MenuWatcher = {
            menus: {
                'menu-login': 'passkeeper-login',
                'menu-query': 'passkeeper-query'
            },

            current: settings.defaultTab,

            focusFirst: function() {
                $('input:visible:first').focus();
            },

            clear: function() {
                $('input:visible').each(function() {
                    $(this).val('');
                });
            },

            clicker: function() {
                var menus = this.menus;
                var this_ = this;

                $.each(menus, function(key, value) {
                    $('#' + key).on('click', function(event) {
                        var menuTabId = $(this).attr('id');

                        $.each(menus, function(k, v) {
                            $('#' + v).toggle(k == menuTabId);
                            $('#' + k).toggleClass('activeffect', k == menuTabId);
                        });

                        this_.focusFirst();
                        this_.clear();
                        this_.current = menuTabId;
                        event.preventDefault();
                    });
                });
            },

            init: function() {
                $('#' + settings.defaultTab).removeClass('activeffect').addClass('activeffect');
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
                '105': false, // i
                '104': false, // h
                '108': false, // l
            },

            trigger: function () {
                if (this.keys['17'] && this.keys['105']) {
                    // TODO: popup box
                }
            },

            init: function(popupBox) {
                var this_ = this;
                $(document).keydown(function(event) {
                    var key = event.which;
                    this_.keys[key] == false && (this_.keys[key][1] = true);
                    this_.trigger();
                }).keyup(function(event) {
                    var key = event.which;
                    this_.keys[key] && (this_.keys[event.which] == false);
                });

                // TODO: register hotkeys to popupBox
            }
        };

        return this.each(function() {
            MenuWatcher.init();
            HotKeys.init(this);
        });
    }
})(jQuery);

$(function() {
    $('#passkeeper-box').passkeeper();
});
