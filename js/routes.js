// Bind the event.
$(window).hashchange( function(){
    // Alerts every time the hash changes!
    var hash = location.hash;
    if (hash.indexOf("#!") >= 0) {
        hash = hash.replace("#!", "");
        var splitHash = hash.split("/"),
            section = splitHash[1],
            data = splitHash[2];

        switch (section) {
            // Handle countdown clocks
            case "countdown":

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
});

$(document).ready(function() {

    // Trigger the event
    $(window).hashchange();

});