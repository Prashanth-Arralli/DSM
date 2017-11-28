const mongoose = require('mongoose');
const config = require('config');
const Schema = mongoose.Schema;
const commonHelper = require(HELPERS + 'common');
const tableSchema = new Schema({
  name: String,
  description: String,
  dealer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  picture: {
    path: String,
    url: String,
    cdn_url: String,
    cdn_id: String
  },
  discount: {
    type: Number,
    default: 0
  },
  discount_type: {
    type: String,
    enum: [1 /*'percentage'*/ , 2 /*'exact_amount'*/ , 3 /*offer price*/ ]
  },
  original_price: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    default: 0
  },
  make: String,
  model: String,
  description: String,
  long_description: String,
  services: [{
    type: Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  }],
  status: {
    type: Boolean,
    default: true
  },
  vehicle_model: {
    type: String,
    default: null
  },
  vehicle_year: {
    type: Number,
    default: null
  },
  year_clause: {
    type: Number,
    default: 3,
    enum: [0 /* less than */ , 1 /* same as */ , 2 /* greater than */, 3 ]
  },
  vehicle_mileage: {
    type: Number,
    default: null
  },
  mileage_clause: {
    type: Number,
    default: 3,
    enum: [ 0 /* less than */ , 1 /* same as */ , 2 /* greater than */, 3 ]
  },
  show_case: {
    type: Boolean,
    default: false
  },
  starts_at: Date,
  expires_at: Date,
  created_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
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
class OfferClass {
  get icon() {
    return this.picture.cdn_url || this.picture.url || config.get('defaultProfilePicture');
  }
  static async getOfferByofferID(offers) {
    return await this.find({
      offers
    }).select('amount').exec();
  }
  static async isOffersExist(offers) {
    offers = offers.map(mongoose.Types.ObjectId);
    let offerDetails = await this.aggregate(
        [{
          "$match": {
            "_id": {
              "$in": offers
            },
            "status": true
          }
        }]
      )
      .group({
        "_id": null,
        "offers": {
          "$push": "$_id"
        }
      })
      .project({
        "selected_offers": offers,
        "offers": "$offers"
      })
      .project({
        "unavailable_offer": {
          $setDifference: ["$selected_offers", "$offers"]
        }
      });
    console.log(offerDetails)
    if ((offerDetails.length === 0) || offerDetails[0].unavailable_offer.length) {
      return false;
      // throw new Error(offerDetails[0].unavailable_offer.join(",") +
      //   " offers are not availble")
    }
    return true;
  }
  static async getCostForOffers(offers) {
    offers = offers.map(mongoose.Types.ObjectId);
    let offerDetails = await this.aggregate(
        [{
          "$match": {
            "_id": {
              "$in": offers
            },
            "status": true
          }
        }]
      )
      .group({
        "_id": null,
        "price": {
          "$sum": "$price"
        }
      });
    console.log(typeof offerDetails[0])
    return offerDetails.length && offerDetails[0].price ? offerDetails[0].price : 0;
  }
  static async paginateData(where, skip, limit, sort) {
    let switchWhere;
    let vW;
    if (where.vehicleWhere) {
      vW = where.vehicleWhere;
      switchWhere = {
        "vehicle_clause": {
          $switch: {
            branches: [{
              case: {
                "$eq": [
                  "$mileage_clause",
                  3
                ]
              },
              then: true
            }, {
              case: {
                "$eq": [
                  "$mileage_clause",
                  2
                ]
              },
              then: {
                $cond: {
                  if: {
                    "$lt": [
                      "$vehicle_mileage",
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
                  "$mileage_clause",
                  1
                ]
              },
              then: {
                $cond: {
                  if: {
                    "$eq": [
                      "$vehicle_mileage",
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
                  "$mileage_clause",
                  0
                ]
              },
              then: {
                $cond: {
                  if: {
                    "$gt": [
                      "$vehicle_mileage",
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
        },
        "year_clause": {
          $switch: {
            branches: [{
              case: {
                "$eq": [
                  "$year_clause",
                  3
                ]
              },
              then: true
            }, {
              case: {
                "$eq": [
                  "$year_clause",
                  2
                ]
              },
              then: {
                $cond: {
                  if: {
                    "$lt": [
                      "$vehicle_year",
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
                  "$year_clause",
                  1
                ]
              },
              then: {
                $cond: {
                  if: {
                    "$eq": [
                      "$vehicle_year",
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
                  "$year_clause",
                  0
                ]
              },
              then: {
                $cond: {
                  if: {
                    "$gt": [
                      "$vehicle_year",
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
      }
      delete where.vehicleWhere;
    }
    let _q = this.aggregate()
      .match(where);
    if (switchWhere) {
      _q = _q.project({
          '_id': 1,
          'vehicle_clause': switchWhere.vehicle_clause,
          'year_clause': switchWhere.year_clause,
          // 'year': vW.year,
          // 'vehicle_mileage':1,
          // 'vehicle_year':1,
          // 'mileage_clause1':'$mileage_clause',
          // 'year_clause1':'$year_clause',
          // 'mileage': parseFloat(vW.mileage),
          'updated_at': 1,
          'name': 1,
          'price': 1,
          'original_price': 1,
          'discount_type': 1,
          'discount': 1,
          'services': 1,
          'expires_at': 1,
          'starts_at': 1,
          'long_description': 1,
          'description': 1,
          'picture': 1
        })
        .match({
          'vehicle_clause': true,
          'year_clause': true
        });
    }
    _q = _q.lookup({
        "from": "appointments",
        "localField": "_id",
        "foreignField": "offers",
        "as": "used_offer"
      })
      .unwind({
        path: "$used_offer",
        preserveNullAndEmptyArrays: true
      }).group({
        "_id": "$_id",
        count: {
          "$sum": 1
        },
        "id": {
          "$first": "$_id"
        },
        "name": {
          "$first": "$name"
        },
        "price": {
          "$first": "$price"
        },
        "show_case": {
          "$first": "$show_case"
        },
        "original_price": {
          "$first": "$original_price"
        },
        "discount_type": {
          "$first": "$discount_type"
        },
        "discount": {
          "$first": "$discount"
        },
        "services": {
          "$first": "$services"
        },
        "expires_at": {
          "$first": "$expires_at"
        },
        "starts_at": {
          "$first": "$starts_at"
        },
        "long_description": {
          "$first": "$long_description"
        },
        "description": {
          "$first": "$description"
        },
        "picture": {
          "$first": "$picture"
        },
        "icon": {
          "$first": "$picture.url"
        }
      })
      .lookup({
        "from": "services",
        "localField": "services",
        "foreignField": "_id",
        "as": "services"
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
  static async paginateDataCount(where) {
    let switchWhere;
    let vW;
    if (where.vehicleWhere) {
      vW = where.vehicleWhere;
      switchWhere = {
        "vehicle_clause": {
          $switch: {
            branches: [{
              case: {
                "$eq": [
                  "$mileage_clause",
                  3
                ]
              },
              then: true
            }, {
              case: {
                "$eq": [
                  "$mileage_clause",
                  2
                ]
              },
              then: {
                $cond: {
                  if: {
                    "$lt": [
                      "$vehicle_mileage",
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
                  "$mileage_clause",
                  1
                ]
              },
              then: {
                $cond: {
                  if: {
                    "$eq": [
                      "$vehicle_mileage",
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
                  "$mileage_clause",
                  0
                ]
              },
              then: {
                $cond: {
                  if: {
                    "$gt": [
                      "$vehicle_mileage",
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
        },
        "year_clause": {
          $switch: {
            branches: [{
              case: {
                "$eq": [
                  "$year_clause",
                  3
                ]
              },
              then: true
            }, {
              case: {
                "$eq": [
                  "$year_clause",
                  2
                ]
              },
              then: {
                $cond: {
                  if: {
                    "$lt": [
                      "$vehicle_year",
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
                  "$year_clause",
                  1
                ]
              },
              then: {
                $cond: {
                  if: {
                    "$eq": [
                      "$vehicle_year",
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
                  "$year_clause",
                  0
                ]
              },
              then: {
                $cond: {
                  if: {
                    "$gt": [
                      "$vehicle_year",
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
      }
      delete where.vehicleWhere;
    }
    let _q = this.aggregate()
      .match(where);
    if (switchWhere) {
      _q = _q.project({
          '_id': 1,
          'vehicle_clause': switchWhere.vehicle_clause,
          'year_clause': switchWhere.year_clause,
          // 'year': vW.year,
          // 'vehicle_mileage':1,
          // 'vehicle_year':1,
          // 'mileage_clause1':'$mileage_clause',
          // 'year_clause1':'$year_clause',
          // 'mileage': parseFloat(vW.mileage),
          'updated_at': 1,
          'name': 1,
          'price': 1,
          'original_price': 1,
          'discount_type': 1,
          'discount': 1,
          'services': 1,
          'expires_at': 1,
          'starts_at': 1,
          'long_description': 1,
          'description': 1,
          'picture': 1
        })
        .match({
          'vehicle_clause': true,
          'year_clause': true
        });
    }
    _q = _q.group({
      "_id": null,
      count: {
        "$sum": 1
      }
    });
    let result = await _q.exec();;
    return result.length ? result[0].count : 0;
  }
  static async excludeServicesByOffer(offers, services) {
    offers = offers.map(mongoose.Types.ObjectId);
    services = services.map(mongoose.Types.ObjectId);
    console.log(offers)
    console.log(services)
    let offerDetails = await this.aggregate(
        [{
          "$match": {
            "_id": {
              "$in": offers
            },
            "status": true
          }
        }]
      )
      .group({
        "_id": null,
        "services": {
          "$push": "$services"
        }
      })
      .project({
        "selected_services": services,
        "services": {
          "$reduce": {
            "input": "$services",
            "initialValue": [],
            "in": {
              "$concatArrays": ["$$value", "$$this"]
            }
          }
        }
      })
      .project({
        "included_services": {
          $setDifference: ["$selected_services", "$services"]
        },
        "excluded_services": {
          $setIntersection: ["$services", "$selected_services"]
        }
      })
      .lookup({
        "from": "services",
        "localField": "excluded_services",
        "foreignField": "_id",
        "as": "excluded_services"
      });
    let excluded_services = offerDetails[0].excluded_services.map((v) => {
      console.log(v.name);
      return v.name
    });
    return {
      services: offerDetails[0].included_services,
      excluded_services: excluded_services
    }
  }
}
tableSchema.loadClass(OfferClass);
module.exports = mongoose.model('Offer', tableSchema);
