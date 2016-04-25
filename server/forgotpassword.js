var nodemailer = require('nodemailer');
var user = require('./api/user/user.controller.js');
var config = require('./config/environment');

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'urbanharvesterscu@gmail.com',
        pass: 'Scu@987654'
    }
});


exports.reset = function(req, res) {
    // setup e-mail
    var newPass = user.resetPassword(req.query.email);

    var mailOptions = {
        from: 'SnapIt Team <urbanharvesterscu@gmail.com>', // sender address
        to: req.query.email,
        subject: 'New UrbanHarvester password.', // Subject line
        html: '<b>Your new password is ' + newPass + '.  </b><a href='+config.url+'"/login">Login here.</a>' // html body
    };

    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        }else{
            console.log('Message sent: ' + info.response);
        }
    });

    res.end();
};