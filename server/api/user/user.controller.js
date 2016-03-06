'use strict';

var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var _= require('underscore');
var moment=require('moment-timezone');

var validationError = function(res, err) {
  return res.json(422, err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.find({}, '-salt -hashedPassword', function (err, users) {
    if(err) return res.send(500, err);
    res.json(200, users);
  });
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  var item=req.body;
  var address= item.location.formatted_address;
    var location={}; var loc=[];
   location.latitude=parseFloat(item.location.geometry.location.lat);
    location.longitude=parseFloat(item.location.geometry.location.lng);
   loc.push(location.latitude);
    loc.push(location.longitude);
    console.log(location); console.log("loc",loc);
  item=_.omit(item,'location');
  var userObj={};
	var receiverObj={},donorObj={},transporterObj={},companyObj={},foodRecoveryObj={},vehicleObj={};
	var prop;
		for(prop in item) {
			if (prop.indexOf('donor') > -1)
				donorObj[prop]=item[prop];
			if (prop.indexOf('receiver') > -1)
				receiverObj[prop]=item[prop];
			if (prop.indexOf('transporter') > -1)
				transporterObj[prop]=item[prop];
			if (prop.indexOf('vehicle') > -1)
				vehicleObj[prop]=item[prop];
			if (prop.indexOf('foodRecovery') > -1)
				foodRecoveryObj[prop]=item[prop];
			if (prop.indexOf('company') > -1)
				companyObj[prop]=item[prop];
		}
	userObj.donorInfo=donorObj;
	userObj.receiverInfo=receiverObj;
	userObj.transporterInfo=transporterObj;
	userObj.vehicleInfo=vehicleObj;
	userObj.foodRecoveryInfo=foodRecoveryObj;
	userObj.companyInfo=companyObj;
  var newUser = new User(userObj);
  newUser.name=item.loginName;
  newUser.email=item.email;
  newUser.registeredDate=moment().format();
  if(item.ein!=undefined)
	newUser.ein=item.ein;
  newUser.password=item.password;
  newUser.role=item.role;
  newUser.address=address;
  newUser.location=loc;
  newUser.status = 'inactive';//console.log("here1 ",newUser);
  newUser.save(function(err, user) {
    if (err) return validationError(res, err);
	if(err) console.log(err);
    var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
    res.json({token: token});
  });
};

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.send(401);
    res.json(user.profile);
  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if(err) return res.send(500, err);
    return res.send(204);
  });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.send(200);
      });
    } else {
      res.send(403);
    }
  });
};

// reset a users password:

exports.resetPassword = function(email) {
  var chars="abcdefghijklmnopqrstuvwxyz123456789"
  var newPass=''

  for (var i = 0; i < 8; i++){
    newPass += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  User.findOne({email: email}, function (err, user) {
    user.password = newPass;
    user.save(function(err) {
      if (err){
        console.log("error saving password");
      }
    });
  });

  return newPass;
};

/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.json(401);
    res.json(user);
  });
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};
