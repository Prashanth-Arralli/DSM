const settingsModel = require(MODELS + 'settings');
const commonHelper = require(HELPERS + 'common');
const config = require('config');
//Query of site settings
const query = async(req, res, next) => {
    try {
        let setting = await settingsModel.find();
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
