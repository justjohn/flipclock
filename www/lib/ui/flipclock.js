module.declare([
    "../../vendor/jquery",
    "../config"
],
function(require, exports, module) {
    var $ = require("../../vendor/jquery").jQuery,
        config = require("../config");

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

    FlipClock.Digit.prototype.init = function() {
        this.$active_top    = $('<div class="top" />');
        this.$active_bottom = $('<div class="bottom" />').append('<div class="inner" />');
        this.$back_top      = $('<div class="top" />');
        this.$back_bottom   = $('<div class="bottom" />').append('<div class="inner" />');

        var top = $('<div class="card back" />')
                .append(this.$back_top)
                .append(this.$back_bottom);

        var bottom = $('<div class="card active transform" />')
                .append($('<div class="front" />')
                    .append(this.$active_top))
                .append($('<div class="back" />')
                    .append(this.$active_bottom));

        var tile = $('<div class="digit" />')
            .append(top)
            .append(bottom);

        if (this.params.cls) tile.addClass(this.params.cls);

        this.tile = tile;
    };

    FlipClock.Digit.prototype.flip = function(number) {
        var digit = this,
            tile = this.tile,
            from = tile.attr("number"),
            // Should match the duration defined in the CSS
            transition_duration = this.params.transition_duration || 1000;

        // Check to see if the new number is already set
        if (number == from) return;

        // Store the old/new number on the element
        tile.attr("from", from);
        tile.attr("number", number);

        // Set the static (to-be-revealed) tile on the top to the target number
        digit.$back_top.html(number);

        // Set the down-sliding tile on the bottom to the target number
        $(".inner", digit.$active_bottom).html(number);

        $(".active", tile).addClass("transform");
        $(".active", tile).addClass("flipped");

        // Start flipping the bottom digit when the top one is almost complete.
        setTimeout(function() {
            // update hidden to new number
            digit.$active_top.html(number);
            $(".inner", digit.$back_bottom).html(number);

            // reset
            $(".active", tile).removeClass("transform");
            $(".active", tile).removeClass("flipped");
        }, transition_duration);
    };

    FlipClock.Layout = function(layout, params) {
        this.cls = layout.cls;
        layout.init.apply(this, [params]);

        var container = $('<div />').addClass(this.cls);
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
        this.unload = function() {
            params.unload && params.unload();
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
            this.mode = config.getTimeMode();

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
            this.second1 = new FlipClock.Digit({
                cls: 'time_right small second_1',
                transition_duration: 850
            });
            this.second2 = new FlipClock.Digit({
                cls: 'time_right small second_2',
                transition_duration: 850
            });

            this.items = [
                this.hour1, this.hour2,
                this.minute1, this.minute2,
                this.second1, this.second2
            ];

            if (this.mode == config.modes.twelveHour) {
                this.ampm = new FlipClock.Digit({
                    cls: 'ampm',
                    transition_duration: 850
                });

                this.items.push(this.ampm);
            }

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

            if (this.mode == config.modes.twelveHour) {
                if (hours > 12) hours -= 12;
                if (hours == 0) hours = 12;

                var ampm_val = "am";
                if (d.getHours() >= 12) ampm_val = "pm";
                this.ampm.flip(ampm_val);
            }

            var h_tens = Math.floor(hours / 10);
            var h_ones = hours % 10;

            this.hour1.flip(h_tens == 0 ? "" : h_tens);
            this.hour2.flip(h_ones);
        }
    };

    exports.layouts.timeAMPM = {
        cls: 'time_box layout_time_ampm',
        refreshTime: 1000,
        init: function() {
            this.mode = config.getTimeMode();

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

            this.items = [
                this.hour1, this.hour2,
                this.minute1, this.minute2
            ];

            if (this.mode == config.modes.twelveHour) {
                this.ampm = new FlipClock.Digit({
                    cls: 'ampm'
                });

                this.items.push(this.ampm);
            } else {
                this.cls += " layout_no_seconds";
            }
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

            if (this.mode == config.modes.twelveHour) {
                if (hours > 12) hours -= 12;
                if (hours == 0) hours = 12;

                var ampm_val = "am";
                if (d.getHours() >= 12) ampm_val = "pm";
                this.ampm.flip(ampm_val);
            }

            var h_tens = Math.floor(hours / 10);
            var h_ones = hours % 10;

            this.hour1.flip(h_tens == 0 ? "" : h_tens);
            this.hour2.flip(h_ones);
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
                cls: 'time left_1',
                transition_duration: 850
            });
            this.left2 = new FlipClock.Digit({
                cls: 'time left_2',
                transition_duration: 850
            });
            this.right1 = new FlipClock.Digit({
                cls: 'time right_1',
                transition_duration: 850
            });
            this.right2 = new FlipClock.Digit({
                cls: 'time right_2',
                transition_duration: 850
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
