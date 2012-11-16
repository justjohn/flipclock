
// Prevent scrolling on Android / iOS devices
document.ontouchmove = function(e){e.preventDefault();}
document.ontouchstart = function(e){e.preventDefault();}

// Kick everything off
module.declare(["vendor/jquery", "app"], function() {
    var $ = require("vendor/jquery").jQuery,
        app = require("app");

    app.analytics.register(window);
    app.boot();
});