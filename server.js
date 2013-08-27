#!/bin/env node

// General static file server for Node.js
//
// Supports
//   - 301 Redirects
//   - Content-Type headers for js, css, and manifest files


var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    port = process.env.PORT || process.env.OPENSHIFT_INTERNAL_PORT || process.env.VCAP_APP_PORT || 8888,
    host  = process.env.OPENSHIFT_INTERNAL_IP || "0.0.0.0";

var REDIRECT_PROTOCOL = "http://"
    REDIRECT_HOST = process.env.DOMAIN || (host + ":" + port);

http.createServer(function(request, response) {
  var hostname = request.headers.host;

  if (hostname !== REDIRECT_HOST) {
    response.writeHead(301, {
      'Location': REDIRECT_PROTOCOL + REDIRECT_HOST + request.url,
      'Expires':  (new Date).toGMTString()
    });
    response.end();
    return;
  }

  var uri = url.parse(request.url).pathname,
      filename = path.join(__dirname, "www", uri);

  fs.exists(filename, function(exists) {
    if(!exists) {
        filename = path.join(__dirname, "index.html");

       response.writeHead(404, {"Content-Type": "text/plain"});
       response.write("404 Not Found :( Sorry.\n");
       response.end();
       return;
    }

    if (fs.statSync(filename).isDirectory()) filename += '/index.html';

    fs.readFile(filename, "binary", function(err, file) {
      if(err) {
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        return;
      }

      var opts;
      if (filename.indexOf(".js") > 0) {
          opts = {"Content-Type": "application/x-javascript"};

      } else if (filename.indexOf(".css") > 0) {
          opts = {"Content-Type": "text/css"};

      } else if (filename.indexOf(".manifest") > 0) {
          opts = {"Content-Type": "text/cache-manifest"};

      } else if (filename.indexOf(".webapp") > 0) {
          opts = {"Content-Type": "application/x-web-app-manifest+json"};
      }

      response.writeHead(200, opts);
      response.write(file, "binary");
      response.end();
    });
  });
}).listen(parseInt(port, 10), host);

console.log("FlipClock running at\n => http://" + REDIRECT_HOST + "/\nCTRL + C to shutdown");

