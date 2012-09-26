#!/bin/env node

var express = require("express");

// Mostly just a proxy for hosting the static files

var app = express.createServer();

app.configure(function(){
    app.use(express.static(__dirname + "/www"));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.use(express.bodyParser());
});

var host = process.env.HOST || "0.0.0.0",
	port = process.env.PORT || 9999;

app.listen(parseInt(port, 10), host);

console.log("FlipClock is now running on " + host + ":" + port);

