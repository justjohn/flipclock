module.declare([
    "../../vendor/jquery",
    "./dialog"
],
function(require, exports, module) {
    var $       = require("../../vendor/jquery").jQuery,
        dialog  = require("./dialog"),
        // UI classes
        cls         = "button",
        active_cls  = "active",
        pressed_cls = "down";

    exports.init = function() {

        var button_interval,
            button_interval_accel = 1.1,
            button_interval_timeout,
            button_incrementing = false,
            button_trigger = function(element) {
                button_interval /= button_interval_accel;
                button_incrementing = true;
                $(element).trigger("action");

                button_interval_timeout = setTimeout(button_trigger, button_interval, element);
            };

        var button_down = function(e) {
            $(this).removeClass(active_cls);
            $(this).addClass(pressed_cls);

            button_incrementing = false;
            if ($(this).attr("interval")) {
                button_interval = parseInt($(this).attr("interval"), 10);
                button_interval_timeout = setTimeout(button_trigger, button_interval, this);
            }

            e.preventDefault();
        };

        var button_up = function(e) {
            var pressed = $(this).hasClass(pressed_cls);
            $(this).removeClass(pressed_cls);

            clearTimeout(button_interval_timeout);

            if (pressed && !button_incrementing) {
                // Active Event
                $(this).trigger("action");
            }
            e.preventDefault();
        };

        var button_over = function() {
            $(this).addClass(active_cls);
        };

        var button_out = function() {
            $(this)
                .removeClass(active_cls)
                .removeClass(pressed_cls);

            clearTimeout(button_interval_timeout);
        };

        $("." + cls)
            .append($('<div class="button_inner" />'));

        $(document).on({
            "mousedown":   button_down,
            "mouseup":     button_up,
            "mouseover":   button_over,
            "mouseout":    button_out,

            "touchstart":  button_down,
            "touchend":    button_up,
            "touchcancel": button_up,

            "touchmove":   function(event) {
                var x = event.originalEvent.targetTouches[0].pageX,
                    y = event.originalEvent.targetTouches[0].pageY;

                var offset = $(this).offset(),
                    left = offset.left,
                    top = offset.top,
                    right = left + $(this).outerWidth(),
                    bottom = top + $(this).outerHeight();

                // console.log("left: " + left + ", x: " + x + ", right: " + right + ", top: " + top +  ", y: " + y + ", bottom: " + bottom);
                if (x < left || x > right || y < top || y > bottom) {
                    // Out of button
                    $(this).removeClass(pressed_cls);
                    clearTimeout(button_interval_timeout);
                    event.preventDefault();
                    return false;
                }
            },

            "action": function(e) {
                if ($(this).attr("dialog")) {
                    dialog.show($(this).attr("dialog"));
                    e.preventDefault();

                } else if ($(this).attr("action")) {
                    var action = $(this).attr("action");
                    $(document).trigger(action);
                    e.preventDefault();

                } else {
                    document.location = $(this).attr("href");
                }
            }

        }, "." + cls);
    };

});
