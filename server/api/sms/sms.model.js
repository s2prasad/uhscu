/**
 * Created by vyompv on 2/28/2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var receivedLogsSchema = new Schema({
    from: String,
    to: String,
    body: String,
    date: String,
    smssid: String,
});

var sentLogsSchema = new Schema({
    from: String,
    to: String,
    body: String,
    date: String,
    type: String,
});

module.exports.receivedLogs = mongoose.model('receivedLogs', receivedLogsSchema);
module.exports.sentLogs = mongoose.model('sentLogs', sentLogsSchema);