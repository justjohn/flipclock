// Prevent scrolling on iOS devices
document.ontouchmove = function(e){e.preventDefault();}
document.ontouchstart = function(e){e.preventDefault();}

// Should match the duration defined in the CSS
var transition_duration = 250;

function flipTo(context_selector, number) {
    var context = $(context_selector),
        from = context.attr("number");

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
    setTimeout('finishFlip("' + context_selector + '")', transition_duration-20);
}

function finishFlip(context_selector) {
    var context = $(context_selector);
    $(".bottom .flip", context).toggleClass("active");

    // Wait for the bottom tile to finish flipping then reset the tiles
    setTimeout('resetFlip("'+context_selector+'")', transition_duration);
}
function resetFlip(context_selector) {
    var context = $(context_selector);
    var old_class = "digit_" + context.attr("from");
    var new_class = "digit_" + context.attr("number");

    $(".bottom .flip, .top .flip", context)
        .css('display', 'none')
        .toggleClass("active");

    // Reset the flip tiles to the new number in prep for next flip
    $(".bottom .static, .top .flip", context)
        .removeClass(old_class)
        .addClass(new_class);

    // Until I find a way to remove the animation...
    setTimeout('unhide("'+context_selector+'")', transition_duration);
}
function unhide(context_selector) {
    var context = $(context_selector);
    $(".bottom .flip, .top .flip", context).css("display", "block");

    $("#flip").removeAttr("disabled");
}

function inc() {
    var d = new Date();

    var seconds = d.getSeconds();
    var s_tens = Math.floor(seconds / 10);
    var s_ones = seconds % 10;

    // flipTo(".second_1", s_tens);
    // flipTo(".second_2", s_ones);

    var minutes = d.getMinutes();
    var m_tens = Math.floor(minutes / 10);
    var m_ones = minutes % 10;

    flipTo(".minute_1", m_tens);
    flipTo(".minute_2", m_ones);

    var hours = d.getHours();
    if (hours > 12) hours -= 12;
    if (hours == 0) hours = 12;
    var h_tens = Math.floor(hours / 10);
    var h_ones = hours % 10;

    flipTo(".hour_1", h_tens == 0 ? "" : h_tens);
    flipTo(".hour_2", h_ones);

    var ampm = "am";
    if (d.getHours() > 12) ampm = "pm";

    flipTo(".ampm", ampm);

    setTimeout("inc()", 1000);
}
$(document).ready(function() {
    var top = $('<div class="top" />')
        .append('<div class="card static" />')
        .append('<div class="card flip animated" />');

    var bottom = $('<div class="bottom" />')
        .append('<div class="card static" />')
        .append('<div class="card flip animated active" />');

    $(".tile").append(top).append(bottom);
    $(".card").append('<div class="inner" />');

    resize();

    inc();
});

var resize = function(e) {
    // Center Timebox
    var element = $(".time_box"),
        element_width = element.outerWidth(),
        element_height = element.outerHeight(),
        window_width = $(document).width(),
        window_height = $(document).height();

    if (element_height < window_height) {
        element.css("top", ((window_height-element_height)/2) + 'px');
    }
    if (element_width < window_width) {
        element.css("left", ((window_width-element_width)/2) + 'px');
    }
};

$(window).resize(resize);