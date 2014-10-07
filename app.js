var http = require('http');
var express = require('express');
var path = require("path");

var app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.get('/user/new', function(req, res) {
    res.render('user/new', {});
});

var server = app.listen(app.get('port'), function() {
    console.log('App listening on port %d', app.get('port'));
});