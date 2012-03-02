module.declare([ "../../vendor/jquery" ], function(require, exports, module) {
    var $ = require("../../vendor/jquery").jQuery;

    exports.blink = function(params) {
        // When the countdown is done, flash the background four times to white
        //   followed by 2 minutes of flashing to grey

        return new function() {
            var passive_count = params.passive || 8,
                count  = params.count || 244,
                blink_class = "blink",
                blink_count = 0,
                target = params.target,
                blinker_interval;

            this.stop = function() {
                blink_count = 0;
                clearInterval(blinker_interval);
                target.removeClass("blink").removeClass("passive_blink");
            };

            blinker_interval = setInterval(function() {
                target.toggleClass(blink_class);
                blink_count++;
                if (blink_count == passive_count) {
                    blink_class = "passive_blink";
                }
                if (blink_count == count) {
                    this.stop();
                }
            }, 750)
        }
    };
});
