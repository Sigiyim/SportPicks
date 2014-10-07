var express = require('express');
var app = express();

app.set('port', process.env.port || 3000);

app.get('/', function(res, res) {
    res.send()
})
app.get('/hello', function(req, res) {
    res.send('Hello, World!');
});

var server = app.listen(app.get('port'), function() {
    console.log('Listening on port %d', server.address().port);
});