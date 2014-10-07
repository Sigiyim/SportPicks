var Db = require('mongodb').Db;
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require("cookie-parser");
var expressSession = require("express-session");
var path = require("path");

var app = express();
var connectionString = process.env.CUSTOMCONNSTR_SPORTPICKS || 'mongodb://127.0.0.1/SportPicks';

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cookieParser());
app.use(expressSession({secret: 'hMrtq6nzoyELXChVqCKVGyBpudZjtmpPOE5AzVzz9zYIFe0l4YovMkdoBb'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

Db.connect(connectionString, function(err, db) {
    app.all('*', function(req, res, next) {
        req.db = db;

        if ( !req.session.user &&
            req.url != '/user/login' &&
            req.url != '/user/new' )
        {
            res.redirect('/user/login');
        }

        next();
    });

    app.get('/user/new', function(req, res) {
        res.render('user/new', {});
    });
    app.post('/user/new', function(req, res) {
        var body = req.body;

        if ( body.password == body.password2 ) {
            var user = {
                username : body.username
                , password: body.password
            };

            req.db.collection('users').insert(user, function(err, doc) {
                if ( err ) {
                    res.send({ result : 'failure', message : err });
                } else {
                    res.send({ result : 'success' });
                }
            });
        } else {
            res.render('user/new', {});
        }
    });

    app.get('/user/login', function(req, res) {
        res.render('user/login', {});
    });
    app.post('/user/login', function(req, res) {
        var body = req.body;
        var user = {
            username : body.username
            , password: body.password
        };

        req.db.collection('users').find(user, function(err, doc) {
            if ( err ) {
                res.send({ result : 'failure', message : err });
            } else {
                req.session.user = user;

                res.redirect("/");
            }
        });
    });

    app.get('/', function(req, res) {
        var weeks = [];
        for( var i = 1; i <= 17; i++ ) {
            weeks.push(i);
        }

        res.render('index', { weeks : weeks });
    });

    app.get('/games/week', function(req, res) {
        var weekNum = parseInt(req.query['week']);

        req.db.collection('games')
            .find({ week : weekNum })
            .toArray(function(err, games) {

                //Get user picks
                req.db.collection('picks')
                    .find({
                        user : req.session.user.username
                        , week: weekNum
                    })
                    .toArray(function(err, picks) {
                        var pickObj = {};

                        picks.forEach(function(item) {
                            pickObj[item.game] = item;
                        });

                        console.log(pickObj);

                        res.render('games/week', { week : weekNum, games : games, picks : pickObj });
                    });
            });
    });
    app.get('/games/new', function(req, res) {
        res.render('games/new', {});
    });
    app.post('/games/new', function(req, res) {
        var body = req.body;
        var game = {
            week: parseInt(body.week)
            , awayTeam: body.awayTeam
            , homeTeam: body.homeTeam
            , date: body.date
        }

        db.collection("games").insert(game, function(err, doc) {
            if ( err ) {
                res.send("Error creating game");
            } else {
                res.redirect('/games/week?week=' + game.week);
            }
        });
    });
    app.post('/games/pick', function(req, res) {
        var body = req.body;
        var user = req.session.user;

        var pick = {
            game : body._id
            , week : parseInt(body.week)
            , pick: body[body._id]
            , user: user.username
        };

        db.collection('picks').insert(pick, function(err, doc) {
            res.redirect('/games/week?week=' + body.week);
        });
    });

    var server = app.listen(app.get('port'), function() {
        console.log('App listening on port %d', app.get('port'));
    });
});
