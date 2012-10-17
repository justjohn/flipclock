module.declare([
    "../../../vendor/jquery",
    "../../config",
    "../flipclock"
],
function(require, exports, module) {
    var $ = require("../../../vendor/jquery").jQuery,
        config = require("../../config"),
        FlipClock = require("../flipclock").FlipClock;

    exports.layout = {
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
});
