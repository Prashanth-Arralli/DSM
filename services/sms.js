const mailer = require('node-mandrill');
var config = require('config');

var twilio = require('twilio');
var twillio_credentials = config.get('twillio_credentials.live.twillio');
var server;

var client = new twilio(twillio_credentials.accountSid, twillio_credentials.authToken);
exports.sendMessage = async(number, msg, cb) => {
        console.log("Message " + msg);
        console.log("************************************");
   

client.messages.create({
    body: msg,
    to: '+91 95665 21569',  // Text this number
    from: twillio_credentials.from // From a valid Twilio number
}, function(err, data){
        if(err)  cb(err);
        cb(data);
    })
};
