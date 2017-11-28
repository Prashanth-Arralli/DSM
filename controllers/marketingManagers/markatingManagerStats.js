const staticsModel = require(MODELS + 'markatingManagerStats');
const _m = require('moment');


const getStats = async(req, res, next) => {
    let month = _m().subtract(1, "M").toDate();
    month = _m(month).format("YYYYMM");
    console.log("month", month);
    where = {};
    where["statMonth"] = month;
    try {
        let statistics = await staticsModel.getStats(where);

        if (statistics) {
            return res.sendResponse({
                statistics
            }, 'stats has been added successfully.');
        } else {
            var start = _m().subtract(1, "M").startOf('month').toISOString();
            var end = _m().subtract(1, "M").endOf('month').toISOString();

            let start_date = new Date(start);
            let end_date = new Date(end);
            where = {
                "booked_at": {
                    $gte: new Date(start_date),
                    $lt: new Date(end_date)
                },
                "status": 1
            }
            await staticsModel.addStatistics(where);
            getStats(req, res, next);
        }
    } catch (ex) {
        return next(ex);
    }
}

module.exports = {
    getStats
}