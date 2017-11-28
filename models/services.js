const mongoose = require('mongoose');
const config = require('config');
const Schema = mongoose.Schema;
const commonHelper = require(HELPERS + 'common');
const _m = require('moment');

const tableSchema = new Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  maintenance_id: {
    type: Number,
    // required: true,
    index: true,
    // unique: true
  },
  make: String,
  model: String,
  price: {
    type: Number,
    required: true
  },
  description: String,
  picture: {
    path: String,
    url: String,
    cdn_url: String,
    cdn_id: String
  },
  status: {
    type: Boolean,
    default: true
  },
  created_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dealer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recommended: {
    type: Number,
    enum: [0 /*'not recommended'*/ , 1 /*'recommended'*/ , 2 /*'top recommended'*/ ],
    default: 0
  },
  created_at: Date,
  updated_at: Date
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
  toObject: {
    getters: true,
    setters: true
  },
  toJSON: {
    getters: true,
    setters: true
  }
});
class ServiceClass {
  get icon() {
    return this.picture.cdn_url || this.picture.url || config.get('defaultProfilePicture');
  }
  static async getCostForServices(services) {
    services = services.map(mongoose.Types.ObjectId);
    let serviceDetails = await this.aggregate(
        [{
          "$match": {
            "_id": {
              "$in": services
            }
          }
        }]
      )
      .group({
        "_id": null,
        "price": {
          "$sum": "$price"
        }
      });
    return serviceDetails.length && serviceDetails[0].price ? serviceDetails[0].price : 0;
  }
  static async isServicesExist(services) {
    services = services.map(mongoose.Types.ObjectId);
    let serviceDetails = await this.aggregate(
        [{
          "$match": {
            "_id": {
              "$in": services
            },
            "status": true
          }
        }]
      )
      .group({
        "_id": null,
        "services": {
          "$push": "$_id"
        }
      })
      .project({
        "selected_services": services,
        "services": "$services"
      })
      .project({
        "unavailable_service": {
          $setDifference: ["$selected_services", "$services"]
        }
      });
    if ((serviceDetails.length === 0) || (serviceDetails[0].unavailable_service.length)) {
      return false;
      // throw new Error(serviceDetails[0].unavailable_service.join(",") +
      //   " services are not availble")
    }
    return true;
  }

