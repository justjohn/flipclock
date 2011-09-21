// Bind the event.
$(window).hashchange( function(){
    // Clear any existing clock/timer
    $("body").empty();

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