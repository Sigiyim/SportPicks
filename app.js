var Db = require('mongodb').Db;
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var path = require("path");

var app = express();
var connectionString = process.env.CUSTOMCONNSTR_SPORTPICKS || 'mongodb://127.0.0.1/SportPicks';

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

Db.connect(connectionString, function(err, db) {
    app.all('*', function(req, res, next) {
        req.db = db;

        next();
    });

    app.get('/user/new', function(req, res) {
        res.render('user/new', {});
    });
    app.post('/user/new', function(req, res) {
        var body = req.body;

        if ( body.password == body.password2 ) {
            res.send("You did it");
        } else {
            res.render('user/new', {});
        }
    });

    var server = app.listen(app.get('port'), function() {
        console.log('App listening on port %d', app.get('port'));
    });
});
