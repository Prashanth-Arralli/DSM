const eTemplateModel = require(MODELS + 'email_templates');
const commonHelper = require(HELPERS + 'common');
const mailService = require(SERVICES + 'mail');
const emailLogger = require(MODELS + 'emailLogger');
const hbs = require('express-hbs');
hbs.registerHelper('ifCond', function (v1, v2, options) {
  if (v1 === v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});
const parseTemplate = async(templateName, detail, parseSubject) => {
  let template = await eTemplateModel.findOne({
    identifier: templateName
  });
  if (template === null) throw new Error('Template not found.');

  let compiledData, body, subject;
  compiledData = hbs.compile(template.body);
  body = compiledData(detail);
  if (parseSubject) {
    compiledData = hbs.compile(template.subject);
    subject = compiledData(detail);
  } else subject = template.subject;
  return {
    body,
    subject
  };
};
const RecallNotificationForAdviser = async(template, detail) => {
  let {
    body,
    subject
  } = await parseTemplate(template, detail, true);
  let settings = await commonHelper.getSettings();
  let to = settings.owner_mail;
  let toName = 'Admin';
  return {
    from: to,
    fName: toName,
    to: to,
    toName: toName,
    body: body,
    subject: subject
  }
};
const RegistrationNotificationToUser = async(template, detail) => {
  let settings = await commonHelper.getSettings();
  let from = settings.owner_mail;
  let name = settings.site_title;
  detail = detail || {};
  detail.site_name = settings.site_title;
  let {
    body,
    subject
  } = await parseTemplate(template, detail, true);
  return {
    from: from,
    fName: name,
    to: detail.email,
    toName: detail.name,
    body: body,
    subject: subject
  }
};
const sendMail = async(template, detail) => {
  try {
    let {
      from,
      fName,
      to,
      toName,
      body,
      subject
    } = await templates[template](template, detail);
    let dealerPlan = {
      transactional_email: true,
      transactional_sms: true,
      marketing_email_count: 1,
      marketing_sms_count: 1
    }
    if(detail.dealer) {
      dealerPlan = await commonHelper.getDealerPlan(detail.dealer);
    }
    if((dealerPlan.marketing_email_count && detail.marketing_email) || detail.transactional_email) {
      mailService.sendMail(from,
        fName,
        to,
        toName,
        body,
        subject);
        if(detail.marketing_email) {
          await commonHelper.decrementMarketingEmail(detail.dealer);
        }
    }
    else {
      await new emailLogger({
        from,
        fName,
        to,
        toName,
        body,
        subject
      }).save();
    }
  } catch (ex) {
    console.dir(ex.message + '. triggered at ' + new Date() + '. template name ' + template);
  }
};
const templates = {
  RecallNotificationForAdviser,
  RegistrationNotificationToUser
};
module.exports = {
  sendMail
};
