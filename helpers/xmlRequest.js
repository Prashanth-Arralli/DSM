let js2xmlparser = require('js2xmlparser');
let parser = require('xml2json');
let config = require('config');
let request = require('request');
let soap = require('soap');
const makesModel = require(MODELS + 'makes');
const modelsModel = require(MODELS + 'models');
const commonHelper = require(HELPERS + 'common');
exports.dataOneRequest = async (vehicle) => {
  try {
    if (!vehicle.dealer) throw new Error('Dealer not found.');
    let credentials = await commonHelper.getDealerSettings(vehicle.dealer, 'dataOneCredentials');
    if (
      !credentials ||
      !credentials.dataOneCredentials ||
      !credentials.dataOneCredentials.client_id ||
      !credentials.dataOneCredentials.authorization_code
    )
      throw new Error('Dealer has not configured the configuration.');
    let dataOne = config.get('vinApi.dataOne');
    let decoder_query = {
      "decoder_settings": {
        "display": "full",
        "version": "7.0.1",
        "styles": "on",
        "style_data_packs": {
          "basic_data": "on",
          "engines": "on",
          "transmissions": "on",
          "recalls": "on",
          "service_bulletins": "on",
          "nada": "on",
          "evox_stills_single_640px": "on"
        },
        "common_data": "on",
        "common_data_packs": {
          "basic_data": "on",
          "engines": "on",
          "transmissions": "on",
          "recalls": "on",
          "service_bulletins": "on",
          "nada": "on",
          "evox_stills_single_640px": "on"
        }
      },
      "query_requests": {
        "Request-Sample": {
          "vin": vehicle.vin,
          "year": "",
          "make": "",
          "model": "",
          "trim": "",
          "model_number": "",
          "package_code": "",
          "drive_type": "",
          "vehicle_type": "",
          "body_type": "",
          "body_subtype": "",
          "doors": "",
          "bedlength": "",
          "wheelbase": "",
          "msrp": "",
          "invoice_price": "",
          "engine": {
            "description": "",
            "block_type": "",
            "cylinders": "",
            "displacement": "",
            "fuel_type": ""
          },
          "transmission": {
            "description": "",
            "trans_type": "",
            "trans_speeds": ""
          },
          "optional_equipment_codes": "",
          "installed_equipment_descriptions": "",
          "interior_color": {
            "description": "",
            "color_code": ""
          },
          "exterior_color": {
            "description": "",
            "color_code": ""
          }
        }
      }
    }
    decoder_query = js2xmlparser.parse('decoder_query', decoder_query);
    return await new Promise((rs, rj) => {
      request({
        uri: dataOne.endpoint + dataOne.path,
        method: 'POST',
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        form: {
          ...credentials.dataOneCredentials,
          decoder_query
        }
      },
        (error, response, body) => {
          if (!error && response.statusCode == 200) {
            let vehicle = JSON.parse(parser.toJson(body))
            let decoded_data = vehicle.decoded_data;
            let decoder_errors = decoded_data.decoder_messages.decoder_errors;
            if (decoder_errors.error && decoder_errors.error.message)
              return rj(decoder_errors.error.message);
            let responses = decoded_data.query_responses;
            let response = responses.query_response;
            let query_error = response && response.query_error;
            if (query_error && typeof query_error.error_message === "string")
              return rj(new Error(query_error.error_message));
            return rs(response);
          }
          return rj(error);
        }
      );
    })
  }
  catch (ex) {
    return Promise.reject(ex);
  }
};
exports.nadaApiRequest = async (vehicleObj) => {
  try {
    let { vin, mileage, dealer } = vehicleObj;
    if (!vehicleObj.dealer) throw new Error('Dealer not found.');
    let credentials = await commonHelper.getDealerSettings(vehicleObj.dealer, 'nadaApiCredentials');
    if (
      !credentials ||
      !credentials.nadaApiCredentials ||
      !credentials.nadaApiCredentials.Password ||
      !credentials.nadaApiCredentials.Username
    )
      throw new Error('Dealer has not configured the configuration.');
    console.log(credentials.nadaApiCredentials)
    console.log(config.get('vinApi.nadaApi.credentials'))
    let client = await soap.createClientAsync(config.get('vinApi.nadaApi.signInEndpoint'));
    let token = await client.getTokenAsync({
      tokenRequest: {
        Username: credentials.nadaApiCredentials.Username,
        Password: credentials.nadaApiCredentials.Password
      },//credentials.nadaApiCredentials
    });
    let vehicleRequest = {};
    vehicleRequest.Token = token.getTokenResult;
    vehicleRequest.Vin = vin;
    let vehicleClient = await soap.createClientAsync(config.get('vinApi.nadaApi.vehicleEndpoint'));

    let vehicleDetail = await vehicleClient.getVehiclesAsync({
      vehicleRequest
    });
    vehicleDetail = vehicleDetail.getVehiclesResult.Vehicle_Struc[0];
    let l_Request = {};
    l_Request.Token = token.getTokenResult;
    let RegionResult = await vehicleClient.getRegionsAsync({
      l_Request
    });
    let regionResults = RegionResult.getRegionsResult.Lookup_Struc;
    let adjustedValue = await vehicleClient.getAdjustedValuesByUidAsync({
      request: {
        Token: token.getTokenResult,
        Vin: vin,
        Uid: vehicleDetail.Uid,
        Region: regionResults[2].Code
      }
    })
    let accessoriesRequest = {};
    accessoriesRequest.Uid = vehicleDetail.Uid;
    accessoriesRequest.Token = token.getTokenResult;
    accessoriesRequest.Vin = vin;
    accessoriesRequest.Mileage = mileage;
    accessoriesRequest.Region = regionResults[0].Code;
    let accessories = await vehicleClient.getVehicleAndValueByUidAsync({
      vehicleRequest: accessoriesRequest
    })

    let auctionValuesRequest = {};
    auctionValuesRequest.Uid = vehicleDetail.Uid;
    auctionValuesRequest.Token = token.getTokenResult;
    auctionValuesRequest.Vin = vin;
    auctionValuesRequest.Region = regionResults[0].Code;
    let auctionValues = await vehicleClient.getAuctionValuesAsync({
      auctionValuesRequest
    });
    // let getYears = await vehicleClient.getYearsAsync({
    //   l_Request: {
    //     VehicleType: 'UsedCar',
    //     Period: 0,
    //     Token: token.getTokenResult
    //   }
    // });
    // let getMakes = await vehicleClient.getMakesAsync({
    //   l_Request: {
    //     // VehicleType: 'UsedCar',
    //     // Period: 0,
    //     Token: token.getTokenResult,
    //     Year: 2010
    //   }
    // });
    // let getSeries = await vehicleClient.getSeriesAsync({
    //   l_Request: {
    //     // VehicleType: 'UsedCar',
    //     // Period: 0,
    //     Token: token.getTokenResult,
    //     Year: 2010,
    //     MakeCode: 1
    //   }
    // });
    // let getBodyUids = await vehicleClient.getBodyUidsAsync({
    //   l_Request: {
    //     // VehicleType: 'UsedCar',
    //     // Period: 0,
    //     Token: token.getTokenResult,
    //     Year: 2010,
    //     MakeCode: 1,
    //     SeriesCode: 538
    //   }
    // });
    // let getVehicle = await vehicleClient.getVehicleAsync({
    //   vehicleRequest: {
    //     // VehicleType: 'UsedCar',
    //     // Period: 0,
    //     Token: token.getTokenResult,
    //     Uid: 1186270
    //   }
    // });
    // let getAccessories = await vehicleClient.getAccessoriesAsync({
    //   accessoriesRequest: {
    //     // VehicleType: 'UsedCar',
    //     // Period: 0,
    //     Token: token.getTokenResult,
    //     Uid: 1186270,
    //     Vin: vin,
    //     Region: regionResults[2].Code
    //   }
    // });
    // let getInclusiveAccessories = await vehicleClient.getInclusiveAccessoriesAsync({
    //   mutualAccessoriesRequest: {
    //     // VehicleType: 'UsedCar',
    //     // Period: 0,
    //     Token: token.getTokenResult,
    //     Uid: 1186270
    //   }
    // });
    // let getExclusiveAccessories = await vehicleClient.getExclusiveAccessoriesAsync({
    //   mutualAccessoriesRequest: {
    //     // VehicleType: 'UsedCar',
    //     // Period: 0,
    //     Token: token.getTokenResult,
    //     Uid: 1186270
    //   }
    // });
    // let getMileageAdj = await vehicleClient.getMileageAdjAsync({
    //   mileageAdjRequest: {
    //     Token: token.getTokenResult,
    //     Uid: 1186270,
    //     Region: regionResults[2].Code
    //   }
    // });
    // let getTotalAdjFloorValues = await vehicleClient.getTotalAdjFloorValuesAsync({
    //   l_Request: {
    //     Token: token.getTokenResult,
    //     Uid: 1186270,
    //     Region: regionResults[2].Code,
    //     Mileage: mileage
    //   }
    // });
    // let getBaseVehicleValueByUid = await vehicleClient.getBaseVehicleValueByUidAsync({
    //   vehicleRequest: {
    //     // VehicleType: 'UsedCar',
    //     // Period: 0,
    //     Token: token.getTokenResult,
    //     Uid: 1186270,
    //     Vin: vin,
    //     AccessoryList: ['Navigation System','Track Handling Pkg.', 'Driver Assist Plus Pkg.']
    //   }
    // });
    // let getDefaultVehicleAndValueByVin = await vehicleClient.getDefaultVehicleAndValueByVinAsync({
    //   vehicleRequest: {
    //     Token: token.getTokenResult,
    //     Vin: vin,
    //     Region: regionResults[2].Code,
    //     Mileage: mileage
    //   }
    // })
    // let getMsrpVehicleAndValueByVin = await vehicleClient.getMsrpVehicleAndValueByVinAsync({
    //   vehicleRequest: {
    //     Token: token.getTokenResult,
    //     Vin: vin,
    //     Region: regionResults[2].Code,
    //     Mileage: mileage,
    //     Msrp: getDefaultVehicleAndValueByVin.getDefaultVehicleAndValueByVinResult.Msrp
    //   }
    // });
    // let getHighVehicleAndValueByVin = await vehicleClient.getHighVehicleAndValueByVinAsync({
    //   vehicleRequest: {
    //     Token: token.getTokenResult,
    //     Vin: vin,
    //     Region: regionResults[2].Code,
    //     Mileage: mileage
    //   }
    // });
    // let getLowVehicleAndValueByVin = await vehicleClient.getLowVehicleAndValueByVinAsync({
    //   vehicleRequest: {
    //     Token: token.getTokenResult,
    //     Vin: vin,
    //     Region: regionResults[2].Code,
    //     Mileage: mileage
    //   }
    // });
    return {
      auctionValues: auctionValues.getAuctionValuesResult,
      tradeInValues: accessories.getVehicleAndValueByUidResult,
      // getYears: getYears.getYearsResult.Lookup_Struc,
      // getMakes: getMakes.getMakesResult.Lookup_Struc,
      // getRegions: regionResults,
      // getSeries: getSeries.getSeriesResult.Lookup_Struc,
      // getBodyUids: getBodyUids.getBodyUidsResult.Lookup_Struc,
      // getVehicle: getVehicle.getVehicleResult,
      // getAccessories: getAccessories.getAccessoriesResult.Accessory_Struc,
      // getInclusiveAccessories: getInclusiveAccessories.getInclusiveAccessoriesResult,
      // getExclusiveAccessories: getExclusiveAccessories.getExclusiveAccessoriesResult.AccessoryMultExcl_Struc,
      // getMileageAdj: getMileageAdj.getMileageAdjResult,
      // getTotalAdjFloorValues: getTotalAdjFloorValues.getTotalAdjFloorValuesResult,
      // getBaseVehicleValueByUid:getBaseVehicleValueByUid,
      // getDefaultVehicleAndValueByVin: getDefaultVehicleAndValueByVin,
      // getMsrpVehicleAndValueByVin: getMsrpVehicleAndValueByVin,
      // getHighVehicleAndValueByVin: getHighVehicleAndValueByVin,
      // getLowVehicleAndValueByVin: getLowVehicleAndValueByVin,
      // adjustedValue: adjustedValue,
      success: true,
      error: null
    }
  } catch (ex) {
    console.log('NADA Error', ex)
    return {
      auctionValues: {},
      tradeInValues: {},
      message: "NADA api not working",
      success: false,
      // error: ex
    }
  }
};
exports.kbbRequest = async (vehicleObj) => {
  try {
    let {
      vin, zipcode, VehicleClass, Mileage, ApplicationCategory, dealer
    } = vehicleObj
    let client = await soap.createClientAsync("https://idws-sample.syndication.kbb.com/3.0/VehicleInformationService2008R2.svc?singleWsdl");
    if (!dealer) throw new Error('Dealer not found.');
    let credentials = await commonHelper.getDealerSettings(dealer, 'kbbApiCredentials');
    if (
      !credentials ||
      !credentials.kbbApiCredentials ||
      !credentials.kbbApiCredentials.Username ||
      !credentials.kbbApiCredentials.Password
    )
      throw new Error('Dealer has not configured the configuration.');
    let token = await client.LoginAsync({
      Username: credentials.kbbApiCredentials.Username,
      Password: credentials.kbbApiCredentials.Password
    })
    let vehicleRequest = {};
    let VehicleConfiguration;
    vehicleRequest.AuthenticationKey = token.LoginResult;
    // vehicleRequest.Vin = vin;

    let vvin = await client.ValidateVINAsync({
      "AuthenticationKey": token.LoginResult,
      "VIN": vin
    })
    console.log(vvin)
    let rdate = await client.GetVehicleConfigurationByVINAndClassAsync({
      "AuthenticationKey": token.LoginResult,
      "VIN": vin,
      "ZipCode": zipcode,
      "VersionDate": new Date().toISOString(),
      "VehicleClass": VehicleClass,
    })
    console.log(rdate.GetVehicleConfigurationByVINAndClassResult.VehicleConfiguration)
    let method = await client.GetVehicleValuesByVehicleConfigurationAllConditionsAsync({
      "AuthenticationKey": token.LoginResult,
      "VehicleConfiguration": {
        "Id": rdate.GetVehicleConfigurationByVINAndClassResult.VehicleConfiguration[0].Id,
        "VIN": rdate.GetVehicleConfigurationByVINAndClassResult.VehicleConfiguration[0].VIN,
        "Year": {
          "Id": rdate.GetVehicleConfigurationByVINAndClassResult.VehicleConfiguration[0].Year.Id,
          "Value": rdate.GetVehicleConfigurationByVINAndClassResult.VehicleConfiguration[0].Year.Value
        },
        "Make": {
          "Id": rdate.GetVehicleConfigurationByVINAndClassResult.VehicleConfiguration[0].Make.Id,
          "Value": rdate.GetVehicleConfigurationByVINAndClassResult.VehicleConfiguration[0].Make.Value
        },
        "Model": {
          "Id": rdate.GetVehicleConfigurationByVINAndClassResult.VehicleConfiguration[0].Model.Id,
          "Value": rdate.GetVehicleConfigurationByVINAndClassResult.VehicleConfiguration[0].Model.Value
        },
        "Trim": {
          "Id": rdate.GetVehicleConfigurationByVINAndClassResult.VehicleConfiguration[0].Trim.Id,
          "Value": rdate.GetVehicleConfigurationByVINAndClassResult.VehicleConfiguration[0].Trim.Value
        },
        "Mileage": Mileage,
        "OptionalEquipment": rdate.GetVehicleConfigurationByVINAndClassResult.VehicleConfiguration[0].OptionalEquipment,
        "ConfiguredDate": new Date(rdate.GetVehicleConfigurationByVINAndClassResult.VehicleConfiguration[0].ConfiguredDate).toISOString()
      },
      // "Year":2014,
      // "Make": "ford",
      // "Model":"Explorer",
      // "Trim":"Limited",
      // "VIN":vin,
      // "Mileage": 1000,
      "ApplicationCategory": ApplicationCategory,
      // "VehicleCondition": "Good",
      // "VehicleClass":"UsedCar",
      // "VehicleId":415258,
      "ZipCode": zipcode,
      // "MakeId":24,
      // "ModelId":162,
      // "YearId":2016,
      // "SourceType":"trade",
      "VersionDate": new Date().toISOString(),
      // "ApplicationCategory":"Consumer",
      // "VehicleClass":"UsedCar",
    })
    return {
      tradePriceValue: method.GetVehicleValuesByVehicleConfigurationAllConditionsResult.ValuationPrices.Valuation
    }
  } catch (ex) {
    console.log(ex);
    return {
      tradePriceValue: {},
      message: "KBB api not working"
    }
  }
};
exports.makeInsert = async (vin, zipcode, VehicleClass, Mileage, ApplicationCategory) => {
  try {

    let client = await soap.createClientAsync("https://idws-sample.syndication.kbb.com/3.0/VehicleInformationService2008R2.svc?singleWsdl");
    let token = await client.LoginAsync({
      "Username": "InfomoneyCorpSample",
      "Password": "4RfDN7?f"
    })
    let vehicleRequest = {};
    let VehicleConfiguration;
    vehicleRequest.AuthenticationKey = token.LoginResult;
    // vehicleRequest.Vin = vin;

    let make = await client.GetMakesAsync({
      "AuthenticationKey": token.LoginResult,
      // "VIN": req.query.vin,
      "VehicleClass": "UsedCar",
      "ApplicationCategory": "Consumer",
      // "MakeId":5,
      "VersionDate": new Date().toISOString(),
    })
    let makeinsert = {};
    make.GetMakesResult.IdStringPair.forEach(async (item) => {
      makeinsert['name'] = item.Value;
      makeinsert['id'] = item.Id;
      let makei = await new makesModel(makeinsert).save();
      let model = await client.GetModelsByMakeAcrossAllYearsAsync({
        "AuthenticationKey": token.LoginResult,
        // "VIN": req.query.vin,
        "VehicleClass": "UsedCar",
        "ApplicationCategory": "Consumer",
        "MakeId": item.Id,
        "VersionDate": new Date().toISOString(),
      })
      let modelinsert = {};
      model.GetModelsByMakeAcrossAllYearsResult.IdStringPair.forEach(async (item) => {
        modelinsert['name'] = item.Value;
        modelinsert['id'] = item.Id;
        modelinsert['make'] = makei._id;
        let modeli = await new modelsModel(modelinsert).save();
      });
    });
    return (make);
  } catch (ex) {
    return (ex)
  }
};
exports.modelInsert = async (id, zipcode, VehicleClass, Mileage, ApplicationCategory) => {
  try {

    let client = await soap.createClientAsync("https://idws-sample.syndication.kbb.com/3.0/VehicleInformationService2008R2.svc?singleWsdl");
    let token = await client.LoginAsync({
      "Username": "InfomoneyCorpSample",
      "Password": "4RfDN7?f"
    })
    let vehicleRequest = {};
    let VehicleConfiguration;
    vehicleRequest.AuthenticationKey = token.LoginResult;
    // vehicleRequest.Vin = vin;

    let model = await client.GetModelsByMakeAcrossAllYearsAsync({
      "AuthenticationKey": token.LoginResult,
      // "VIN": req.query.vin,
      "VehicleClass": "UsedCar",
      "ApplicationCategory": "Consumer",
      "MakeId": id,
      "VersionDate": new Date().toISOString(),
    })
    let make = await makesModel.find({
      id: id
    })
    let modelinsert = {};
    model.GetModelsByMakeAcrossAllYearsResult.IdStringPair.forEach(async (item) => {
      modelinsert['name'] = item.Value;
      modelinsert['id'] = item.Id;
      modelinsert['make'] = make._id;
      let modeli = await new modelsModel(modelinsert).save();
    });
    return (model);
  } catch (ex) {
    return (ex)
  }
};

