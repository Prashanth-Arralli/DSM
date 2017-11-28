const mongoose = require('mongoose');
const config = require('config');
const Schema = mongoose.Schema;
const commonHelper = require(HELPERS + 'common');
const moment = require('moment');
var ObjectId = mongoose.Types.ObjectId;

const tableSchema = new Schema({
  service_adviser: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  dealer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vin: {
    type: Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  recalls: {
    type: Schema.Types.ObjectId,
    ref: 'LKP_Veh_Nhtsa_Recall'
  },
  services: [{
    type: Schema.Types.ObjectId,
    ref: 'Service'
  }],
  offers: [{
    type: Schema.Types.ObjectId,
    ref: 'Offer'
  }],
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  price: {
    type: Number,
    default: 0
  },
  booked_at: {
    type: Date,
    required: true,
  },
  booked_at_string: {
    type: String
  },
  status: {
    type: Number,
    enum: [1 /*'booked'*/, 2 /*'cancelled'*/, 0 /*'blocked'*/],
    default: 1
  },
  type: {
    type: Number,
    enum: [1 /*'appointment'*/, 2 /*'walkin'*/, 3 /*'recall'*/],
    default: 1
  },
  summary: {
    title: String,
    body: String
  },
  check_in_signature: {
    path: String,
    url: String,
    cdn_url: String,
    cdn_id: String
  },
  delivery_time: {
    type: Date,
    default: null,
  },
  service_status: {
    created_at: {
      type: Date,
      default: Date.now
    },
    status: {
      type: Number,
      description: String,
      enum: [
        1 /*'yet to confirm'*/, 2 /*'checked in'*/, 3 /*'progress'*/, 4 /*'completed'*/
      ],
      default: 1
    },
    description: {
      type: String,
      default: 'Your appointment is not yet been confirmed.'
    },
  },
  service_logs: [{
    created_at: Date,
    description: String,
    status: {
      type: Number,
      enum: [
        1 /*'yet to confirm'*/, 2 /*'checked in'*/, 3 /*'progress'*/, 4 /*'completed'*/
      ],
      default: 1
    }
  }],
  created_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

class AppointmentsClass {
  static async checkForFutureAppointment(user, vin, date) {
    let where = {};
    let status = 1;
    where = {
      user,
      vin,
      status
    }
    where['service_status.status'] = {
      '$ne': 4
    };
    if (date) {
      where['booked_at'] = {
        '$gte': date
      };
    }
    return await this.count(where);
  }
  static async bookAppointment(slot, user, vin, services, price, created_by, adviser) {
    return await new this({
      user: user,
      booked_at: slot,
      vin: vin,
      booked_at_string: slot.toISOString(),
      // booked_at_string: slot.toISOString().replace('Z',''),
      service_adviser: adviser,
      services: services,
      price: price,
      status: 1,
      service_logs: [{
        created_at: new Date(),
        status: 1,
        description: 'Your appointment is not yet been confirmed.'
      }],
      created_by: created_by
    }).save();
  }
  static async updateAppointment(where, data) {
    return await this.findOneAndUpdate(where, data, {
      new: true
    })
      .populate('services')
      .populate('vin');
  }
  static async query(
    where,
    skip,
    limit,
    sort) {
    let _q = this.aggregate()
      .lookup({
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user"
      })
      .lookup({
        from: "vehicles",
        localField: "vin",
        foreignField: "_id",
        as: "vehicle"
      })
      .unwind("user")
      .unwind("vehicle")
      .match(where)
      .project({
        "_id": 1,
        "booked_at": 1,
        "created_at": -1,
        "status": 1,
        "user._id": 1,
        "user.name": 1,
        "vin._id": "$vehicle._id",
        "vin.name": "$vehicle.name",
        "vin.vin": "$vehicle.vin",
        "vin.details.model": "$vehicle.details.model",
        "vin.details.make": "$vehicle.details.make",
        "vin.details.year": "$vehicle.details.year",
        "user.email": 1,
        "user.address": 1,
        "price": 1,
        "service_status": 1
      });
    _q = _q.sort({
      "booked_at": -1,
      "created_at": -1,
      "name": 1
    });
    if (skip)
      _q = _q.skip(skip);
    if (limit)
      _q = _q.limit(limit);
    return await _q.exec();
  }
  static async getCount(
    where,
    skip,
    limit,
    sort) {
    let _q = this.aggregate()
      .lookup({
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user"
      })
      .lookup({
        from: "vehicles",
        localField: "vin",
        foreignField: "_id",
        as: "vehicle"
      })
      .unwind("user")
      .unwind("vehicle")
      .match(where)
      .group({
        _id: null,
        count: {
          "$sum": 1
        }
      });
    let result = await _q.exec();
    return result.length ? result[0].count : 0;
  }
  static async getInvoice(where) {
    return await this
      .aggregate()
      .match(where)
      .lookup({
        "localField": "offers",
        "foreignField": "_id",
        "from": "offers",
        "as": "offers"
      })
      .lookup({
        "localField": "services",
        "foreignField": "_id",
        "from": "services",
        "as": "services"
      })
      .lookup({
        "localField": "service_adviser",
        "foreignField": "_id",
        "from": "users",
        "as": "service_adviser"
      })
      .lookup({
        "localField": "vin",
        "foreignField": "_id",
        "from": "vehicles",
        "as": "vehicle"
      })
      .lookup({
        "localField": "user",
        "foreignField": "_id",
        "from": "users",
        "as": "user"
      })
      .project({
        "items": {
          "$map": {
            "input": {
              "$concatArrays": ["$services", "$offers"]
            },
            "as": "item",
            "in": {
              "name": "$$item.name",
              "description": "$$item.description",
              "price": "$$item.price"
            }
          }
        },
        "price": 1,
        "summary": 1,
        "booked_at": 1,
        "vehicle": {
          "$let": {
            "vars": {
              "vehicle": {
                "$arrayElemAt": ["$vehicle", 0]
              }
            },
            "in": {
              "vin": "$vehicle.vin",
              "name": "$vehicle.name",
              "model": "$vehicle.details.model",
              "make": "$vehicle.details.make",
              "year": "$vehicle.details.year",
              "mileage": "$$vehicle.mileage",
              "_id": "$$vehicle._id"
            }
          }
        },
        "user": {
          "$let": {
            "vars": {
              "user": {
                "$arrayElemAt": ["$user", 0]
              }
            },
            "in": {
              "name": {
                "$cond": ["$$user.name", "$$user.name", ""]
              },
              "address": {
                "$cond": ["$$user.address", "$$user.address", ""]
              },
              "phone": {
                "$cond": ["$$user.phone", "$$user.phone", ""]
              },
              "email": {
                "$cond": ["$$user.email", "$$user.email", ""]
              }
            }
          }
        },
        "service_adviser": {
          "$let": {
            "vars": {
              "user": {
                "$arrayElemAt": ["$service_adviser", 0]
              }
            },
            "in": {
              "name": {
                "$cond": ["$$user.name", "$$user.name", ""]
              },
              "address": {
                "$cond": ["$$user.address", "$$user.address", ""]
              },
              "phone": {
                "$cond": ["$$user.phone", "$$user.phone", ""]
              }
            }
          }
        },
      })
  }
  static async fetchSingle(where) {
    return await this
      .findOne(where)
      .populate({
        path: 'user',
        select: 'name _id icon picture phone address email'
      })
      .populate({
        path: 'service_adviser',
        select: 'name _id icon picture phone address email'
      })
      .populate({
        path: 'offers',
        select: '_id name description price icon picture services',
        populate: {
          path: 'services'
        }
      })
      .populate({
        path: 'services',
        select: '_id name description price icon picture'
      })
      .populate({
        path: 'vin',
        select: '_id name description amount details.make details.model details.year mileage dealer vin car_value loyalty value_shopper spend lifetime_value'
      })
      .sort({
        "created_at": -1
      });
  }
  static async getAppoinments(where) {
    let _q = this.aggregate()
      .match(where)
      .lookup({
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user"
      })
      .unwind("user")
      .project({
        "_id": 1,
        "booked_at": 1,
        "status": 1,
        "user._id": 1,
        "user.name": 1,
        "user.email": 1,
        "user.address": 1
      });
    return await _q.exec();
  }

  static async getMyAppointments(
    where,
    skip,
    limit,
    sort
  ) {
    var query = this
      .find(where)
      .populate({
        path: 'user',
        select: 'name _id icon picture address'
      })
      .populate({
        path: 'service_adviser',
        select: 'name _id icon picture'
      })
      .populate({
        path: 'offers',
        select: '_id name description price icon picture services',
        populate: {
          path: 'services'
        }
      })
      .populate({
        path: 'services',
        select: '_id name description price icon picture'
      })
      .populate({
        path: 'vin',
        select: '_id name description amount details.make details.model details.year mileage MAKE MODEL YEAR vin car_value loyalty value_shopper spend lifetime_value'
      });
    if (sort)
      query.sort(sort);
    if (skip)
      query.skip(skip);
    if (limit)
      query.limit(limit);
    return await query.exec();
  }

  static async getRevenue(query) {
    let _q = this.aggregate()
      .match(query)
      .project({
        price: 1
      })
      .group({
        "_id": null,
        price: {
          "$sum": "$price"
        }
      })

    return await _q.exec();
  }

  static async topServicesCount(where) {
    let _q = this.aggregate()
      .match(where)
      .unwind("services")
      .lookup({
        from: "services",
        localField: "services",
        foreignField: "_id",
        as: "services"
      })
      .group({
        "_id": null,
        "count": {
          "$sum": 1
        }
      })
    return _q.exec();
  }
  static async getStatistics(user, defaults) {
    let statistics = await this
      .aggregate({
        '$addFields': {
          'defaults': defaults
        }
      })
      .match({
        'user': user,
        'status': 1,
        'service_status.status': 4,
        '$and': [{
          'booked_at': {
            '$gte': moment().subtract(1, 'year').toDate()
          }
        }]
      })
      .group({
        '_id': '$user',
        'totalSpend': {
          '$sum': '$price'
        },
        'totalVisit': {
          '$sum': 1
        },
        'defaults': {
          '$first': '$defaults'
        }
      })
      .project({
        'loyalty': {
          "$multiply": [{
            "$divide": ["$totalVisit", "$defaults.averageVisit"]
          }, 100]
        },
        'spend': {
          "$multiply": [{
            "$divide": ["$totalSpend", "$defaults.customerValue"]
          }, 100]
        },
        'value_shopper': {
          "$multiply": [{
            "$divide": [{
              "$divide": [
                "$totalSpend",
                "$totalVisit"
              ]
            }, "$defaults.averageSpend"]
          }, 100]
        },
        'life_time_value': {
          "$multiply": [{
            "$divide": [{
              "$multiply": [
                "$totalSpend",
                "$defaults.averageLifeSpan"
              ]
            }, {
              "$multiply": [
                "$defaults.customerValue",
                "$defaults.averageLifeSpan"
              ]
            }]
          }, 100]
        },
        'defaults': 1
      })
    if (statistics.length) {
      let s = statistics[0];
      return {
        "loyalty": Math.round(s.loyalty),
        "spend": Math.round(s.spend),
        "value_shopper": Math.round(s.value_shopper),
        "life_time_value": Math.round(s.life_time_value)
      }
    } else {
      return {
        "loyalty": 0,
        "spend": 0,
        "value_shopper": 0,
        "life_time_value": 0
      }
    }
  }
  static async topServices(where) {
    let _q = this.aggregate()
      .match(where)
      .unwind("services")
      .lookup({
        from: "services",
        localField: "services",
        foreignField: "_id",
        as: "services"
      })
      .group({
        "_id": {
          $arrayElemAt: ["$services._id", 0]
        },
        // "name": {
        //   "$first": {
        //     $arrayElemAt: ["$services.name", 0]
        //   }
        // },
        // "description": {
        //   "$first": {
        //     $arrayElemAt: ["$services.description", 0]
        //   }
        // },
        "price": {
          "$first": {
            $arrayElemAt: ["$services.price", 0]
          }
        },
        count: {
          "$sum": 1
        }
      })
      .sort("-count")
    // .limit(5)
    return _q.exec();
  }


  static async topServices(where) {
    let _q = this.aggregate()
      .match(where)
      .unwind("services")
      .lookup({
        from: "services",
        localField: "services",
        foreignField: "_id",
        as: "services"
      })
      .group({
        "_id": {
          $arrayElemAt: ["$services._id", 0]
        },
        // "name": {
        //   "$first": {
        //     $arrayElemAt: ["$services.name", 0]
        //   }
        // },
        // "description": {
        //   "$first": {
        //     $arrayElemAt: ["$services.description", 0]
        //   }
        // },
        "price": {
          "$first": {
            $arrayElemAt: ["$services.price", 0]
          }
        },
        count: {
          "$sum": 1
        }
      })
      .sort("-count")
    // .limit(5)
    return _q.exec();
  }


  static async topServicesCurrentMonth(where) {
    let _q = this.aggregate()
      .match(where)
      .unwind("services")
      .lookup({
        from: "services",
        localField: "services",
        foreignField: "_id",
        as: "services"
      })
      .group({
        "_id": {
          $arrayElemAt: ["$services._id", 0]
        },
        "name": {
          "$first": {
            $arrayElemAt: ["$services.name", 0]
          }
        },
        "description": {
          "$first": {
            $arrayElemAt: ["$services.description", 0]
          }
        },
        "price": {
          "$first": {
            $arrayElemAt: ["$services.price", 0]
          }
        },
        count: {
          "$sum": 1
        }
      })
      .sort("-count")
      .limit(5)
    return _q.exec();
  }


  static async topOffers(where) {
    let _q = this.aggregate()
      .match(where)
      .unwind("offers")
      .lookup({
        from: "offers",
        localField: "offers",
        foreignField: "_id",
        as: "offers"
      })
      .group({
        "_id": {
          $arrayElemAt: ["$offers._id", 0]
        },
        // "name": {
        //   "$first": {
        //     $arrayElemAt: ["$services.name", 0]
        //   }
        // },
        // "description": {
        //   "$first": {
        //     $arrayElemAt: ["$services.description", 0]
        //   }
        // },
        "price": {
          "$first": {
            $arrayElemAt: ["$offers.price", 0]
          }
        },
        count: {
          "$sum": 1
        }
      })
      .sort("-count")
    // .limit(5)
    return _q.exec();
  }

  // static async getCustomer(query){
  //   let _q = this.aggregate()
  //     .match(query)
  //     .project({
  //       price: 1
  //     })
  //     .group({
  //       "_id": null,
  //       customers:{
  //         "$count" : "$price"
  //       }
  //     })

  //   return await _q.exec();
  // }

  // static async getHistory(where) {
  //   let _q = this.aggregate()
  //     .match(where)
  //     .lookup({
  //       from: "users",
  //       localField: "user",
  //       foreignField: "_id",
  //       as: "user"
  //     })
  //     .unwind("user")
  //     .lookup({
  //       from: "services",
  //       localField: "services",
  //       foreignField: "_id",
  //       as: "services"
  //     })
  //     .project({
  //       "_id": 1,
  //       "booked_at": 1,
  //       "status": 1,
  //       "user._id": 1,
  //       "user.name": 1,
  //       "user.email": 1,
  //       "user.address": 1,
  //       "price": 1,
  //       "services": 1
  //     });
  //   return await _q.exec();
  // }

  static async search(
    where,
    skip,
    limit,
    sort) {
    let _q = this.aggregate()
      .lookup({
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user"
      })
      .lookup({
        from: "vehicles",
        localField: "vin",
        foreignField: "_id",
        as: "vehicle"
      })
      .unwind("user")
      .unwind("vehicle")
      .match(where)
      .project({
        "_id": 1,
        "booked_at": 1,
        "created_at": -1,
        "status": 1,
        "user._id": 1,
        "user.name": 1,
        "user.phone": 1,
        "vin._id": "$vehicle._id",
        "vin.vin": "$vehicle.vin",
        "vin.name": "$vehicle.name",
        "vin.details.model": "$vehicle.details.model",
        "vin.details.year": "$vehicle.details.year",
        "vin.details.make": "$vehicle.details.make",
        "user.email": 1,
        "user.address": 1,
        "price": 1,
        "service_status": 1,
        "type":1
      });
    _q = _q.sort({
      "booked_at": -1,
      "created_at": -1,
      "name": 1
    });
    if (skip)
      _q = _q.skip(skip);
    if (limit)
      _q = _q.limit(limit);
    return await _q.exec();
  }

  static async totalCustomers(where) {
    let _q = this.aggregate()
      .match(where)
      .project({
        "user": 1
      })
      .group({
        "_id": "$user",
        count: {
          "$sum": 1
        }
      });
    return await _q.exec();
  }
  static async sSSearch(
    where,
    skip,
    limit,
    sort) {
    let _q = this.aggregate()
      .lookup({
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user"
      })
      .lookup({
        from: "vehicles",
        localField: "vin",
        foreignField: "_id",
        as: "vehicle"
      })
      .unwind("user")
      .unwind("vehicle")
      .match(where)
      .project({
        "_id": 1,
        "booked_at": 1,
        "created_at": -1,
        "status": 1,
        "user._id": 1,
        "user.name": 1,
        "user.phone": 1,
        "vin._id": "$vehicle._id",
        "vin.vin": "$vehicle.vin",
        "vin.name": "$vehicle.name",
        "vin.details.model": "$vehicle.details.model",
        "vin.details.year": "$vehicle.details.year",
        "vin.details.make": "$vehicle.details.make",
        "user.email": 1,
        "user.address": 1,
        "price": 1,
        "service_status": 1
      });
    _q = _q.sort({
      "booked_at": -1,
      "created_at": -1,
      "name": 1
    });
    if (skip)
      _q = _q.skip(skip);
    if (limit)
      _q = _q.limit(limit);
    return await _q.exec();
  }

};

tableSchema.loadClass(AppointmentsClass);

module.exports = mongoose.model('Appointments', tableSchema);