  static async paginateDataService(where, skip, limit, sort) {
    var start = _m().subtract(1, "M").startOf('month').toDate();
    var end = _m().subtract(1, "M").endOf('month').toDate();
    // var start = _m().startOf('month').toDate();
    // var end = _m().endOf('month').toDate();
    console.log(start, end);
    let _q = this.aggregate()
      .match(where)
      .lookup({
        "from": "offers",
        "localField": "_id",
        "foreignField": "services",
        "as": "offers"
      })
      .project({
        "name": 1,
        "description": 1,
        "price": 1,
        "picture": 1,
        "recommended": 1,
        "offers": {
          "$arrayElemAt": [{
            "$filter": {
              "input": "$offers",
              "as": "offer",
              "cond": {
                "$and": [{
                    "$gt": [new Date(), "$$offer.starts_at"]
                  },
                  {
                    "$lt": [new Date(), "$$offer.expires_at"]
                  }
                ]
              }
            }
          }, 0]
        }
      })
      .project({
        "name": 1,
        "_id": 1,
        "id": "$_id",
        "description": 1,
        "price": "$price",
        "picture": 1,
        "recommended": 1,
        "offer_description": {
          "$cond": ["$offers.description", "$offers.description", null]
        },
        "offer_id": {
          "$cond": ["$offers._id", "$offers._id", null]
        },
        "offer_name": {
          "$cond": ["$offers.name", "$offers.name", null]
        },
        "offer_price": {
          "$cond": ["$offers.price", "$offers.price", 0]
        }
      })
      .lookup({
        "from": "appointments",
        "localField": "_id",
        "foreignField": "services",
        "as": "used_services"
      })
      .project({
        "name": 1,
        "_id": 1,
        "id": "$_id",
        "description": 1,
        "price": "$price",
        "picture": 1,
        "recommended": 1,
        "offer_description": {
          "$cond": ["$offers.description", "$offers.description", null]
        },
        "offer_id": {
          "$cond": ["$offers._id", "$offers._id", null]
        },
        "offer_name": {
          "$cond": ["$offers.name", "$offers.name", null]
        },
        "offer_price": {
          "$cond": ["$offers.price", "$offers.price", 0]
        },
        "booked_at": {
          "$filter": {
            input: "$used_services",
            as: "used_services",
            cond: {
              $and: [{
                  $gte: ["$$used_services.booked_at", start]
                },
                {
                  $lte: ["$$used_services.booked_at", end]
                },
                {
                  $eq: ["$$used_services.status", 1]
                }
              ]
            }
          }
        }
      })
      .project({
        "name": 1,
        "_id": 1,
        "id": 1,
        "description": 1,
        "price": 1,
        "picture": 1,
        "recommended": 1,
        "offer_description": 1,
        "offer_id": 1,
        "offer_name": 1,
        "offer_price": 1,
        "lastmonth_services": {
          $size: "$booked_at"
        }
      })
    if (sort) {
      _q = _q.sort(sort);
    }
    if (skip) {
      _q = _q.skip(skip);
    }
    if (limit) {
      _q = _q.limit(limit);
    }
    return await _q.exec();
  }
  static async paginateData(where, skip, limit, sort) {
    console.log(where);
    let vW;
    let cond;
    if (where.vehicleWhere) {
      vW = where.vehicleWhere;
      cond = {
        "$and": [{
            "$gt": [new Date(), "$$offer.starts_at"]
          },
          {
            "$lt": [new Date(), "$$offer.expires_at"]
          },
          {
            $switch: {
              branches: [{
                case: {
                  "$eq": [
                    "$$offer.mileage_clause",
                    3
                  ]
                },
                then: true
              }, {
                case: {
                  "$eq": [
                    "$$offer.mileage_clause",
                    2
                  ]
                },
                then: {
                  $cond: {
                    if: {
                      "$lt": [
                        "$$offer.vehicle_mileage",
                        vW.mileage
                      ]
                    },
                    then: true,
                    else: false
                  }
                }
              }, {
                case: {
                  "$eq": [
                    "$$offer.mileage_clause",
                    1
                  ]
                },
                then: {
                  $cond: {
                    if: {
                      "$eq": [
                        "$$offer.vehicle_mileage",
                        vW.mileage
                      ]
                    },
                    then: true,
                    else: false
                  }
                }
              }, {
                case: {
                  "$eq": [
                    "$$offer.mileage_clause",
                    0
                  ]
                },
                then: {
                  $cond: {
                    if: {
                      "$gt": [
                        "$$offer.vehicle_mileage",
                        vW.mileage
                      ]
                    },
                    then: true,
                    else: false
                  }
                }
              }],
              default: false
            }
          }, {
            $switch: {
              branches: [{
                case: {
                  "$eq": [
                    "$$offer.year_clause",
                    3
                  ]
                },
                then: true
              }, {
                case: {
                  "$eq": [
                    "$$offer.year_clause",
                    2
                  ]
                },
                then: {
                  $cond: {
                    if: {
                      "$lt": [
                        "$$offer.vehicle_year",
                        vW.year
                      ]
                    },
                    then: true,
                    else: false
                  }
                }
              }, {
                case: {
                  "$eq": [
                    "$$offer.year_clause",
                    1
                  ]
                },
                then: {
                  $cond: {
                    if: {
                      "$eq": [
                        "$$offer.vehicle_year",
                        vW.year
                      ]
                    },
                    then: true,
                    else: false
                  }
                }
              }, {
                case: {
                  "$eq": [
                    "$$offer.year_clause",
                    0
                  ]
                },
                then: {
                  $cond: {
                    if: {
                      "$gt": [
                        "$$offer.vehicle_year",
                        vW.year
                      ]
                    },
                    then: true,
                    else: false
                  }
                }
              }],
              default: false
            }
          }
        ]
      };
      delete where.vehicleWhere;
    } else {
      cond = {
        "$and": [{
            "$gt": [new Date(), "$$offer.starts_at"]
          },
          {
            "$lt": [new Date(), "$$offer.expires_at"]
          }
        ]
      };
    }
    let _q = this.aggregate()
      .match(where)
      .lookup({
        "from": "offers",
        "localField": "_id",
        "foreignField": "services",
        "as": "offers"
      })
      .project({
        "name": 1,
        "description": 1,
        "price": 1,
        "picture": 1,
        "make": 1,
        "model": 1,
        "maintenance_id": 1,
        "offers": {
          "$arrayElemAt": [{
            "$filter": {
              "input": "$offers",
              "as": "offer",
              "cond": cond
            }
          }, 0]
        }
      })
      .project({
        "name": 1,
        "_id": 1,
        "id": "$_id",
        "description": 1,
        "price": "$price",
        "picture": 1,
        "make": 1,
        "model": 1,
        "maintenance_id": 1,
        "offer_description": {
          "$cond": ["$offers.description", "$offers.description", null]
        },
        "offer_id": {
          "$cond": ["$offers._id", "$offers._id", null]
        },
        "offer_name": {
          "$cond": ["$offers.name", "$offers.name", null]
        },
        "offer_price": {
          "$cond": ["$offers.price", "$offers.price", 0]
        },
        "original_price": {
          "$cond": ["$offers.original_price", "$offers.original_price", 0]
        }
      });
    if (sort) {
      _q = _q.sort(sort);
    }
    if (skip) {
      _q = _q.skip(skip);
    }
    if (limit) {
      _q = _q.limit(limit);
    }
    return await _q.exec();
  }
};

tableSchema.loadClass(ServiceClass);
module.exports = mongoose.model('Service', tableSchema);
