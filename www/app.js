module.declare([
    "vendor/jquery",
    "lib/clock/countdown",
    "lib/clock/flipclock",
    "lib/clock/layout/flipclock",
    "lib/clock/layout/flipclockSeconds",
    "lib/clock/layout/countdown",
    "lib/ui/dialog",
    "lib/ui/buttons",
    "lib/ui/toggle",
    "lib/ui/blinker",
    "lib/utils",
    "lib/analytics"
], function(require, exports, module) {
    var $         = require("vendor/jquery").jQuery,

        // Core functionality
        config    = require("lib/config"),
        analytics = require("lib/analytics"),
        utils     = require("lib/utils"),

        // Clock types
        flipclock = require("lib/clock/flipclock"),
        countdown = require("lib/clock/countdown"),

        layouts = {
            timeAMPM:    require("lib/clock/layout/flipclock").layout,
            timeAMPMsec: require("lib/clock/layout/flipclockSeconds").layout,
            countdown:   require("lib/clock/layout/countdown").layout,
        },

        // UI Elements
        dialog    = require("lib/ui/dialog"),
        buttons   = require("lib/ui/buttons"),
        toggle    = require("lib/ui/toggle"),
        blinker   = require("lib/ui/blinker");

    var layout,
        countdown_blink,
        active_page = '',
        active_font = config.getFont(),
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
        countdown.init();

        $(document).on({
            "hide_dialog": dialog.hide,
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

                updateFont();
            },
            "hide_settings": function() {
                var options_dialog = dialog.get('options');
                dialog.hide();

                // reset settings
                $(".toggle", options_dialog).trigger('reset');
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

                        layout = countdown.load(params);
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
            updateFont();
            
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
                toggle.init($(".toggle", content));

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

            $("#toolbar").on('click', function(e){
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
            $("#container")
                .addClass("blink_transition");

            buttons.init();

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
        if (layout)
        {
            layout.stop(false);
            layout.unload();
        }
    }

    function initClock() {
        var params = {
                container: $("#container"),
                start: true
            },
            format = config.getShowSeconds() ?
                layouts.timeAMPMsec :
                layouts.timeAMPM;

        layout = flipclock.load(format, params);
    }

    function updateFont() {
        $(body).removeClass("font_" + active_font);
        active_font = config.getFont();
        $(body).addClass("font_" + active_font);
    }
});
