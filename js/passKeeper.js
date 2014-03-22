(function($) {
    'use strict';

    var downkeys = {
        '17': false, // ctrl key
        '73': false // character i
    };

    $(document).keydown(function(event) {
        downkeys[event.which] = true;
        if (downkeys['17'] && downkeys['73']) {
            // TODO:bind ctrl-i to show passkeeper prompt window 
            console.log('ctrl-i');
        }

    }).keyup(function(event) {
        downkeys[event.which] = false;
    });
})(jQuery);
