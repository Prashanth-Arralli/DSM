const recallModel = require(MODELS + 'def_nhtsa_recall');
const recallLookModel = require(MODELS + 'lkp_veh_nhtsa_recall');
const commonHelper = require(HELPERS + 'common');
const config = require('config');
var csvReader = require('csvreader');
const vehicleModel = require(MODELS + 'vehicles');

const saveRecall = async(req, res, next) => {
  try {
    let recall = await new recallModel(req.body).save();
    recall = recall.toObject();
    return res.sendResponse({
      recall
    }, 'Recall added successfully');
  } catch (ex) {
    return next(ex);
  }
}
const saveRecallLookUp = async(req, res, next) => {
  var recallLdata = {};
  var already = [];
  var count = 0;
  try {
    // csvReader
    //     .read(req.body.file.path) = async (data, err) => {
    //         if (count != 0) {
    //             recallLdata['veh_nhtsa_recall_id'] = data[0];
    //             recallLdata['vehicle_id'] = data[1];
    //             recallLdata['nhtsa_recall_id'] = data[2];
    //             let veh_nhtsa_recall_id = data[0];
    //             let recall = await recallLookModel.findOne({
    //                 veh_nhtsa_recall_id
    //             });
    //             if (recall != null) {
    //                 already.push({
    //                     veh_nhtsa_recall_id
    //                 })
    //             } else {
    //                 let check = await new recallLookModel(recallLdata).save();
    //             }
    //         }
    //         count++;
    //     }

    let recall = await new recallLookModel(req.body).save();
    recall = recall.toObject();
    return res.sendResponse({
      recall
    }, 'Recall Lookup added successfully');
  } catch (ex) {
    return next(ex);
  }
}
const queryRecall = async(req, res, next) => {
  try {
    let {
      where,
      skip,
      limit,
      sort
    } = commonHelper.paginateQueryAssigner(req.query);
    let recall = await recallModel.paginateRecalls(undefined, skip, limit, sort);
    let count = await recallModel.paginateRecalls(undefined, skip, limit, sort, true);
    return res.sendResponse({
      recall,
      count
    }, 'Recall added successfully');
  } catch (ex) {
    return next(ex);
  }
}
const queryRecallLookUp = async(req, res, next) => {
  try {
    let recall = await recallLookModel.find();
    return res.sendResponse({
      recall
    }, 'Recall added successfully');
  } catch (ex) {
    return next(ex);
  }
}
const searchRecall = async(req, res, next) => {
  try {
    let {
      where,
      skip,
      limit,
      sort
    } = commonHelper.paginateQueryAssigner(req.query);
    let recall = await recallModel.paginateRecalls(false, skip, limit, sort, false, where.key);
    let count = await recallModel.paginateRecalls(false, skip, limit, sort, true, where.key);
    return res.sendResponse({
      recall,
      count
    }, 'Recall added successfully');
  } catch (ex) {
    return next(ex);
  }
}
const deleteRecall = async(req, res, next) => {
  let _id = req.params.id;
  try {
    let recall = await recallModel.remove({
      _id
    });
    recall = await recallLookModel.remove({
      _id
    });
    return res.sendResponse({
      recall
    }, 'Recall has been removed successfully.');
  } catch (ex) {
    return next(ex);
  }
}
module.exports = {
  saveRecall,
  saveRecallLookUp,
  queryRecall,
  queryRecallLookUp,
  searchRecall,
  deleteRecall
}
