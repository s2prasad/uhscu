/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
var auth = require('./auth/auth.service');
var path = require('path');
var async=require('async');
module.exports = function(app) {

  // Insert routes below
  
  
 // function parallel(middlewares) {
  // return function (req, res, next) {
    // async.each(middlewares, function (mw, cb) {
      // mw(req, res, cb);
    // }, next);
  // };
// }

// app.use(parallel([
	// '/auth', require('./auth'),
  // '/api/users', require('./api/user'),
  // '/api/admin', require('./api/admin'),
  // '/api/donor', require('./api/donor'),
  // '/api/receiver', require('./api/receiver'),
  // '/api/transporter', require('./api/transporter'),
  // '/forgotpassword', require('./forgotpassword').reset
// ]));
  app.use('/api/users', require('./api/user'));
  app.use('/api/admin', require('./api/admin'));
  app.use('/api/donor', require('./api/donor'));
  app.use('/api/receiver', require('./api/receiver'));
  app.use('/api/transporter', require('./api/transporter'));
  app.post('/receivesms', require('./api/sms'));
  app.use('/auth', require('./auth'));
  app.post('/forgotpassword', require('./forgotpassword').reset);

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);


  app.route('/*')
    .get(function(req, res) {
      res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
    });
};
