/**
 * Created by vyompv on 2/28/2016.
 */
var moment=require('moment-timezone');
var config= require('../../../config.js');
var client = require('twilio')(config.twilio.ACCOUNT_SID, config.twilio.AUTH_TOKEN);
var sms = require('./sms.model.js');
var logger = require('tracer').console(config.loggerOptions);
var smsReceive = sms.receivedLogs;
var smsSent = sms.sentLogs;


var sendSMS = exports.sendSMS= function(type,toPhone,smsbody,callBack) {
    var fromPhone=config.twilio.NUMBER;
    client.sendMessage({
        to:toPhone, from: fromPhone,body: smsbody
    }, function (err, responseData) {
        if (err)logger.log(err);
        if (!err) {
            var response="Sent sms successfully to: "+responseData.to+" with body: "+responseData.body;
            var newMsg = new smsSent();
            newMsg.to=toPhone;
            newMsg.from=fromPhone;
            newMsg.type=type;
            newMsg.body=smsbody;
            newMsg.date=moment().format();
            newMsg.save(function (err) {
                if(err){
                    callBack(":Error while saving data::"+response);
                }
                else callBack(response);
            });
        }
    });
}

var receiveSMS=exports.receiveSMS =function(req,res,next){
    var content=req.body;
    var newMsg = new smsReceive();
    newMsg.to=content.To;
    newMsg.from=content.From;
    newMsg.smssid=content.MessageSid;
    newMsg.body=content.Body;
    newMsg.date=moment().format();
    newMsg.save(function (err) {
        if(err){
            res.json(401);
        }
        else next("success");
    });
}
//
//sendSMS('+14083342547',config.twilio.NUMBER,"hello there",function(result){
//    console.log(result)
//});