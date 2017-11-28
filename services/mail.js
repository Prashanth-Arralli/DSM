const mailer = require('node-mandrill');
const commonHelper = require(HELPERS + 'common');
sendMail = async(from, fName, to, toName, body, sub) => {
  let settings = await commonHelper.getSettings();
  console.log(settings.mandril_key, from)
  let mandrill = mailer(settings.mandril_key);
  // return new Promise((rs, rj) => {
    mandrill('/messages/send', {
      message: {
        to: [{
          email: to,
          name: toName
        }],
        from_email: from || settings.owner_mail,
        subject: sub,
        html: body
      }
    }, console.log);
  // })
};
const adminAddedUserNotification = (mail, details) => {
  (async() => {
    return await sendMail(undefined, mail, '', JSON.stringify(details))
  })();
};
const forgotPasswordNotification = (mail, details) => {
  (async() => {
    return await sendMail(undefined, mail, '', JSON.stringify(details))
  })();
};
const resetPasswordNotification = (mail, details) => {
  (async() => {
    return await sendMail(undefined, mail, '', JSON.stringify(details))
  })();
};
module.exports = {
  adminAddedUserNotification,
  resetPasswordNotification,
  forgotPasswordNotification,
  sendMail
};
