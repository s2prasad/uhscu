'use strict';

var User = require('../user/user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var request=require('request')

var validationError = function(res, err) {
  return res.json(422, err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.find({ role: { $ne: 'admin' } }, '-salt -hashedPassword', function (err, users) {
    if(err) return res.send(500, err);
    res.status(200).json(users);
  });
};

/**
 * Creates a new user
 */
//exports.create = function (req, res, next) {
//  var newUser = new User(req.body);
//  newUser.provider = 'local';
//  newUser.status = 'inactive';
//  newUser.save(function(err, user) {
//    if (err) return validationError(res, err);
//    var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
//    res.json({ token: token });
//  });
//};

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
 * *Get Tax id info from api
 * @param req
 * @param res
 */
exports.getNonProfitInfo= function(req, res) {
	var ein=req.body.ein;
var options = { method: 'GET',
  url: 'https://projects.propublica.org/nonprofits/api/v1/organizations/'+ein+'.json',
};

request(options, function (error, response, body) {
	console.log(body);
  if (error) throw new Error(error);
  return res.json(body);
});
};

/**
 * Updated the user activation status
 */
exports.editUser = function(req, res) {
  var user=req.body.user;
console.log("inside admin/edit  controller",req.body.user.email);
  var findUserAndUpdateStatus=User.findOneAndUpdate({"email":user.email},{"status":user.status},{new:true});
  findUserAndUpdateStatus.exec(function (err, updatedUser) { console.log("insideadminontroller",updatedUser);
    if(updatedUser!=null && !err){
      return res.status(200).json({result:"success",details:updatedUser});
    }
    else if(err) return res.status(200).json({result:"failed",error:err});
    else return res.status(200).json({result:"failed"});
  });

};
/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};
