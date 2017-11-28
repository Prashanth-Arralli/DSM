const usersModel = require(MODELS + 'users');
const config = require('config');
exports.authenticateAsAdmin = async(req, res, next) => {
    if (!req.headers['authorization'])
        return next(new Error('Token is not found.'));
    let token = req.headers['authorization'];
    try {
        req.user = await findAndUpdateUser(token, 'admin');
        next();
    } catch (ex) {
        return next(ex);
    }
};
exports.authenticateAsUser = async(req, res, next) => {
    if (!req.headers['authorization'])
        return next(new Error('Token is not found.'));
    let token = req.headers['authorization'];
    try {
        req.user = await findAndUpdateUser(token, 'user');
        next();
    } catch (ex) {
        return next(ex);
    }
};
exports.authenticateAsSrvceSchdlr = async(req, res, next) => {
    if (!req.headers['authorization'])
        return next(new Error('Token is not found.'));
    let token = req.headers['authorization'];
    try {
        req.user = await findAndUpdateUser(token, 'service_scheduler');
        next();
    } catch (ex) {
        return next(ex);
    }
};
exports.authenticateAsSrvcAdvsr = async(req, res, next) => {
    if (!req.headers['authorization'])
        return next(new Error('Token is not found.'));
    let token = req.headers['authorization'];
    try {
        req.user = await findAndUpdateUser(token, 'service_adviser');
        next();
    } catch (ex) {
        return next(ex);
    }
};
exports.authenticateAsMrktngMnger = async(req, res, next) => {
    if (!req.headers['authorization'])
        return next(new Error('Token is not found.'));
    let token = req.headers['authorization'];
    try {
        req.user = await findAndUpdateUser(token, 'marketing_manager');
        next();
    } catch (ex) {
        return next(ex);
    }
};
exports.authenticateAsUsdCarMnger = async(req, res, next) => {
    if (!req.headers['authorization'])
        return next(new Error('Token is not found.'));
    let token = req.headers['authorization'];
    try {
        req.user = await findAndUpdateUser(token, 'used_car_manager');
        next();
    } catch (ex) {
        return next(ex);
    }
};
exports.authenticateAsServiceInspection = async(req, res, next) => {
    if (!req.headers['authorization'])
        return next(new Error('Token is not found.'));
    let token = req.headers['authorization'];
    console.log(token);
    try {
        req.user = await findAndUpdateUser(token, 'vehicle​_inspection​');
        next();
    } catch (ex) {
        return next(ex);
    }
};
const findAndUpdateUser = async(token, role) => {
    let user = await usersModel.findOne({
        'roles': role,
        'accesstokens.token': token,
        '$or': [{
            'accesstokens.expiry': {
                '$gt': new Date()
            },
            'accesstokens.platform': 'web'
        }, {
            'accesstokens.platform': {
                '$ne': 'web'
            }
        }]
    });
    if (!user) throw new Error('Not authorized.');
    await usersModel.update({
        'accesstokens.token': token
    }, {
        '$set': {
            'accesstokens.$.expiry': new Date().getTime() + config.get('tokenExpiryBuffer')
        }
    });
    return user;
}
