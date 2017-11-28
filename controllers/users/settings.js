const settingsModel = require(MODELS + 'settings');
const commonHelper = require(HELPERS + 'common');
const config = require('config');


const query = async(req, res, next) => {
    try {
        let setting = await settingsModel.find().select(' site_title currency pricing_unit contact site_logo paypal_email google_link facebook_link twitter_link social_providers appointment_hour_buffer');
        setting = setting[0];
        return res.sendResponse({
          setting
        }, 'Settings has been fecthed successfully.');
    } catch (ex) {
        return next(ex);
    }
};
module.exports = {
    query
}
