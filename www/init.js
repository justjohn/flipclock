
// Prevent scrolling on Android / iOS devices
document.ontouchmove = function(e){e.preventDefault();}
document.ontouchstart = function(e){e.preventDefault();}

// Kick everything off
module.declare(["vendor/jquery", "app"], function() {
    var $ = require("vendor/jquery").jQuery,
    	config = require("lib/config"),
        app = require("app");

    app.analytics.register(window);

    config.ready().done(function() {
    	app.boot();
    });
});