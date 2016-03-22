/**
 * Created by vyompv on 2/28/2016.
 */
var moment=require('moment-timezone');
var config= require('../../../config.js');
var client = require('twilio')(config.twilio.ACCOUNT_SID, config.twilio.AUTH_TOKEN);
var sms = require('./sms.model.js');
var logger = require('tracer').console(config.loggerOptions);
var User = require('../user/user.model');
var Transaction = require('../user/transaction.model');
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
            res.status(401).json(err);
        }
        else next("success");
    });
    validateSMS(newMsg);
};

var validateSMS= function(message){
    var type="CodeReplyMsg";
    var smsbody=message.body.toUpperCase().trim();
    var phone=message.from;
    var from=phone.substring((phone.length-10), phone.length);
    var isReceiver= User.findOne({"foodRecoveryInfo.foodRecoveryContactPhone":from});
    var isValidCode= Transaction.findOne({code:smsbody,transactionDate:{ $lte:moment().format(), $gt:moment().subtract('24','hours').format()}});
    var isValidCodeReceiver= Transaction.findOne({code:smsbody,"receivers.phone":from,transactionDate:{ $lte:moment().format(), $gt:moment().subtract('24','hours').format()}},
        {itemDescription:1,donationStatus:1,code:1,donor:1,transactionDate:1,transactionId:1,'receivers.$':1,'acceptor':1} )
    .populate('receivers.receiverId donor.donorId acceptor.receiverId');//check inprogress or completed  or if same from then resend details.
    var isCodeExpiredElseUpdate=Transaction.findOne({code:smsbody,donationStatus:'Inprogress',transactionDate:{ $lte:moment().format(), $gt:moment().subtract('24','hours').format()},"receivers.phone": from},
                                {itemDescription:1,donationStatus:1,code:1,donor:1,transactionDate:1,transactionId:1,'receivers.$':1,$isolated : 1} )
                                .populate('receivers.receiverId donor.donorId');
    var isReceiverMsg="You are not a valid receiver";
    var isValidCodeMsg="Your entered code is invalid. Please reply the message with only given 4 character code.";
    var isValidCodeReceiveCodeExp="Sorry the code "+smsbody+" has expired. Someone has accepted donation before you.";
    var isCodeExpiredElseUpdateMsg="Your code "+smsbody+" has been accepted.";
    var isValidCodeReceiveErrorMsg="You are not a valid user for this code "+smsbody;
    var errorMsg="Unable to process the message. Please try again";
    var nonActiveMessage ="Your profile is not active. You are not authorized to send this code. Please contact urbanharvester.";
    isCodeExpiredElseUpdate.exec(function (err, result) {
        if(err) sendSMS(type,phone,errorMsg,function(result){console.log(result);});
        else if(result!=null){ console.log("isCodeExpiredElseUpdate result",result);//console.log(result.receivers)
            var receiverObj=result.receivers[0].receiverId;
            var donorObj= result.donor.donorId;
            var donorPhone=result.donor.phone;
            var donorContactName=result.donor.contactName;
            var donorMsg="Hello "+donorContactName+",your transaction for code "+result.code+" is now completed. Receiver "+receiverObj.name+" from "+receiverObj.address+" has accepted the donation." +
                " Their contact person name is "+receiverObj.name+" and contact number is "+from+". Thank you for transaction with Urban Harvester.";
            var receiverMsg="The donation store address is "+donorObj.address+" and the contact person name "+donorContactName+", Phone number: "+donorPhone;
            isCodeExpiredElseUpdateMsg=isCodeExpiredElseUpdateMsg+" "+receiverMsg;
            var updateTransaction=new Transaction({"_id":result._id ,donationStatus:"Completed"},{ versionKey: '1' });//change to completed
            updateTransaction.isNew = false;console.log("receiverObj->",receiverObj);
            updateTransaction.acceptor={receiverId:receiverObj._id};
            console.log("from here->",updateTransaction);
            updateTransaction.save(function (err) {
                if(err){console.log(err)
                    sendSMS(type,phone,errorMsg,function(result){console.log(result);});
                }
                else {
                    sendSMS(type,phone,isCodeExpiredElseUpdateMsg,function(result){console.log(result);});
                    sendSMS(type,donorPhone,donorMsg,function(result){console.log(result);});
                }
            });
        }
        else{
            isValidCodeReceiver.exec(function (err, result) {
                if(err) sendSMS(type,phone,errorMsg,function(result){console.log(result);});
                else if(result!=null){
                    var donorObj= result.donor.donorId;
                    var donorPhone=result.donor.phone;
                    var donorContactName=result.donor.contactName; console.log("Result->",result);
                    var acceptorObj=result.acceptor.receiverId;console.log("donorObj",donorObj);
                    var resendDonorDetails="You have already accepted the donaion. Please visit and collect the donation. The donation store address is "+donorObj.address+" and the contact person name "+donorContactName+", Phone number: "+donorPhone;
                    if(result.donationStatus=='Completed' && acceptorObj.foodRecoveryInfo.foodRecoveryContactPhone==from)
                        sendSMS(type,phone,resendDonorDetails,function(result){console.log(result);});
                    else if( result.acceptor!=from)
                        sendSMS(type,phone,isValidCodeReceiveCodeExp,function(result){console.log(result);});
                }
                else{
                    isReceiver.exec(function (err, result) {
                        if(err) sendSMS(type,phone,errorMsg,function(result){console.log(result);});
                        else if(result!=null){
                            var receiverObj=result.receivers[0].receiverId;
                            if(receiverObj.status=='Inactive')
                                sendSMS(type,phone,nonActiveMessage,function(result){console.log(result);});
                            else sendSMS(type,phone,isValidCodeMsg,function(result){console.log(result);});
                        }
                        else{
                            isValidCode.exec(function (err, result) {
                                if(err) sendSMS(type,phone,errorMsg,function(result){console.log(result);});
                                else if(result!=null){
                                    //check code validity
                                    sendSMS(type,phone,isReceiverMsg,function(result){console.log(result);});
                                }
                                else{
                                    validCodeMsg="Pleases send the valid code from valid receiver number.";
                                    sendSMS(type,phone,validCodeMsg,function(result){console.log(result);});
                                }
                            });
                        }
                    });
                }
            });
        }
    });

};
//
//sendSMS('+14083342547',config.twilio.NUMBER,"hello there",function(result){
//    console.log(result)
//});