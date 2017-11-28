const lkpRecallModel = require(MODELS + 'def_nhtsa_recall');
const vehiclesModel = require(MODELS + 'vehicles');
exports.getRecall = async () => {
    if (!req.body.recalls)
        return next(new Error('Recalls should be present.'));
    //adding predefined data
    req.body.price = 0;
    req.body.user = req.user._id;
    req.body.created_by = req.user._id;
    req.body.type = 3;
    req.body.service_status = {
        "description": "Your appointment is not yet been confirmed.",
        "status": 1,
        "created_at": new Date()
    };
    req.body.service_logs = [{
        "description": "Your appointment is not yet been confirmed.",
        "status": 1,
        "created_at": new Date()
    }]
    next();
}