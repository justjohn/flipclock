module.declare([
    "vendor/jquery",
    "lib/ui/flipclock",
    "lib/ui/dialog",
    "lib/ui/blinker",
    "lib/utils",
    "lib/analytics"
], function(require, exports, module) {
    var $         = require("vendor/jquery").jQuery,
        config    = require("lib/config"),
        flipclock = require("lib/ui/flipclock"),
        dialog    = require("lib/ui/dialog"),
        utils     = require("lib/utils"),
        blinker   = require("lib/ui/blinker"),
        analytics = require("lib/analytics");

    var layout,
        countdown_blink,
        active_page = '',
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
        $(document).bind({
            "countdown_minute_up": function() {
                var value = parseInt($("#countdown_min").html());
                if (value < 99) $("#countdown_min").html(value + 1);
            },
            "countdown_minute_down": function() {
                var value = parseInt($("#countdown_min").html());
                if (value > 0) $("#countdown_min").html(value - 1);
            },
            "countdown_hour_up": function() {
                var value = parseInt($("#countdown_hour").html());
                if (value < 99) $("#countdown_hour").html(value + 1);
            },
            "countdown_hour_down": function() {
                var value = parseInt($("#countdown_hour").html());
                if (value > 0) $("#countdown_hour").html(value - 1);
            },
            "countdown_second_up": function() {
                var value = parseInt($("#countdown_sec").html());
                if (value < 99) $("#countdown_sec").html(value + 1);
            },
            "countdown_second_down": function() {
                var value = parseInt($("#countdown_sec").html());
                if (value > 0) $("#countdown_sec").html(value - 1);
            },
            "hide_dialog": dialog.hide,
            "countdown_start": function() {
                var sec = parseInt($("#countdown_sec").html()),
                    min = parseInt($("#countdown_min").html()),
                    hour = parseInt($("#countdown_hour").html()),
                    string = hour + 'h' + min + 'm' + sec + 's',
                    url = '#/c/' + string;

                dialog.hide();
                document.location = url;
            },
            "save_settings": function() {
                var options_dialog = dialog.get('options');
                dialog.hide();

                // lock in changes
                $(".toggle", options_dialog).each(function(i) {
                    var toggle = $(this);
                    toggle.trigger('confirm');

                    // write to settings
                    var binding = toggle.data('binding'),
                        value = toggle.data('value');

                    config.set(binding, value);
                });

                // reset UI if clock is visible
                if (active_page === App.page.clock) {
                    stopClock();
                    initClock();
                    resize();
                }
            },
            "hide_settings": function() {
                var options_dialog = dialog.get('options');
                dialog.hide();

                // reset settings
                $(".toggle", options_dialog).each(function(i) {
                    $(this).trigger('reset');
                })
            }
        });

        $(window).resize(resize);

        // Routing
        $(window).hashchange(function() {
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

        $(function documentReady() {
            // Setup dialogs
            dialog.create({
                id: "about",
                template: "templates/about.twig",
                container: $("#body")

            }).create({
                id: "countdown",
                template: "templates/countdown.twig",
                container: $("#body")

            }).create({
                id: "options",
                template: "templates/options.twig",
                container: $("#body"),
                data: config.data()

            }, function(content) {
                $(".toggle", content).each(function() {
                    var toggle = $(this),
                        links = $("a", this),
                        active_class = 'active';

                    toggle.on('click', 'a', function(e) {
                        var target = $(this);

                        // toggle styles
                        links.removeClass(active_class);
                        target.addClass(active_class);
                    });

                    toggle.on('confirm', function() {
                        var active = $('.'+active_class, toggle),
                            value = active.data('value');

                        // set value
                        toggle.data('value', value);
                    });

                    toggle.on('reset', function() {
                        var value = toggle.data('value');

                        links.each(function() {
                            if ($(this).data('value') == value) {
                                $(this).addClass(active_class);
                            } else {
                                $(this).removeClass(active_class);
                            }
                        });
                    });
                });

            }).complete(function() {
                // $(".dialog").bind("mouseup", function(e){return false;});
                // $(".dialog").bind("touchend", function(e){return false;});
                var container = $(".dialog_container");
                container.bind("touchend mouseup", function(e) {
                    if(e.srcElement.className.indexOf("dialog_container") > -1) {
                        dialog.hide();
                    }
                });
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
            $("#container, #toolbarContainer").bind({
                'click': toggle_toolbar,
                'touchstart': toggle_toolbar
            });

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

            $(document).on({
                "mousedown":   button_down,
                "mouseup":     button_up,
                "mouseover":   button_over,
                "mouseout":    button_out,

                "touchstart":  button_down,
                "touchend":    button_up,
                "touchcancel": button_up,

                "touchmove":   function(event) {
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
            }, ".button");

            // Wait a small amount of time for the page to render.
            //   This is almost certainly the wrong approach but it
            //   works for now.
            setTimeout(function() {
                $(window).hashchange();
            }, 10);
        });
    };

    function center(element) {
        var element_width  = element.outerWidth(),
            element_height = element.outerHeight(),
            window_width   = $("body").width(),
            window_height  = $("body").height();

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
            },
            format = config.getShowSeconds() ?
                flipclock.layouts.timeAMPMsec :
                flipclock.layouts.timeAMPM;

        layout = flipclock.load(format, params);
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
