const usersModel = require(MODELS + 'users');
const commonHelper = require(HELPERS + 'common');
const mailServices = require(SERVICES + 'mail');
const config = require('config');
const add = async(req, res, next) => {
    req.body['created_by'] = req.user.id;
    req.body['dealer'] = req.user.id;
    try {
        let isExist = await usersModel.findOne({
            'email': req.body.email
        });
        if (!isExist) {
            let user = await new usersModel(req.body).save();
            user = user.toObject();
            mailServices.adminAddedUserNotification(user.email, user); //notify user
            return res.sendResponse({
                user
            }, 'user has been added successfully.');

        }
        else{
            return next(Error('A User with email ID '+req.body.email+' already exists. Please enter another email ID'));
        }
    } catch (ex) {
        return next(ex);
    }
};
const remove = async(req, res, next) => {
    let _id = req.params.id;
    try {
        let user = await usersModel.remove({
            _id
        });
        return res.sendResponse({
            _id
        }, 'user has been removed successfully.');
    } catch (ex) {
        return next(ex);
    }
};
const query = async(req, res, next) => {
    let {
        where,
        skip,
        limit,
        sort
    } = commonHelper.paginateQueryAssigner(req.query);
    try {
        where['dealer'] =req.user._id;
        let users = await usersModel.paginateData(
            where,
            skip,
            limit,
            sort
        );
        let count = await usersModel.count(where);
        return res.sendResponse({
            users,
            count
        }, 'users has been fecthed successfully.');
    } catch (ex) {
        return next(ex);
    }
};
const update = async(req, res, next) => {
    let _id = req.params.id;
    delete req.body.email;
    try {
        let user = await usersModel.findOneAndUpdate({
                _id
            },
            req.body, {
                new: true
            });
        user = user.toObject();
        return res.sendResponse({
            user
        }, 'user has been updated successfully.');
    } catch (ex) {
        return next(ex);
    }
};
const fetchSingle = async(req, res, next) => {
    let _id = req.params.id;
    try {

        let user = await usersModel.findOne({
            _id
        }).select('name email icon id roles phone');
        return res.sendResponse({
            user
        }, 'user has been fecthed successfully.');
    } catch (ex) {
        return next(ex);
    }
};
module.exports = {
    add,
    remove,
    query,
    update,
    fetchSingle
}