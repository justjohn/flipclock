module.declare([{ jquery: "vendor/jquery" }], function(require, exports, module) {
    var $ = require("jquery").jQuery,
        // Should match the duration defined in the CSS
        transition_duration = 250;

    // Container
    var FlipClock = {};

    // Setup constants
    FlipClock.MS_TO_S = 1000;
    FlipClock.MS_TO_M = 1000 * 60;
    FlipClock.MS_TO_H = 1000 * 60 * 60;

    FlipClock.Digit = function(params) {
        this.params = params || {};
        this.init();
    };

    FlipClock.Digit.init = function() {
        var top = $('<div class="top" />')
            .append('<div class="card static" />')
            .append('<div class="card flip animated" />');

        var bottom = $('<div class="bottom" />')
            .append('<div class="card static" />')
            .append('<div class="card flip animated active" />');

        var tile = $('<div class="tile" />')
            .append(top)
            .append(bottom);

        if (this.params.cls) tile.addClass(this.params.cls);

        // NOTE: The before and after classes are required as CSS
        //       transitions don't work on pseudo elements.
        $(".card", tile)
            .append('<div class="before" />')
            .append('<div class="inner" />')
            .append('<div class="after" />');

        this.tile = tile;
    };

    FlipClock.Digit.flip = function(number) {
        var context = this.tile,
            from = context.attr("number"),
            transition_duration = this.params.transition_duration || 250;

        // Check to see if the new number is already set
        if (number == from) return;

        // Store the old/new number on the element
        context.attr("from", from);
        context.attr("number", number);

        // Set the static (to-be-revealed) tile on the top to the target number
        $(".top .static", context)
            .removeClass("digit_" + from)
            .addClass("digit_" + number);

        // Set the down-sliding tile on the bottom to the target number
        $(".bottom .flip", context)
            .removeClass("digit_" + from)
            .addClass("digit_" + number);

        $(".top .flip", context).toggleClass('active');

        // Start flipping the bottom digit when the top one is almost complete.
        setTimeout(function() {
            var old_class = "digit_" + context.attr("from");
            var new_class = "digit_" + context.attr("number");

            $(".bottom .flip", context).toggleClass("active");

            // Reset the top tile
            setTimeout(function() {
                // Hide and disable animation
                $(".top .flip", context)
                    .css('display', 'none');

                // Reset active tile flag.
                $(".top .flip", context)
                    .toggleClass("active");

                // Reset the flip tiles to the new number in prep for next flip
                $(".top .flip", context)
                    .removeClass(old_class)
                    .addClass(new_class);

                // It seems to take some time for the not-animated CSS styles
                // to be reflected. So we wait for some time before adding the
                // animation classes back.
                setTimeout(function() {
                    // Show the tile again
                    $(".top .flip", context)
                        .css("display", "block");
                }, transition_duration);

            }, 0);

            // Wait for the bottom tile to finish flipping then reset it
            setTimeout(function() {
                $(".bottom .flip", context)
                    .css('display', 'none');

                $(".bottom .flip", context)
                    .toggleClass("active");

                // Reset the flip tiles to the new number in prep for next flip
                $(".bottom .static", context)
                    .removeClass(old_class)
                    .addClass(new_class);

                // Reset the bottom tile
                setTimeout(function() {
                    $(".bottom .flip", context)
                        .css("display", "block");
                }, transition_duration);

            }, transition_duration);
        }, transition_duration);
    };

    FlipClock.Digit.prototype = FlipClock.Digit;

    FlipClock.Layout = function(layout, params) {
        layout.init.apply(this, [params]);

        var container = $('<div />').addClass(layout.cls);
        var l = this.items.length;
        for (var i=0; i < l; i++) {
            var tile = this.items[i].tile;
            container.append(tile);
        }

        this.element = container;

        this.done = false;
        this.stop = false;

        this.start = function() {
            this.update();
        };
        this.stop = function(fireDoneEvent) {
            this.stop = true;
            if (fireDoneEvent === true) {
                this.done = true;
            }
        };

        this.update = function() {
            layout.update.apply(this);
            if (this.done !== true && this.stop !== true) {
                var that = this;
                setTimeout(function() {
                    that.update();
                }, layout.refreshTime);
            } else if (this.done === true) {
                // done, execute complete function
                if (params.done) params.done();
            }
        }
    };

    exports.layouts = {};

    exports.layouts.timeAMPMsec = {
        cls: 'time_box layout_time_ampm_sec',
        refreshTime: 1000,
        init: function() {
            this.hour1 = new FlipClock.Digit({
                cls: 'time hour_1',
                transition_duration: 250
            });
            this.hour2 = new FlipClock.Digit({
                cls: 'time hour_2',
                transition_duration: 250
            });
            this.minute1 = new FlipClock.Digit({
                cls: 'time minute_1',
                transition_duration: 250
            });
            this.minute2 = new FlipClock.Digit({
                cls: 'time minute_2',
                transition_duration: 250
            });
            this.second1 = new FlipClock.Digit({
                cls: 'time_right small second_1',
                transition_duration: 200
            });
            this.second2 = new FlipClock.Digit({
                cls: 'time_right small second_2',
                transition_duration: 200
            });
            this.ampm = new FlipClock.Digit({
                cls: 'ampm',
                transition_duration: 250
            });

            this.items = [
                this.hour1, this.hour2,
                this.minute1, this.minute2,
                this.second1, this.second2,
                this.ampm
            ];
        },
        update: function() {
            var d = new Date();

            var seconds = d.getSeconds();
            var s_tens = Math.floor(seconds / 10);
            var s_ones = seconds % 10;

            this.second1.flip(s_tens);
            this.second2.flip(s_ones);

            var minutes = d.getMinutes();
            var m_tens = Math.floor(minutes / 10);
            var m_ones = minutes % 10;

            this.minute1.flip(m_tens);
            this.minute2.flip(m_ones);

            var hours = d.getHours();
            if (hours > 12) hours -= 12;

            if (hours == 0) hours = 12;

            var h_tens = Math.floor(hours / 10);
            var h_ones = hours % 10;

            this.hour1.flip(h_tens == 0 ? "" : h_tens);
            this.hour2.flip(h_ones);

            var ampm_val = "am";
            if (d.getHours() >= 12) ampm_val = "pm";

            this.ampm.flip(ampm_val);
        }
    };
    
    exports.layouts.timeAMPM = {
        cls: 'time_box layout_time_ampm',
        refreshTime: 1000,
        init: function() {
            this.hour1 = new FlipClock.Digit({
                cls: 'time hour_1'
            });
            this.hour2 = new FlipClock.Digit({
                cls: 'time hour_2'
            });
            this.minute1 = new FlipClock.Digit({
                cls: 'time minute_1'
            });
            this.minute2 = new FlipClock.Digit({
                cls: 'time minute_2'
            });
            this.ampm = new FlipClock.Digit({
                cls: 'ampm'
            });

            this.items = [
                this.hour1, this.hour2,
                this.minute1, this.minute2,
                this.ampm
            ];
        },
        update: function() {
            var d = new Date();

            var seconds = d.getSeconds();
            var s_tens = Math.floor(seconds / 10);
            var s_ones = seconds % 10;

            // flipTo(".second_1", s_tens);
            // flipTo(".second_2", s_ones);

            var minutes = d.getMinutes();
            var m_tens = Math.floor(minutes / 10);
            var m_ones = minutes % 10;

            this.minute1.flip(m_tens);
            this.minute2.flip(m_ones);

            var hours = d.getHours();
            if (hours > 12) hours -= 12;

            if (hours == 0) hours = 12;

            var h_tens = Math.floor(hours / 10);
            var h_ones = hours % 10;

            this.hour1.flip(h_tens == 0 ? "" : h_tens);
            this.hour2.flip(h_ones);

            var ampm_val = "am";
            if (d.getHours() >= 12) ampm_val = "pm";

            this.ampm.flip(ampm_val);
        }
    };

    exports.layouts.countdown = {
        cls: 'countdown_box layout_countdown',
        refreshTime: 1000,
        init: function(params) {
            if (params.time) {
                this.date = new Date(params.time);
            } else {
                var ms_time = Date.now();
                if (params.seconds) {
                    ms_time += params.seconds * FlipClock.MS_TO_S;
                }
                if (params.minutes) {
                    ms_time += params.minutes * FlipClock.MS_TO_M;
                }
                if (params.hours) {
                    ms_time += params.hours * FlipClock.MS_TO_H;
                }

                this.date = new Date(ms_time);
            }

            this.left1 = new FlipClock.Digit({
                cls: 'time left_1'
            });
            this.left2 = new FlipClock.Digit({
                cls: 'time left_2'
            });
            this.right1 = new FlipClock.Digit({
                cls: 'time right_1'
            });
            this.right2 = new FlipClock.Digit({
                cls: 'time right_2'
            });

            this.items = [
                this.left1, this.left2,
                this.right1, this.right2
            ];
        },
        update: function() {
            var targetMs = this.date.getTime(),
                nowMs    = Date.now(),
                differenceMs = targetMs - nowMs;

            if (differenceMs <= 0) {
                differenceMs = 0;
                this.done = true;
            }

            var hours = Math.floor(differenceMs / FlipClock.MS_TO_H);
            differenceMs = differenceMs % FlipClock.MS_TO_H;

            var minutes = Math.floor(differenceMs / FlipClock.MS_TO_M);
            differenceMs = differenceMs % FlipClock.MS_TO_M;

            var seconds = Math.floor(differenceMs / FlipClock.MS_TO_S);
            differenceMs = differenceMs % FlipClock.MS_TO_S;

            var h_tens = Math.floor(hours / 10);
            var h_ones = hours % 10;

            var m_tens = Math.floor(minutes / 10);
            var m_ones = minutes % 10;

            var s_tens = Math.floor(seconds / 10);
            var s_ones = seconds % 10;

            if (hours > 0) {
                this.left1.flip(h_tens);
                this.left2.flip(h_ones);
                this.right1.flip(m_tens);
                this.right2.flip(m_ones);

            } else {

                this.left1.flip(m_tens);
                this.left2.flip(m_ones);
                this.right1.flip(s_tens);
                this.right2.flip(s_ones);
            }
        }
    };

    exports.load = function(layout, params) {
        var clock     = new FlipClock.Layout(layout, params),
            container = params.container,
            start     = params.start;

        if (container) {
            $(container).append(clock.element);
        }
        if (start) {
            clock.start();
        }
        return clock;
    }
});
