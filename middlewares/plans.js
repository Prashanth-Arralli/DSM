const plansModel = require(MODELS + 'plans');
const __m = require('moment')
exports.getPlan = async (req, res, next) => {
    try {
        if(!req.body.plan) throw new Error('Invalid Plan.');
        let plan = await plansModel.findOne({_id: req.body.plan});
        if(!plan)  throw new Error('Invalid Plan.');
        req.body.plan = {};
        req.body.plan = Object.assign({}, plan);
        req.body.plan.plan = req.body.plan._id;
        req.body.transaction_id = new Date().getTime();
        req.body.plan.starts = __m().toDate();
        req.body.plan.ends = __m().add(plan.days, 'days').toDate();
        delete req.body.plan._id;
        console.log(req.body.plan);
        return next();
    }
    catch (ex) {
        return next(ex);
    }
};
