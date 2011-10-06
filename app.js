require.paths.unshift('node_modules/');
var express = require("express");

// Mostly just a proxy for hosting the static offline files

var app = express.createServer();

app.configure(function(){
    app.use(express.static(__dirname));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.use(express.bodyParser());
});


app.listen(process.env.C9_PORT);