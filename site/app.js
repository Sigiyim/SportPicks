var http = require('http');
var express = require('express');
var app = express();

var port = process.env.port || 3000;

var server = http.createServer(function(req, res) {
    res.writeHead(200, { 'Content-Type' : 'text/plain' });
    res.end('Hello, World\n');
});

server.listen(port);