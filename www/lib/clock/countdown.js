module.declare([
    "../../vendor/jquery"
],
function(require, exports, module) {
    var $         = require("../../vendor/jquery").jQuery,
        flipclock = require("../ui/flipclock");

    exports.init = function() {
        $(document).on({
            "countdown_minute_up": function() {
                var value = parseInt($("#countdown_min").html(), 10);
                if (value < 99) $("#countdown_min").html(value + 1);
            },
            "countdown_minute_down": function() {
                var value = parseInt($("#countdown_min").html(), 10);
                if (value > 0) $("#countdown_min").html(value - 1);
            },
            "countdown_hour_up": function() {
                var value = parseInt($("#countdown_hour").html(), 10);
                if (value < 99) $("#countdown_hour").html(value + 1);
            },
            "countdown_hour_down": function() {
                var value = parseInt($("#countdown_hour").html(), 10);
                if (value > 0) $("#countdown_hour").html(value - 1);
            },
            "countdown_second_up": function() {
                var value = parseInt($("#countdown_sec").html(), 10);
                if (value < 99) $("#countdown_sec").html(value + 1);
            },
            "countdown_second_down": function() {
                var value = parseInt($("#countdown_sec").html(), 10);
                if (value > 0) $("#countdown_sec").html(value - 1);
            },
            "countdown_start": function() {
                var sec = parseInt($("#countdown_sec").html(), 10),
                    min = parseInt($("#countdown_min").html(), 10),
                    hour = parseInt($("#countdown_hour").html(), 10),
                    string = hour + 'h' + min + 'm' + sec + 's',
                    url = '#/c/' + string;

                $(document).trigger('hide_dialog');
                document.location = url;
            }
        });
    };

    exports.load = function(params) {
        params.done = function() {
            countdown_blink = blinker.blink({
                target: $("#container")
            });
        };
        params.container = $("#container");
        params.start = true;

        return flipclock.load(flipclock.layouts.countdown, params);
    };
});