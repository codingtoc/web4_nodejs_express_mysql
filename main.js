var express = require('express');
var app = express();
var db = require('./lib/db.js');
var port = 3000;
var bodyParser = require('body-parser');
var compression = require('compression');
var helmet = require('helmet');
app.use(helmet());

app.get('*', function (request, response, next) {
  db.query('SELECT * FROM topic', function (error, topics) {
    request.list = topics;
    next();
  });
});

var indexRouter = require('./routes/index');
var topicRouter = require('./routes/topic');
var authorRouter = require('./routes/author');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());

app.use('/', indexRouter);
app.use('/topic', topicRouter);
app.use('/author', authorRouter);

app.use(function (req, res, next) {
  res.status(404).send('Sorry can not find that!');
});

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
});