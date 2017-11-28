const makesModel = require(MODELS + 'makes');
const modelsModel = require(MODELS + 'models');
const commonHelper = require(HELPERS + 'common');
const config = require('config');

const query = async (req, res, next) => {
    try {
        let makes = await makesModel.find();
        return res.sendResponse({
            makes,
        }, 'Makes has been fecthed successfully.');
    } catch (ex) {
        return next(ex);
    }
};
module.exports = {
    query,
}
