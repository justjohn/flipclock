// Bind the event.
$(window).hashchange( function(){
    // Clear any existing clock/timer
    $("#container").empty();
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

    $("#toolbar").bind('click', function(e){
        // prevent click action from bubbling up to the container
        e.preventDefault();
        return false;
    });

    var toggle_toolbar = function(e) {
        if (e.returnValue === false) return false;
        // $("body").toggleClass("toolbar_active");
        e.preventDefault();
    };

    // Prevent dragging
    $("#container, #toolbarContainer").bind('click', toggle_toolbar);

    $("#container, #toolbarContainer").bind('touchstart', toggle_toolbar);

    // Prepare for BLINK
    $("#container").addClass("blink_transition");

    var button_down = function(e) {
        $(this).removeClass("active");
        $(this).addClass("down");
    };
    var button_up = function(e) {
        $(this).removeClass("down");
    };
    var button_over = function(e) {
        $(this).addClass("active");
    };
    var button_out = function(e) {
        $(this).removeClass("active");
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
            event.preventDefault();
            return false;
        }
    });
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
    $("#container").append(layout.container);
    layout.start();
}

var blinker;
var blinkCount = 0;
var blinkClass = "blink";

function stopBlinker() {
    blinkCount = 0;
    clearInterval(blinker);
    $("#container").removeClass("blink").removeClass("passive_blink");
}

function initCountdown(params) {
    params.done = function() {
        // When the countdown is done, flash the background four times to white
        //   followed by 2 minutes of flashing to grey

        blinkClass = "blink";

        blinker = setInterval(function() {
            $("#container").toggleClass(blinkClass);
            blinkCount++;
            if (blinkCount == 8) {
                blinkClass = "passive_blink";
            }
            if (blinkCount == 244) {
                stopBlinker();
            }
        }, 750)
    };
    layout = new FlipClock.Layout(FlipClock.Layouts.Countdown, params);
    $("#container").append(layout.container);
    layout.start();
}

function center(element) {
    var element_width = element.outerWidth(),
        element_height = element.outerHeight(),
        window_width = $("#container").width(),
        window_height = $("#container").height();

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
