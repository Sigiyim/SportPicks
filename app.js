var http = require('http');
var express = require('express');
var app = express();

var port = process.env.port || 3000;

app.get('/', function(req, res) {
    res.send("Hello, World!");
});

var server = app.listen(port, function() {
    console.log('App listening on port %d', port);
});