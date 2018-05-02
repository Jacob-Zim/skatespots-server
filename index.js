'use strict';
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');
const localStrategy = require('./passport/local');
const jwtStrategy = require('./passport/jwt');

const { PORT, CLIENT_ORIGIN } = require('./config');
const { dbConnect } = require('./db-mongoose');
// const {dbConnect} = require('./db-knex');
const app = express();

passport.use(localStrategy);
passport.use(jwtStrategy);

const Spot = require('./models/Spot');

const bodyParser = require('body-parser');

const spotsRouter = require('./routers/spots');
const authRouter = require('./routers/auth');

const mapsURL = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAs68Fqn-liAuXfca9XygzOMByadH3KnKg&callback=initMap';

//create a spots router once I start on the next endpoint

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

//parses our json for us
app.use(bodyParser.urlencoded({
  extended:true
}));

app.use(bodyParser.json());

app.use('/', authRouter);

app.get('/spots', (req, res, next) => {
  Spot.find()
    .then(results => (
      res.json(results)
    ));
});

app.get('/spots/:id', (req, res, next) => {
  const spotId = req.params.id;
  Spot.findById(spotId)
    .then(result => {
      res.json(result);
    });
});

// require jwt for post put delete
app.use(passport.authenticate('jwt', { session: false, failWithError: true }));

app.use('/', spotsRouter);

function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
}

if (require.main === module) {
  dbConnect();
  runServer();
}

module.exports = { app };
