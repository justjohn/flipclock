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
});