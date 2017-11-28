const offersModel = require(MODELS + 'offers');
exports.isOffersExist = async(req, res, next) => {
  if (!req.body.offers.length) return next();
  req.body.offers = Array.isArray(req.body.offers) ? req.body.offers : [req.body.offers];

  if (!req.body.offers.length) return next();
  try {
    req.body.offers = new Set(req.body.offers);
    req.body.offers = [...req.body.offers];
    let isOffersExist = await offersModel.isOffersExist(req.body.offers);
    if (!isOffersExist) return next(new Error('Offers are not exist.'));
    next();
  } catch (ex) {
    next(ex);
  }
};
exports.getCostForOffers = async(req, res, next) => {
  let offers = req.body.offers;
  if (!offers.length) return next();
  try {
    req.body.price += await offersModel.getCostForOffers(offers);
    next();
  } catch (ex) {
    next(ex);
  }
};
exports.excludeServicesByOffer = async(req, res, next) => {
  if (!req.body.offers.length || !req.body.services.length) return next();
  try {
    let {
      services,
      excluded_services
    } = await offersModel.excludeServicesByOffer(
      req.body.offers,
      req.body.services
    );
    req.body.services = services;
    res.locals.excluded_services = excluded_services;
    // return res.json(req.body);
    next();
  } catch (ex) {
    next(ex);
  }
};
