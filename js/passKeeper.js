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
                        event.preventDefault();
                        var menuTabId = $(this).attr('id');
                        $.each(menus, function(k, v) {
                            $('#' + v).toggle(k == menuTabId);
                            $('#' + k).toggleClass('activeffect', k == menuTabId);
                        });

                        this_.focusFirst();
                        this_.clear();
                    });
                });
            },

            init: function() {
                $('#' + settings.defaultTab).removeClass('activeffect').addClass('activeffect');
                this.focusFirst();
                this.clicker();
            }
        };

        MenuWatcher.init();

        return this;
    }

    function bindHotKeys() {
        var downkeys = {
            '17': false, // ctrl key
            '73': false // combination key: i
        };

        return function() {
            $(document).keydown(function(event) {
                downkeys[event.which] = true;
                if (downkeys['17'] && downkeys['73']) {}

            }).keyup(function(event) {
                downkeys[event.which] = false;
            });
        };
    }

})(jQuery);

$(function() {
    $('#passkeeper-box').passkeeper();
});
