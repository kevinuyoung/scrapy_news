import express from 'express';
import path from 'path';
import superAgent from 'superagent';
import cheerio from 'cheerio';
import request from 'request';
import fs from 'fs';

import session from 'express-session';
import mongoose from './mongodb';
import connectMongo from 'connect-mongo';

import segmentfault from './website/segmentfault';
import juejin from './website/juejin';

const app = express();

const MongoStore = connectMongo(session);
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: 'scrapy news',
  store: new MongoStore({ url: 'mongodb://localhost/sessionNews' }),
  cookie: {
    path: '/',
    httpOnly: true,
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}));

let timerJuejin = null;
let timerSegmentfault = null;

const loopForJuejin = () => {
  if (timerJuejin) {
    clearTimeout(timerJuejin);
    timerJuejin = null;
  }
  timerJuejin = setTimeout(() => {
    console.log('==================junjin 开始下一轮==================================');
    juejin();
    loopForJuejin();
  }, 12 * 60 * 1000);
};

const loopForSegmentfault = () => {
  if (timerSegmentfault) {
    clearTimeout(timerSegmentfault);
    timerSegmentfault = null;
  }
  timerSegmentfault = setTimeout(() => {
    console.log('==================segmentfault 开始下一轮==================================');
    segmentfault();
    loopForSegmentfault();
  }, 30 * 60 * 1000);
};

console.log('start....to....run application******......');

segmentfault();
juejin();

loopForJuejin();
loopForSegmentfault();

const server = app.listen(7000, function () {
  const port = server.address().port;
  console.log('Example app listening at http://%s:%s', 'localhost', port);
});