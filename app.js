var Db = require('mongodb').Db;
var ObjectID = require('mongodb').ObjectID;
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

app.use(function(req, res, next) {
    if ( ! req.session.user &&
            (req.url != '/user/login' && req.url != '/user/new')
        )
    {
        console.log('Redirecting');
        res.redirect('/user/login');
    }
    else {
        next();
    }
});

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
        if ( !req.session.user ) { res.send({ result: 'failure', message: 'Not logged in'})}
        var weekNum = parseInt(req.query['week']);

        req.db.collection('games')
            .find({ week : weekNum })
            .toArray(function(err, games) {

                //Get user picks
                req.db.collection('picks')
                    .find({
                        user : req.session.user.username
                        , week: weekNum
                    }, {}, {
                        'sort' : 'time'
                    })
                    .toArray(function(err, picks) {
                        var pickObj = {};

                        picks.forEach(function(item) {
                            pickObj[item.game] = item;
                        });

                        res.render('games/week', { week : weekNum, games : games, picks : pickObj });
                    });
            });
    });

    /*
    * CREATE A NEW GAME
    */
    app.get('/games/new', function(req, res) {
        res.render('games/new', {});
    });
    app.post('/games/new', function(req, res) {
        var body = req.body;
        var date = new Date(body.date);
        var game = {
            week: parseInt(body.week)
            , awayTeam: body.awayTeam
            , homeTeam: body.homeTeam
            , date: body.date
            , time: date.getTime()
        }

        db.collection("games").insert(game, function(err, doc) {
            if ( err ) {
                res.send("Error creating game");
            } else {
                res.redirect('/games/week?week=' + game.week);
            }
        });
    });

    /*
    * EDIT EXISTING GAME
    */
    app.get('/games/edit/:id', function(req, res) {
        var db = req.db;
        var id = req.params.id;

        db.collection('games').findOne({ _id : ObjectID(id) }, function(err, doc) {
            if ( err ) {
                res.send({ result : 'failure', message: 'Game not found' });
            } else {
                res.render('games/edit', { game : doc });
            }
        })
    });
    app.post('/games/edit', function(req, res) {
        var body = req.body;
        var game = {
            week : parseInt(body.week)
            , awayTeam : body.awayTeam
            , homeTeam : body.homeTeam
            , date: body.date
            , winner : body.winner
            , _id : ObjectID(body._id)
        };

        db.collection('games').save(game, {w:1}, function(err, result) {
            if ( err ) {
                res.send({ result : 'failure', message : err});
            } else {
                res.send({ result : 'success' })
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
