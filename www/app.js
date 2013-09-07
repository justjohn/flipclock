module.declare([
    "vendor/jquery",
    "vendor/spin",
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
        Spinner   = require("vendor/spin").Spinner,

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
        active_font,
        appCache = window.applicationCache,
        // App configuration
        App = {
            page: {
                clock: "clock",
                countdown: "countdown"
            }
        };

    config.ready().done(function() {
        active_font = config.getFont();
    });

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
        $(window).hashchange(function hashchangeOuter() {
            return function hashchange() {
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

                // hide and reposition the clock.
                resize(false);

                // resize again, and show after some delay for the UI
                // to update...
                setTimeout(function resizeFix() {
                    resize(true);
                }, 50);
            }
        }());

        var spinner,
            startSpinner = function() {
                // show loader
                var opts = {
                    lines: 15, // The number of lines to draw
                    length: 13, // The length of each line
                    width: 2, // The line thickness
                    radius: 15, // The radius of the inner circle
                    corners: 0.6, // Corner roundness (0..1)
                    rotate: 0, // The rotation offset
                    color: '#eee', // #rgb or #rrggbb
                    speed: 0.7, // Rounds per second
                    trail: 60, // Afterglow percentage
                    shadow: false, // Whether to render a shadow
                    hwaccel: false, // Whether to use hardware acceleration
                    className: 'spinner', // The CSS class to assign to the spinner
                    zIndex: 2e9, // The z-index (defaults to 2000000000)
                    top: 'auto', // Top position relative to parent in px
                    left: 'auto' // Left position relative to parent in px
                };

                $(function() {
                    var el = $('body').get(0);
                    spinner = new Spinner(opts).spin(el);
                });
            },
            stopSpinner = function() {
                spinner && spinner.stop();
            },
            // page initialization
            init = false,
            updating = false,
            documentReady = function documentReady() {
                // only run once
                if (init) return;
                init = true;

                stopSpinner();
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
                    var container = $(".dialog_container");
                    container.bind("touchend mouseup", function(e) {
                        if (e.srcElement.className.indexOf("dialog_container") > -1) {
                            dialog.hide();
                        }
                    });
                });
                $("#toolbar").on("click", function(e) {
                    e.preventDefault();
                    return false;
                });
                var toggle_toolbar = function(e) {
                    if (e.returnValue === false) return false;
                    $("body").toggleClass("toolbar_active");
                    e.preventDefault();
                };
                $("#container, #toolbarContainer").bind({
                    click: toggle_toolbar,
                    touchstart: toggle_toolbar
                });
                $("#container").addClass("blink_transition");
                buttons.init();

                $(window).hashchange();
            };

        if (appCache) {
            $(startSpinner);

            $(appCache).bind({
                "downloading": function(e) {
                    updating = true;
                },
                "updateready": function(e) {
                    // reload for newest version of site
                    appCache.swapCache();
                    window.location.reload();
                },
                "error noupdate cached": function(e) {
                    $(documentReady);
                },
            });

            // In order to hande the user disallowing use of the appCache in FF,
            //
            setTimeout(function lateInit() {
                if (!updating)
                    $(documentReady);
            }, 500);
        } else {
            $(documentReady);
        }
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
        if (e === false) {
            $(".time_box, .countdown_box").hide();
        } else {
            $(".time_box, .countdown_box").show();

            $(".time_box").get(0) && center($(".time_box"));
            $(".countdown_box").get(0) && center($(".countdown_box"));
        }
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
