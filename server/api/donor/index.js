'use strict';

var express = require('express');
var controller = require('./donor.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole('donor'), controller.index);
router.post('/getReceivers', auth.isAuthenticated(), controller.searchReceivers);
//router.get('/me', auth.isAuthenticated(), controller.me);
//router.get('/:id', auth.isAuthenticated(), controller.show);
//
//router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
//
//router.post('/me', controller.me);
//router.post('/', controller.create);
//
//router.delete('/:id', auth.hasRole('admin'), controller.destroy);

module.exports = router;
