// Prevent scrolling on Android / iOS devices
document.ontouchmove = function(e){e.preventDefault();}
document.ontouchstart = function(e){e.preventDefault();}

// Should match the duration defined in the CSS
var transition_duration = 250;

// Container
var FlipClock = {};

FlipClock.Digit = function(params) {
    this._params = params ? params : {};
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

    if (this._params.cls) tile.addClass(this._params.cls);

    $(".card", tile).append('<div class="inner" />');

    this.tile = tile;
};

FlipClock.Digit.flip = function(number) {
    var context = this.tile,
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
    setTimeout(function() {
        $(".bottom .flip", context).toggleClass("active");

        // Wait for the bottom tile to finish flipping then reset the tiles
        setTimeout(function() {
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
            setTimeout(function() {
                $(".bottom .flip, .top .flip", context).css("display", "block");

                $("#flip").removeAttr("disabled");
            }, transition_duration);
        }, transition_duration);
    }, transition_duration - 20);
};

FlipClock.Digit.prototype = FlipClock.Digit;

FlipClock.Layout = function(layout) {
    layout.init.apply(this);

    var container = $('<div />').addClass(layout.cls);
    var l = this.items.length;
    for (var i=0; i < l; i++) {
        var tile = this.items[i].tile;
        container.append(tile);
    }

    this.container = container;

    this.start = function() {
        this.update();
    };
    this.update = function() {
        layout.update.apply(this);

        var that = this;
        setTimeout(function() {
            that.update();
        }, layout.refreshTime)
    }
};

FlipClock.Layouts = {};

FlipClock.Layouts.TimeAMPM = {
    cls: 'time_box',
    refreshTime: 1000,
    init: function() {
        this.hour1 = new FlipClock.Digit({
            cls: 'time hour_1'
        });
        this.hour2 = new FlipClock.Digit({
            cls: 'time hour_2'
        });
        this.minute1 = new FlipClock.Digit({
            cls: 'time minute_1'
        });
        this.minute2 = new FlipClock.Digit({
            cls: 'time minute_2'
        });
        this.ampm = new FlipClock.Digit({
            cls: 'ampm'
        });

        this.items = [
            this.hour1, this.hour2,
            this.minute1, this.minute2,
            this.ampm
        ];
    },
    update: function() {
        var d = new Date();

        var seconds = d.getSeconds();
        var s_tens = Math.floor(seconds / 10);
        var s_ones = seconds % 10;

        // flipTo(".second_1", s_tens);
        // flipTo(".second_2", s_ones);

        var minutes = d.getMinutes();
        var m_tens = Math.floor(minutes / 10);
        var m_ones = minutes % 10;

        this.minute1.flip(m_tens);
        this.minute2.flip(m_ones);

        var hours = d.getHours();
        if (hours > 12) hours -= 12;

        if (hours == 0) hours = 12;

        var h_tens = Math.floor(hours / 10);
        var h_ones = hours % 10;

        this.hour1.flip(h_tens == 0 ? "" : h_tens);
        this.hour2.flip(h_ones);

        var ampm_val = "am";
        if (d.getHours() >= 12) ampm_val = "pm";

        this.ampm.flip(ampm_val);
    }
};


function initClock() {
    var layout = new FlipClock.Layout(FlipClock.Layouts.TimeAMPM);
    $("body").append(layout.container);
    layout.start();

    resize();
}

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
