module.declare([
    "../../vendor/jquery",
    "../config"
],
function(require, exports, module) {
    var $ = require("../../vendor/jquery").jQuery,
        config = require("../config"),
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
            transition_duration = this.params.transition_duration || 250,
            transition_overlap = this.params.transition_overlap || 20;

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
                }, transition_duration + transition_overlap);

            }, transition_overlap);

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
        }, transition_duration - transition_overlap);
    };

    FlipClock.Digit.prototype = FlipClock.Digit;

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
