(function($) {
    'use strict';

    function PopupBox() {
        this.title_ = "Password for PassKeeper";
        this.error_msg_ = "Wrong password!";
        this.error_msg_reset_ = "Reset";
    }

    PopupBox.prototype.build = function() {
        var trigger = function() {
            // TODO: trigger 
        };
        var pkBox = $('<div>').attr('id', 'passkeeper-box').addClass('passkeeper_popup_box');
        $('<h1>').text(this.title_).appendTo(pkBox);
        var passwd = $('<input>').attr('type', 'password').attr('name', 'password').attr('placeholder', 'Password').keypress(function(event) {
            if (event.which == 13) {
                trigger();
            }
        });
        $('<p>').append(passwd).appendTo(pkBox);
        var p = $('<p>').addClass('submit').appendTo(pkBox);
        $('<input>').attr('type', 'button').attr('name', 'btn_go').attr('value', 'Go').on('click', trigger).appendTo(p);
        $('<span>').addClass('passkeeper_error_msg').text(this.error_msg_).append($('<a href="#">').text(this.error_msg_reset_).on('click', function(event) {
            // TODO: reset password
        })).appendTo(p);

        return pkBox;
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
