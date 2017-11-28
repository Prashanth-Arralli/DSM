const vehicleModel = require(MODELS + 'vehicles');
const appointmentModel = require(MODELS + 'appointments');
const leaseModel = require(MODELS + 'lease_expiry');
const commonHelper = require(HELPERS + 'common');
const mailServices = require(SERVICES + 'mail');
var csvReader = require('csvreader');
const config = require('config');
const add = async (req, res, next) => {
    req.body['created_by'] = req.user.id;
    req.body['dealer'] = req.user.id;
    try {
        let vehicle = await new vehicleModel(req.body).save();
        vehicle = vehicle.toObject();
        return res.sendResponse({
            user
        }, 'vehicle has been added successfully.');
    } catch (ex) {
        return next(ex);
    }
};
const remove = async (req, res, next) => {
    let _id = req.params.id;
    let vin = req.params.id;
    try {
        let vehicle = await vehicleModel.remove({
            _id
        });
        let appointment = await appointmentModel.remove({
            vin
        })
        return res.sendResponse({
            _id
        }, 'vehicle has been removed successfully.');
    } catch (ex) {
        return next(ex);
    }
};
const query = async (req, res, next) => {
    let {
        where,
        skip,
        limit,
        sort
    } = commonHelper.paginateQueryAssigner(req.query);
    try {
        let vehicle = await vehicleModel.paginateData(
            where,
            skip,
            limit,
            sort
        );
        let count = await vehicleModel.count(where);
        return res.sendResponse({
            vehicle,
            count
        }, 'Vehicle has been fecthed successfully.');
    } catch (ex) {
        return next(ex);
    }
};
const update = async (req, res, next) => {
    let _id = req.params.id;
    delete req.body.email;
    try {
        let vehicle = await vehicleModel.findOneAndUpdate({
            _id
        },
            req.body, {
                new: true
            });
        user = user.toObject();
        return res.sendResponse({
            vehicle
        }, 'Vehicle has been updated successfully.');
    } catch (ex) {
        return next(ex);
    }
};
const fetchSingle = async (req, res, next) => {
    let _id = req.params.id;
    try {

        let vehicle = await vehicleModel.findOne({
            _id
        }).select('name email icon id roles phone');
        return res.sendResponse({
            vehicle
        }, 'Vehicle has been deleted successfully.');
    } catch (ex) {
        return next(ex);
    }
};
const removeAll = async (req, res, next) => {
    try {

        let vehicle = await vehicleModel.remove();
        let appointment = await appointmentModel.remove();
        return res.sendResponse({
            vehicle
        }, 'Vehicle has been fecthed successfully.');
    } catch (ex) {
        return next(ex);
    }
};
const addLeaseExpiry = async (req, res, next) => {
    var expirydata = {};
    var already = [];
    var count = 0;
    try {
        const recordHandler = async (data) => {
            expirydata['acct'] = data[0];
            expirydata['first_name'] = data[1];
            expirydata['middle_name'] = data[2];
            expirydata['last_name'] = data[3];
            expirydata['address1'] = data[4];
            expirydata['address2'] = data[5];
            expirydata['city'] = data[6];
            expirydata['state'] = data[7];
            expirydata['zip5'] = data[8];
            expirydata['zip4'] = data[9];
            expirydata['make'] = data[10];
            expirydata['model'] = data[11];
            expirydata['year'] = data[12];
            expirydata['vin'] = data[13];
            expirydata['phone'] = data[14];
            expirydata['lease_expiry'] = data[15];
            expirydata['title_lease_placer'] = data[16];
            let acct = data[0];
            let lease = await leaseModel.findOne({
                acct
            });
            if (lease != null) {
                already.push({
                    acct
                })
            } else {
                let check = await new leaseModel(expirydata).save();
            }
        }
        function headerLineHandler(data) {
            console.log(data[0], data[1]);
        }
        var options = {
            skip: 5,
            hasHeaders: true,
            headerRecordHandler: headerLineHandler
        };
        csvReader
            .read(req.body.file.path, recordHandler, options)
            .then(() => {
                return res.sendResponse({
                    already
                }, 'Recall added successfully');
            })
            .catch(err => {
                console.error(err);
            });

        // csvReader
        //     .read(req.body.file.path) = async (data, err) => {
        //         if (count != 0) {

        //         }
        //         count++;
        //     }

    } catch (ex) {
        return next(ex);
    }
};
const getLeaseExpiry = async (req, res, next) => {
    let {
        where,
        skip,
        limit,
        sort
    } = commonHelper.paginateQueryAssigner(req.query);
    try {
        let expiry = await leaseModel.paginateData(
            where,
            skip,
            limit,
            sort
        );
        let count = await leaseModel.count(where);
        return res.sendResponse({
            expiry,
            count
        }, 'Lease expiry has been fecthed successfully.');
    } catch (ex) {
        return next(ex);
    }
};
const removeLeaseExpiry = async (req, res, next) => {
    try {

        let lease = await leaseModel.remove();
        return res.sendResponse({
            lease
        }, 'Lease expiry has been deleted successfully.');
    } catch (ex) {
        return next(ex);
    }
};
const searchLeaseExpiry = async (req, res, next) => {
    try {
        let vin = req.query.vin;
        let skip = parseInt(req.query.skip);
        let limit = parseInt(req.query.limit);
        let where = {};
        let sort = req.query.sort;
        if (vin) {
            where["vin"] = {
                $regex: vin,
                $options: 'i'
            };
            delete vin;
        }
        let expiry = await leaseModel.paginateData(
            where,
            skip,
            limit,
            sort
        );
        let count = await leaseModel.count(where);
        return res.sendResponse({
            expiry,
            count
        }, 'Lease expiry has been fecthed successfully.');
    } catch (ex) {
        return next(ex);
    }
}
module.exports = {
    add,
    remove,
    query,
    update,
    fetchSingle,
    removeAll,
    getLeaseExpiry,
    addLeaseExpiry,
    removeLeaseExpiry,
    searchLeaseExpiry
}
