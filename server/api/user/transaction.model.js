/**
 * Created by vyompv on 3/4/2016.
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TransactionSchema = new Schema({
    transactionId: String,
    transactionDate:String,
    itemDescription: String,
    messageDetails: String,
    transactionClosedDate:String,
    filterForReceiver: String,
    donator: String,
    receivers: Array,
    donationStatus:{ type: String, default: 'Failed' },
    acceptor:String
});


module.exports = mongoose.model('Transaction', TransactionSchema);