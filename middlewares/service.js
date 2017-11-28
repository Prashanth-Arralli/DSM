const servicesModel = require(MODELS + 'services');
exports.isServicesExist = async(req, res, next) => {
  if (!req.body.services || !req.body.services.length) {
    req.body.services = [];return next();
  }
  req.body.services = Array.isArray(req.body.services) ? req.body.services : [req.body.services];
  try {
    req.body.services = new Set(req.body.services);
    req.body.services = [...req.body.services];
    let isServicesExist = await servicesModel.isServicesExist(req.body.services);
    if (!isServicesExist) return next(new Error('Selected services are not available.'));
    next();
  } catch (ex) {
    next(ex);
  }
};
exports.getCostForServices = async(req, res, next) => {
  if (!req.body.services || !req.body.services.length) return next();
  try {
    req.body.price += await servicesModel.getCostForServices(req.body.services);
    next();
  } catch (ex) {
    next(ex);
  }
};
exports.calculateOfferPrice = async(req, res, next) => {
  if (!req.body.services || !req.body.services.length) return next();
  try {
    req.body.original_price = req.body.price;
    if(req.body.discount_type == 1){
       req.body.price = req.body.original_price - ((req.body.discount/ 100) * req.body.original_price.toFixed(2));
    }
    else if(req.body.discount_type == 2){
      req.body.price = (req.body.original_price - req.body.discount);
    }
    else if(req.body.discount_type == 3){
      req.body.price = req.body.discount;
    }
    if(req.body.original_price < req.body.price){
      return next(new Error('Discount price is going less than actual price.'));
    }
    if(req.body.price < 0){
      return next(new Error('Discount price is going less 0.'));
    }
    next();
  } catch (ex) {
    next(ex);
  }
};
