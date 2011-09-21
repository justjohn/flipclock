// Bind the event.
$(window).hashchange( function(){
    // Clear any existing clock/timer
    $("body").empty();
    if (layout) layout.stop(false);
    stopBlinker();

    // Alerts every time the hash changes!
    var hash = location.hash;
    if (hash.indexOf("#!") >= 0) {
        hash = hash.replace("#!", "");
        var splitHash = hash.split("/"),
            section = splitHash[1],
            data = splitHash[2];

        switch (section) {
            // Handle countdown clocks
            case "c":
            case "countdown":
                var params = parseTimeOutOfParams(data)

                initCountdown(params);
                break;

            // Default to clock mode
            default:
                initClock();
        }
    } else {
        // Start the clock if we don't understand
        //  the hash (or it's empty)
        initClock();
    }
    resize();
});

$(document).ready(function() {

    // Trigger the event
    $(window).hashchange();

    // Prevent dragging
    $("div").bind('mousedown', function(e){e.preventDefault();});

    // Prepare for BLINK
    $("html").addClass("blink_transition");
});

function parseTimeOutOfParams(data) {
    var tmp = '',
        params = {},
        // Is this a parsable date?
        isDate = true;

    for (var i=0, l=data.length; i < l; i++) {
        var chr = data.charAt(i);
        switch (chr) {
            case 'h':
                params.hours = parseInt(tmp);
                tmp = '';
                isDate = false;
                break;
            case 'm':
                params.minutes = parseInt(tmp);
                tmp = '';
                isDate = false;
                break;
            case 's':
                params.seconds = parseInt(tmp);
                tmp = '';
                isDate = false;
                break;
            default:
                tmp += chr;
        }
    }
    if (isDate) {
        params.time = data;
    }

    return params;
}

var layout;

function initClock() {
    layout = new FlipClock.Layout(FlipClock.Layouts.TimeAMPM);
    $("body").append(layout.container);
    layout.start();
}

var blinker;
var blinkCount = 0;
var blinkClass = "blink";

function stopBlinker() {
    blinkCount = 0;
    clearInterval(blinker);
    $("html").removeClass("blink").removeClass("passive_blink");
}

function initCountdown(params) {
    params.done = function() {
        // When the countdown is done, flash the background four times to white
        //   followed by 2 minutes of flashing to grey

        blinkClass = "blink";

        blinker = setInterval(function() {
            $("html").toggleClass(blinkClass);
            blinkCount++;
            if (blinkCount == 8) {
                blinkClass = "passive_blink";
            }
            if (blinkCount == 244) {
                stopBlinker();
            }
        }, 500)
    };
    layout = new FlipClock.Layout(FlipClock.Layouts.Countdown, params);
    $("body").append(layout.container);
    layout.start();
}

function center(element) {
    var element_width = element.outerWidth(),
        element_height = element.outerHeight(),
        window_width = $(document).width(),
        window_height = $(document).height();

    if (element_height < window_height) {
        element.css("top", ((window_height-element_height)/2) + 'px');
    }
    if (element_width < window_width) {
        element.css("left", ((window_width-element_width)/2) + 'px');
    }
}

var resize = function(e) {
    // Center Timebox
    center($(".time_box"));
    center($(".countdown_box"));
};

$(window).resize(resize);
