import express from 'express';
import mongoose from './mongodb';
import path from 'path';
import routes from './routes';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import session from 'express-session';
import connectMongo from 'connect-mongo';

// const app = require('./app.js');
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// app.use(logger('dev'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// const MongoStore = connectMongo(session);
// app.use(session({
//   resave: false,
//   saveUninitialized: false,
//   secret: 'hello mock',
//   store: new MongoStore({ url: 'mongodb://localhost/session' }),
//   cookie: {
//     path: '/',
//     httpOnly: true,
//     secure: false,
//     maxAge: 7 * 24 * 60 * 60 * 1000
//   }
// }));

app.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By",' 3.2.1');
  res.header('Content-Type', 'application/json;charset=utf-8');
  next();
});
// 设置路由
// routes(app);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const server = app.listen(3000, function () {
  // const host = server.address().address;
  const port = server.address().port;
  console.log('Example app listening at http://%s:%s', 'localhost', port);
});

