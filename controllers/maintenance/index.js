const maintenanceModel = require(MODELS + 'oem_recommended_maintenance');
const preMaintenanceModel = require(MODELS + 'pre_approval_oem_recommended_maintenance');
const unitMaintenanceModel = require(MODELS + 'lkp_oem_recommended_maintenance_units');
const intervelMaintenanceModel = require(MODELS + 'lkp_oem_recommended_maintenance_interval_type');
const settingsModel = require(MODELS + 'settings');
const commonHelper = require(HELPERS + 'common');
const config = require('config');

const addPreMaintenance = async (req, res, next) => {
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
const queryPreMaintenance = async (req, res, next) => {
    try {
        let maintenance = await preMaintenanceModel.find().populate('interval_type').populate('unit').populate('service');
        return res.sendResponse({
            maintenance
        }, 'Maintenance has been fetched successfully.');
    } catch (ex) {
        return next(ex);
    }
}
const addUnit = async (req, res, next) => {
    // req.body['created_by'] = req.user.id;
    try {
        let maintenance = await new unitMaintenanceModel(req.body).save();
        return res.sendResponse({
            maintenance
        }, 'Maintenance has been added successfully.');
    } catch (ex) {
        return next(ex);
    }
}
const addIntervel = async (req, res, next) => {
    // req.body['created_by'] = req.user.id;
    try {
        let maintenance = await new intervelMaintenanceModel(req.body).save();
        return res.sendResponse({
            maintenance
        }, 'Maintenance has been added successfully.');
    } catch (ex) {
        return next(ex);
    }
}
const login = async (req, res, next) => {
    try {
        let settings = await settingsModel.findOne({
            'maintenance.password': req.body.password
        })
        if (settings == null) return next(new Error('Password is not vaild.'));
        else return res.sendResponse({
            status: true
        }, 'Maintenance has been added successfully.');
    } catch (ex) {
        return next(ex);
    }
}
const removePreMaintenance = async (req, res, next) => {
    try {
        let maintenance = await preMaintenanceModel.remove();
        return res.sendResponse({
            maintenance
        }, 'Maintenance has been removed successfully.');
    } catch (ex) {
        return next(ex);
    }
}
const removelogin = async (req, res, next) => {
    try {
        let settings = await settingsModel.findOne({
            'maintenance.key': req.body.password
        })
        if (settings == null) return next(new Error('Password is not vaild.'));
        else return res.sendResponse({
            status: true
        }, 'Maintenance has been added successfully.');
    } catch (ex) {
        return next(ex);
    }
}
module.exports = {
    addPreMaintenance,
    queryPreMaintenance,
    addUnit,
    addIntervel,
    login,
    removePreMaintenance,
    removelogin
}