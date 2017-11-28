var soap = require('soap');
var url = 'https://webservice.nada.com/vehicles/secure/securelogin.asmx?wsdl';
var tokenRequest = {
  Password: 'info$_800!',
  Username: 'vikrant@infomoneycorp.com'
};
var vehicleUrl = 'http://webservice.nada.com/vehicles/vehicle.asmx?wsdl';
let soapCall = async(vin) => {
  try {
    let client = await soap.createClientAsync(url);
    let token = await client.getTokenAsync({
      tokenRequest
    });
    let vehicleRequest = {};
    vehicleRequest.Token = token.getTokenResult;
    vehicleRequest.Vin = vin;
    let vehicleClient = await soap.createClientAsync(vehicleUrl);
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
    let accessoriesRequest = {};
    accessoriesRequest.Uid = vehicleDetail.Uid;
    accessoriesRequest.Token = token.getTokenResult;
    accessoriesRequest.Vin = vin;
    accessoriesRequest.Region = regionResults[0].Code;
    let accessories = await vehicleClient.getVehicleAndValueByUidAsync({
      vehicleRequest: accessoriesRequest
    })
    console.log(accessories)
    let auctionValuesRequest = {};
    auctionValuesRequest.Uid = vehicleDetail.Uid;
    auctionValuesRequest.Token = token.getTokenResult;
    auctionValuesRequest.Vin = vin;
    auctionValuesRequest.Region = regionResults[0].Code;
    let auctionValues = await vehicleClient.getAuctionValuesAsync({
      auctionValuesRequest
    });
    return {
      auctionValues: auctionValues.getAuctionValuesResult,
      tradeInValues: accessories.getVehicleAndValueByUidResult
    }
  } catch (ex) {
    throw ex;
  }
}
soapCall('WBA3B5G52ENS06109');
