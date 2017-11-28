const servicesModel = require(MODELS + 'services');
const appointmentsModel = require(MODELS + 'appointments');
const statsModel = require(MODELS + 'markatingManagerStats');

const commonHelper = require(HELPERS + 'common');
const _m = require('moment');

const getServicesList = async(req, res, next) => {
  let {
    where,
    skip,
    limit,
    sort
  } = commonHelper.paginateQueryAssigner(req.query);
  if (req.query.recommended) {
    where['recommended'] = {
      "$gte": parseInt(req.query.recommended)
    };
  }
  where['status'] = true;
  if(req.query.make){
    where['make']= req.query.make;
  }
  if(req.query.model){
    where['model']= req.query.model;
  }
  try {
    let services = await servicesModel.paginateDataService(
      where,
      skip,
      limit,
      sort
    );
    let count = await servicesModel.count(where);
    let month = _m().subtract(1, "M").toDate();
    month = _m(month).format("YYYYMM");
    let lastMonth =await statsModel.findOne({"statMonth": month}).select(" totalOffers totalServices revenue customer ");

    let body = {
      "services": services,
      "count": count,
      "last_month": lastMonth
    }

    return res.sendResponse(body, 'services has been fetched successfully.');
  } catch (ex) {
    return next(ex);
  }
};

const getRecommendedServices = async(req, res, next) => {

  let month = _m().subtract(1, "M").toDate();
    month = _m(month).format("YYYYMM");
    console.log("month", month);
    where = {};
    where["statMonth"] = month;
    if(req.query.make){
      where['make']= req.query.make;
    }
    if(req.query.model){
      where['model']= req.query.model;
    }
    try {
        let statistics = await statsModel.getTopRecommendedServices(where);

        return res.sendResponse({
            statistics
        }, 'Services fetched successfully.');
    } catch (ex) {
        return next(ex);
    }
}

const getServices = async(req, res, next) => {
  let {
    where,
    skip,
    limit,
    sort
  } = commonHelper.paginateQueryAssigner(req.query);
  where['status'] = true;
  limit = undefine;
  console.log(where, skip, limit, sort);

  try {
    let services = await servicesModel.paginateData(
      where,
      skip,
      limit,
      sort
    );
    let count = await servicesModel.count(where);
    // let revenue = await appointmentsModel.getRevenue(where);

    return res.sendResponse({
      services,
      // revenue,
      count
    }, 'services has been fecthed successfully.');
  } catch (ex) {
    return next(ex);
  }
};

const fetchSingle = async(req, res, next) => {
  let _id = req.params.id;
  let status = true;
  try {
    let service = await servicesModel.findOne({
      _id,
      status
    }).select('name description icon id amount');
    return res.sendResponse({
      service
    }, 'service has been fecthed successfully.');
  } catch (ex) {
    return next(ex);
  }
};

module.exports = {
  getServicesList,
  getRecommendedServices,
  getServices,
  fetchSingle
}