var XLSX = require('xlsx');

const servicesModel = require(MODELS + 'services');
const makesModel = require(MODELS + 'makes');
const modelsModel = require(MODELS + 'models');
const commonHelper = require(HELPERS + 'common');
const xlHelper = require(HELPERS + 'excelReader');
const config = require('config');


const add = async (req, res, next) => {
  req.body['created_by'] = req.user.id;
  req.body['dealer'] = req.user.id;
  try {
    req.body.price = req.body.amount || req.body.price;
    let service = await new servicesModel(req.body).save();
    service = service.toObject();
    delete service._id;
    delete service.__v;
    return res.sendResponse({
      service
    }, 'Service has been added successfully.');
  } catch (ex) {
    return next(ex);
  }
};
const remove = async (req, res, next) => {
  // let created_by = req.user.id;
  // let _id = req.params.id;
  // try {
  //   let service = await servicesModel.remove({
  //     _id,
  //     created_by
  //   });
  //   return res.sendResponse({
  //     _id
  //   }, 'Service has been removed successfully.');
  // } catch (ex) {
  //   return next(ex);
  // }

  let _id = req.params.id;
  let created_by = req.user.id;

  req.body.status = false;
  console.log(_id, created_by)
  try {
    let service = await servicesModel.findOneAndUpdate({
      _id,
      created_by
    },
      req.body, {
        new: true
      });
    service = service.toObject();
    return res.sendResponse({
      service
    }, 'offer has been deleted successfully.');
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
    where['dealer'] =req.user._id;
    let services = await servicesModel.paginateData(
      where,
      skip,
      limit,
      sort
    );
    let count = await servicesModel.count(where);
    return res.sendResponse({
      services,
      count
    }, 'Services has been fecthed successfully.');
  } catch (ex) {
    return next(ex);
  }
};
const update = async (req, res, next) => {
  let _id = req.params.id;
  req.body.price = req.body.amount || req.body.price;
  try {
    let service = await servicesModel.findOneAndUpdate({
      _id
    },
      req.body, {
        new: true
      });
    service = service.toObject();
    delete service._id;
    delete service.__v;
    return res.sendResponse({
      service
    }, 'Service has been updated successfully.');
  } catch (ex) {
    return next(ex);
  }
};
const fetchSingle = async (req, res, next) => {
  let _id = req.params.id;
  try {

    let service = await servicesModel.findOne({
      _id
    });
    delete service._id;
    delete service.__v;
    return res.sendResponse({
      service
    }, 'Service has been fecthed successfully.');
  } catch (ex) {
    return next(ex);
  }
};
const uploadServicesCommon = async (req, res, next) => {
  try {
    let services = xlHelper.Read({
      fields: {
        'maintenance_id': 'maintenance_id',
        'maintenance_category': 'category',
        'maintenance_name': 'name',
        'maintenance_notes': 'description',
      },
      defaultFields: {
        'price': 49,
        'created_by': req.user._id
      },
      file: req.body.file.path
    });
    services = await servicesModel.insertMany(services, { continueOnError: true, safe: true });
    res.sendResponse({
      services
    });
  } catch (ex) {
    next(ex);
  }
}
const uploadServices = async (req, res, next) => {
  var data = [];
  try {
    var workbook = XLSX.readFile(req.body.file.path);
    var sheet_name_list1 = workbook.SheetNames;
    let sheet_name_list = [];
    sheet_name_list.push(sheet_name_list1[0]);
    sheet_name_list.forEach(function (y) {
      var worksheet = workbook.Sheets[y];
      var a = {};
      var headers = {};
      // var data = [];
      var result = [];
      for (z in worksheet) {
        if (z[0] === '!') continue;
        //parse out the column, row, and value
        var tt = 0;
        for (var i = 0; i < z.length; i++) {
          if (!isNaN(z[i])) {
            tt = i;
            break;
          }
        };
        var col = z.substring(0, tt);
        var row = parseInt(z.substring(tt));
        var value = worksheet[z].v;

        //store header names
        if (row == 1 && value) {
          headers[col] = value.toLowerCase();
          continue;
        }

        if (!data[row]) data[row] = {};
        data[row][headers[col]] = value;
      }



      //drop those first two rows which are empty
      data.shift();
      data.shift();

      // data.forEach(function async(ser) {
      //   // console.log(ser)
      //   ser.created_by = req.user.id;
      //   if(!ser.price){
      //     ser.price = 0;
      //   }
      //    new servicesModel(ser).save()
      //     .then(function (docs) {
      //       console.log("docs",ser, docs);
      //       result.push(docs.name + 'has been created');
      //     })
      //     .catch(function (err) {
      //       console.log("err", ser, err)
      //       //  result.push(docs.name + 'has been created');
      //     });
      // })


    });
    let already = [];
    result = await Promise.all(data.map(async (ser) => {
      ser.created_by = req.user.id;
      ser.dealer = req.user.id;
      if (!ser.price) {
        ser.price = 0;
      }
      if (!ser.description) {
        ser.description = "";
      }
      let name = ser.name;
      let service = await servicesModel.findOne({
        name
      });
      if (service != null) {
        already.push({
          name
        })
      } else {
        return await new servicesModel(ser).save();
      }
    }))

    console.log(already);
    return res.sendResponse({
      already,
      result
    }, 'Services added successfully');
  } catch (ex) {
    console.log(ex);
  }
}

const addFromFile = async (req) => {
  req.body['created_by'] = req.user.id;
  try {
    req.body.price = req.body.amount || req.body.price;
    let service = await new servicesModel(req.body).save();

    service = service.toObject();
    delete service._id;
    delete service.__v;
    return req.body.name + "has been added successfully";
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
  uploadServices,
  uploadServicesCommon
}
