const maintenanceModel = require(MODELS + 'oem_recommended_maintenance');
const preMaintenanceModel = require(MODELS + 'pre_approval_oem_recommended_maintenance');
const commonHelper = require(HELPERS + 'common');
const config = require('config');
var csvReader = require('csvreader');
const vehicleModel = require(MODELS + 'vehicles');
const saveMaintenance = async (req, res, next) => {
    // req.body['created_by'] = req.user.id;
    try {
        let maintenance = await new preMaintenanceModel(req.body).save();
        maintenance = maintenance.toObject();
        return res.sendResponse({
            maintenance
        }, 'Maintenance has been added successfully.');
    } catch (ex) {
        return next(ex);
    }
}
const saveRecommendMaintenance = async (req, res, next) => {
    // req.body['created_by'] = req.user.id;
    try {
        let maintenance = await new maintenanceModel(req.body).save();
        maintenance = maintenance.toObject();
        return res.sendResponse({
            maintenance
        }, 'Maintenance has been added successfully.');
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
        let maintenance = await maintenanceModel.paginateDataQuery(
            where,
            skip,
            limit,
            sort
        );
        let count = await maintenanceModel.count(where);
        return res.sendResponse({
            maintenance,
            count
        }, 'Maintenance has been fetched successfully.');
    } catch (ex) {
        return next(ex);
    }
}
const queryPre = async (req, res, next) => {
    // req.body['created_by'] = req.user.id;
    try {
        let maintenance = await preMaintenanceModel.find();
        return res.sendResponse({
            maintenance
        }, 'Maintenance has been fetched successfully.');
    } catch (ex) {
        return next(ex);
    }
}
const copyPreToApprove = async (req, res, next) => {
    // req.body['created_by'] = req.user.id;
    try {
        let premaintenance = await preMaintenanceModel.find();
        let maintenance = await maintenanceModel.insertMany(premaintenance);
        let remaintenance = await preMaintenanceModel.remove();
        return res.sendResponse({
            maintenance
        }, 'Maintenance has been fetched successfully.');
    } catch (ex) {
        return next(ex);
    }
}
const searchMaintenance = async (req, res, next) => {
    try {
        let vin = req.query.key;
        let skip = parseInt(req.query.skip);
        let limit = parseInt(req.query.limit);
        let vwhere = {};
        let where = {};
        let sort = req.query.sort;
        if (vin) {
            vwhere["vin"] = {
                $regex: vin,
                $options: 'i'
            };  
            delete vin;
            let vehicle = await vehicleModel.findOne(vwhere).select('vin vehicle_id ');
            if (vehicle === null) throw new Error('Vehicle not found.');
            where["vehicle_id"] = vehicle.vehicle_id;
        }
        let maintenance = await maintenanceModel.paginateDataQuery(
            where,
            skip,
            limit,
            sort
        );
        let count = await maintenanceModel.count(where);
        return res.sendResponse({
            maintenance,
            count
        }, "users fetched successfully");
    } catch (ex) {
        return next(ex);
    }
}
const deleteMaintenance = async(req, res, next) => {
    let _id = req.params.id;
    try {
        let maintenance = await maintenanceModel.remove({
            _id
        });
        return res.sendResponse({
            maintenance
        }, 'Recall has been removed successfully.');
    } catch (ex) {
        return next(ex);
    }

}
module.exports = {
    saveMaintenance,
    query,
    queryPre,
    copyPreToApprove,
    saveRecommendMaintenance,
    searchMaintenance,
    deleteMaintenance
}
