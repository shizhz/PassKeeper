(function($) {
    'use strict';

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
