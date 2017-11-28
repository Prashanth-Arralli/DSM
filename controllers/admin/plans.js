const PlanModel = require(MODELS + 'plans');
const commonHelper = require(HELPERS + 'common');
const config = require('config');
const savePlan = async (req, res, next) => {
    try {
        let Plan = await new PlanModel(req.body).save();
        Plan = Plan.toObject();
        return res.sendResponse({
            Plan
        }, 'Plan has been added successfully.');
    } catch (ex) {
        return next(ex);
    }
}
const query = async (req, res, next) => {
    let {
        where,
        skip,
        limit,
        sort
    } = commonHelper.paginateQueryAssigner(req.query);
    try {
        let Plan = await PlanModel.paginateData(
            where,
            skip,
            limit,
            sort
        );
        let count = await PlanModel.count(where);
        return res.sendResponse({
            Plan,
            count
        }, 'Plan has been fetched successfully.');
    } catch (ex) {
        return next(ex);
    }
}
const deletePlan = async(req, res, next) => {
    let _id = req.params.id;
    try {
        let Plan = await PlanModel.remove({
            _id
        });
        return res.sendResponse({
            Plan
        }, 'Recall has been removed successfully.');
    } catch (ex) {
        return next(ex);
    }

}
module.exports = {
    savePlan,
    query
}
