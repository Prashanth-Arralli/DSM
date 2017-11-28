const makesModel = require(MODELS + 'makes');
const modelsModel = require(MODELS + 'models');
const commonHelper = require(HELPERS + 'common');
const config = require('config');

const query = async (req, res, next) => {
    try {
        let models = await modelsModel.find();
        return res.sendResponse({
            models,
        }, 'Models has been fecthed successfully.');
    } catch (ex) {
        return next(ex);
    }
};
const queryModels = async (req, res, next) => {
    try {
        let make = req.params.id;
        let models = await modelsModel.find({
            make
        });
        return res.sendResponse({
            models,
        }, 'Models has been fecthed successfully.');
    } catch (ex) {
        return next(ex);
    }
};
module.exports = {
    query,
    queryModels,
}
