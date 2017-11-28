const usersModel = require(MODELS + 'users');
const pphModel = require(MODELS + 'purchase_plan_history')
const siteSettingsModel = require(MODELS + 'settings')
const config = require('config');
const mailHelper = require(HELPERS + 'mail');
const commonHelper = require(HELPERS + 'common');
const register = async (req, res, next) => {
    try {
        req.body.roles = 'admin';
        let settings = [];
        settings['contact'] = {}
        let token = commonHelper.cryptPassword(new Date().toISOString(), 10);
        req.body.verify = {
            token
        };
        let user = await new usersModel(req.body).save();
        req.body.plan.user = user._id;
        console.log("user final", user._id);
        console.log("plan final", req.body.plan);
        let plan = await new pphModel(req.body.plan).save();
        user.subscription_plan = plan._id;
        await user.save();
        settings.contact.email = req.body.email;
        settings.contact.phone = req.body.phone;
        settings.dealer = user._id;
        settings.site_title = req.body.name;
        settings.manufactur = req.body.manufactur;
        mailHelper.sendMail('RegistrationNotificationToUser', {
            'email': req.body.email,
            'name': req.body.name,
            'token': token,
            'roles': 'admin',
            'url': config.get('baseUrl') + config.get('APIURLs.admin') + 'verify',
            'transactional_email': true
        });
        let site = await new siteSettingsModel(settings).save();
        return res.sendResponse({}, 'User has been successfully registered.');
    } catch (ex) {
        return next(ex);
    }
};
//verify the verification token
const verify = async (req, res, next) => {
    try {
        let token = req.body.token;
        let user = await usersModel.find({
            'verify.token': token,
            'verify.status': false
        });
        if (!user) throw new Error('Token is invalid.');
        user.verify.status = true;
        await usersModel.update({
            _id: user._id,
            'verify.status': true
        });
        return res.sendResponse(users, 'User has been verified.');
    } catch (ex) {
        return next(ex);
    }
};
module.exports = {
    register,
    verify
}