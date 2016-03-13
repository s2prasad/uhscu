/**
 * Created by vyompv on 3/4/2016.
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//var User = require('./user.model');

var TransactionSchema = new Schema({
    transactionId: String,
    code: String,
    transactionDate:String,
    itemDescription: Array,
    messageDetails: String,
    transactionClosedDate:String,
    filterForReceiver: Object,
    donor: {"phone":String,"contactName":String,"donorId":{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }},
    receivers: [{"phone":String,"contactName":String,"receiverId":{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}}],
    donationStatus:{ type: String, default: 'Inprogress' },
    acceptor:{"receiverId":{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}}
});


module.exports = mongoose.model('Transaction', TransactionSchema);