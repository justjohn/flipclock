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

    exports.FlipClock = FlipClock;

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
