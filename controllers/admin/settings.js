const settingsModel = require(MODELS + 'settings');
const commonHelper = require(HELPERS + 'common');
const config = require('config');


const query = async(req, res, next) => {
    try {
        let setting = await settingsModel.findOne({dealer: req.user._id});
        return res.sendResponse({
            setting
        }, 'Settings has been fecthed successfully.');
    } catch (ex) {
        return next(ex);
    }
};
const update = async(req, res, next) => {
    let _id = req.body._id;
    try {
        let setting = await settingsModel.findOneAndUpdate({
                _id
            },
            req.body, {
                new: true
            });
        setting = setting.toObject();
        delete setting._id;
        delete setting.__v;
        return res.sendResponse({
            setting
        }, 'Settings has been updated successfully.');
    } catch (ex) {
        return next(ex);
    }
};

module.exports = {
    query,
    update
}
