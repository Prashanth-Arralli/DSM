const appointmentsModel = require(MODELS + 'appointments');
const _m = require('moment');

const getStats = async(req, res, next) => {
    if (req.query.start && req.query.end) {
            let start_date = new Date(req.query.start);
            let end_date = new Date(req.query.end);
            where = {
                "booked_at": {
                    $gte: new Date(start_date),
                    $lt: new Date(end_date)
                },
                "status": 1
            }
        }

    try {
        let where = {};
        if (req.query.start && req.query.end) {
            let start_date = new Date(req.query.start);
            let end_date = new Date(req.query.end);
            where = {
                "booked_at": {
                    $gte: new Date(start_date),
                    $lt: new Date(end_date)
                },
                "status": 1
            }
        }

        let services = {};
        let count = 0;

        let revenue = await appointmentsModel.getRevenue(where);
        let customer = await appointmentsModel.count(where);

        [services.service, count] = await Promise.all([appointmentsModel.topServicesCurrentMonth(where), appointmentsModel.topServicesCount(where)]);

        // let services = await appointmentsModel.topServicesCurrentMonth(where);

        services.count = count[0] ? count[0].count : 0;


        let body = {
            "revenue": revenue[0],
            "customer": customer,
            "services": services
        }

        return res.sendResponse({
            "revenue": revenue[0]? revenue[0].price : 0,
            "customer": customer,
            "services": services
        }, 'Stats fetched successfully');

    } catch (ex) {
        return next(ex);
    }

}

module.exports = {
    getStats
}