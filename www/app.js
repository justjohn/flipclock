module.declare([
    "vendor/jquery",
    "lib/ui/flipclock",
    "lib/ui/dialog",
    "lib/ui/blinker",
    "lib/utils",
    "lib/analytics"
], function(require, exports, module) {
    var $         = require("vendor/jquery").jQuery,
        flipclock = require("lib/ui/flipclock"),
        dialog    = require("lib/ui/dialog"),
        utils     = require("lib/utils"),
        blinker   = require("lib/ui/blinker"),
        analytics = require("lib/analytics");
        
    var layout,
        countdown_blink,
        // App configuration
        App = {
            page: {
                clock: "clock",
                countdown: "countdown"
            }
        };

    // expose analytics
    exports.analytics = analytics;
    
    exports.boot = function() {
        $(document)
        .bind("countdown_minute_up", function() {
            var value = parseInt($("#countdown_min").html());
            if (value < 99) $("#countdown_min").html(value + 1);
        })
        .bind("countdown_minute_down", function() {
            var value = parseInt($("#countdown_min").html());
            if (value > 0) $("#countdown_min").html(value - 1);
        })
        .bind("countdown_hour_up", function() {
            var value = parseInt($("#countdown_hour").html());
            if (value < 99) $("#countdown_hour").html(value + 1);
        })
        .bind("countdown_hour_down", function() {
            var value = parseInt($("#countdown_hour").html());
            if (value > 0) $("#countdown_hour").html(value - 1);
        })
        .bind("countdown_second_up", function() {
            var value = parseInt($("#countdown_sec").html());
            if (value < 99) $("#countdown_sec").html(value + 1);
        })
        .bind("countdown_second_down", function() {
            var value = parseInt($("#countdown_sec").html());
            if (value > 0) $("#countdown_sec").html(value - 1);
        })
        .bind("hide_dialog", dialog.hide)

        .bind("countdown_start", function() {
            var sec = parseInt($("#countdown_sec").html()),
                min = parseInt($("#countdown_min").html()),
                hour = parseInt($("#countdown_hour").html()),
                string = hour + 'h' + min + 'm' + sec + 's',
                url = '#/c/' + string;

            dialog.hide();
            document.location = url;
        });

        $(window).resize(resize);

        // Routing
        $(window).hashchange( function(){
            var active_page = '';

            return function() {
                var splitHash = [],
                    section = '',
                    data = '';

                var hash = location.hash;
    			analytics._gaq && analytics._gaq.push( ['_trackPageview', hash] );
			
                if (hash.indexOf("#") >= 0) {
                    hash = hash.replace("#!", "");
                    hash = hash.replace("#", "");
                    splitHash = hash.split("/");
                    section = splitHash[1];
                    data = splitHash[2];
                }

                switch (section) {
                    // Handle countdown clocks
                    case "c":
                    case "countdown":
                        stopClock();
                        active_page = App.page.countdown;
                        var params = utils.parseTimeOutOfParams(data)

                        initCountdown(params);
                        break;

                    // Default to clock mode
                    default:
                        if (active_page === App.page.clock) break;
                        stopClock();
                        active_page = App.page.clock;
                        initClock();
                }

                resize();
            }
        }());

        $(document).ready(function documentReady() {
            // Setup dialogs
            dialog.create({
                id: "about",
                template: "templates/about.twig",
                container: $("#body")

            }).create({
                id: "countdown",
                template: "templates/countdown.twig",
                container: $("#body")

            }).complete(function() {
                $(".dialog").bind("mouseup", function(e){return false;});
                $(".dialog").bind("touchend", function(e){return false;});
                $(".dialog_container").bind("mouseup", dialog.hide);
                $(".dialog_container").bind("touchend", dialog.hide);
            });

            $("#toolbar").bind('click', function(e){
                // prevent click action from bubbling up to the container
                e.preventDefault();
                return false;
            });

            var toggle_toolbar = function(e) {
                if (e.returnValue === false) return false;
                $("body").toggleClass("toolbar_active");
                e.preventDefault();
            };

            // Prevent dragging
            $("#container, #toolbarContainer").bind('click', toggle_toolbar);

            $("#container, #toolbarContainer").bind('touchstart', toggle_toolbar);

            // Prepare for BLINK
            $("#container").addClass("blink_transition");

            var button_interval,
                button_interval_accel = 1.1,
                button_interval_timeout,
                button_incrementing = false,
                button_trigger = function(element) {
                    button_interval /= button_interval_accel;
                    button_incrementing = true;
                    $(element).trigger("action")

                    button_interval_timeout = setTimeout(button_trigger, button_interval, element)
                };

            var button_down = function(e) {
                $(this).removeClass("active");
                $(this).addClass("down");

                button_incrementing = false;
                if ($(this).attr("interval")) {
                    button_interval = parseInt($(this).attr("interval"));
                    button_interval_timeout = setTimeout(button_trigger, button_interval, this)
                }

                e.preventDefault();
            };
            var button_up = function(e) {
                var pressed = $(this).hasClass("down");
                $(this).removeClass("down");

                clearTimeout(button_interval_timeout);

                if (pressed && !button_incrementing) {
                    // Active Event
                    $(this).trigger("action");
                }
                e.preventDefault();
            };
            var button_over = function(e) {
                $(this).addClass("active");
            };
            var button_out = function(e) {
                $(this).removeClass("active");
                $(this).removeClass("down");

                clearTimeout(button_interval_timeout);
            };

            $(".button").append($('<div class="button_inner" />'));
            $(".button").bind("mousedown", button_down);
            $(".button").bind("mouseup", button_up);
            $(".button").bind("mouseover", button_over);
            $(".button").bind("mouseout", button_out);

            $(".button").bind("touchstart", button_down);
            $(".button").bind("touchend", button_up);
            $(".button").bind("touchcancel", button_up);
            $(".button").bind("touchmove", function(event) {
                // for (item in event) console.log(item + " = " + event[item]);
                var x = event.originalEvent.targetTouches[0].pageX;
                var y = event.originalEvent.targetTouches[0].pageY;
                // alert(x + ", " + y);
                var offset = $(this).offset();
                var left = offset.left;
                var top = offset.top;
                var right = left + $(this).outerWidth();
                var bottom = top + $(this).outerHeight();

                // console.log("left: " + left + ", x: " + x + ", right: " + right + ", top: " + top +  ", y: " + y + ", bottom: " + bottom);
                if (x < left || x > right || y < top || y > bottom) {
                    // Out of button
                    $(this).removeClass("down");
                    clearTimeout(button_interval_timeout);
                    event.preventDefault();
                    return false;
                }
            });

            $(".button").bind("action", function(e) {
                if ($(this).attr("dialog")) {
                    dialog.show($(this).attr("dialog"));
                    e.preventDefault();

                } else if ($(this).attr("action")) {
                    var action = $(this).attr("action");
                    console.log("Triggering ", action);
                    $(document).trigger(action);
                    e.preventDefault();

                } else {
                    document.location = $(this).attr("href");
                }
            });
            
            // Load the app
            $(window).hashchange();
        });
    };
    
    function center(element) {
        var element_width  = element.outerWidth(),
            element_height = element.outerHeight(),
            window_width   = $("body").width(),
            window_height  = $("body").height();
            
            console.log(window_width, "x", window_height)

        if (element_height < window_height) {
            element.css("top", ((window_height-element_height)/2) + 'px');
        }
        if (element_width < window_width) {
            element.css("left", ((window_width-element_width)/2) + 'px');
        }
    }

    function resize(e) {
        // Center Timebox
        center($(".time_box"));
        center($(".countdown_box"));
    }
    
    function stopClock() {
        // Clear any existing clock/timer
        $("#container").empty();
        if (layout) layout.stop(false);

        if (countdown_blink) {
            countdown_blink.stop();
            countdown_blink = undefined;
        }
    }

    function initClock() {
        var params = {
            container: $("#container"),
            start: true
        };
        layout = flipclock.load(flipclock.layouts.timeAMPMsec, params);
    }

    function initCountdown(params) {
        params.done = function() {
            countdown_blink = blinker.blink({
                target: $("#container")
            });
        };
        params.container = $("#container");
        params.start = true;

        layout = flipclock.load(flipclock.layouts.countdown, params);
    }
});
