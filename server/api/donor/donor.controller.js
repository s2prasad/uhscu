'use strict';
var mongoose=require('mongoose');
var moment=require('moment-timezone');
var uniqueId=require('shortid32');
var User = require('../user/user.model');
var Transaction = require('../user/transaction.model');
var passport = require('passport');
var config = require('../../config/environment');
var smsConfig=require('../../../config.js');
var jwt = require('jsonwebtoken');
var sms=require('../sms/sms.controller.js');

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
 * Get receivers
 */



exports.searchReceivers = function(req, res, next) {
 var filters=req.body.filters; console.log("details******->",req.user);
 var location=req.user.location;console.log("filters...",filters);
 if(filters!={} && filters.receiverDistance!=undefined) {
     User.aggregate().near(
         {
             near: [location[1], location[0]],
             spherical: true,//filters.receiverDistance
             distanceField: 'location',
             distanceMultiplier: 3959,
             maxDistance: filters.receiverDistance / 3959,
             query: {
                 status: 'inactive', "receiverInfo.receiverPerishableItem": 'yes',
                 "receiverInfo.receiverRefrigeratedItem": 'yes'
             }
         })
         .exec(function (err, docs) {
             if (err) console.log(err);
             else {
                 console.log(docs)
                 res.json(docs);
             }
         });

 }
};
/**
 *
 */
exports.storeItems=function(req, res, next){
    var donor=req.user;
    var receiversArray=[];
    var itemDetails=[];
    var itemsList=req.body.items; console.log("itemsList",itemsList);
    var receivers=itemsList.receivers;
    var code=uniqueId.generate();
    var count=1;
    for(var item of itemsList.itemDescription){
        itemDetails.push(count+") Description:"+item.detail+"-Quantity:"+item.quantity);
        count++;
    }
    for(var receiver of receivers ){
        receiversArray.push({"contactName":receiver.foodRecoveryInfo.foodRecoveryContactName,
            "phone":receiver.foodRecoveryInfo.foodRecoveryContactPhone,
            "receiverId":receiver._id});console.log(receiver);
        var smsBodyReceiver="Food items of type "+itemsList.filterForReceiver.receiversFilterType.join(', ')+" is being donated. To accept this donation please reply this number" +
                " with code: "+code +"\nFood items include:\n "+itemDetails.join('\n ');
        var receiverPhone=receiver.foodRecoveryInfo.foodRecoveryContactPhone;receiverPhone="+14084930678";
        sms.sendSMS('broadcast-'+code,receiverPhone,smsBodyReceiver,function(result){
            console.log(result);
        });
    }
    var donorTransactionName=itemsList.transaction.name;
    var donorTransactionPhone=itemsList.transaction.phone;donorTransactionPhone="+14084930678";
    var smsBodyDonor="Hello "+donorTransactionName+", successfully sent sms to receivers, your transaction is in progress. The food types selected were: "
        +itemsList.filterForReceiver.receiversFilterType.join(', ')+".\nThe donation item includes:\n "+itemDetails.join('\n ')
        +".\nYou will receive an sms when someone accepts donation. Transaction is stopped after first receiver accepts. No receivers are accepted after 24 hours from now and transaction is automatically stopped.";
    sms.sendSMS('Notification-'+code,donorTransactionPhone,smsBodyDonor,function(result){
        console.log(result);
    });
    var newTransaction = new Transaction();
    newTransaction.receivers=receiversArray;
    newTransaction.itemDescription=itemsList.itemDescription;
    newTransaction.filterForReceiver=itemsList.receiversFilterType;
    newTransaction.transactionDate=moment().format();
    newTransaction.transactionId=code+moment().format('MMDDYYYYHHmm');
    newTransaction.code=code;
    newTransaction.donor={"phone":donorTransactionPhone,"contactName":donorTransactionName,"donorId":donor._id};
    newTransaction.save(function(err, user) {
        if(err) res.status(400).json(newTransaction)
    })
    res.status(200).json(newTransaction);
};

/**
 * Authentication callback
 */

//var sendReceivers= exports.sendReceivers=function(code,text,to){
//   //callback("itshere::",text,to,code);
//    sms.sendSMS('broadcast-'+code,'+14084930678',text,function(result){
//        console.log(result);
//        return result
//    });
//};


exports.authCallback = function(req, res, next) {
  res.redirect('/');
};
