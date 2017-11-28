const mongoose = require('mongoose');
const config = require('config');
const Schema = mongoose.Schema;
const commonHelper = require(HELPERS + 'common');
const tableSchema = new Schema({
  service_id: {
    type: Schema.Types.ObjectId,
    ref: 'Service',
    default: null
  },
  maintenance_id: {
    type: Number,
    required: true,
    index: true,
  },
  vehicle_id: String,
  vin: String,
  engine_id: String,
  trans_notes: String,
  mileage: {
    type: Number,
    default: 0
  },
  maintenance_name: String,
  maintenance_notes: String,
  schedule_name: String,
  schedule_description: String,
  operating_parameter: String,
  operating_parameter_notes: String,
  maintenance_category: String,
  notes: String,
  interval_type: String,
  unit: String,
  computer_code: String,
  event: String,
  initial_value: {
    type: Number,
    default: 0
  },
  status: {
    type: Boolean,
    default: true
  },
  value: Number,
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
class RecommendedMaintenance {
  static async getRecalls(where) {
    return await this.find(where).select('_id name description long_description picture expires_at icon');
  }
  static async paginateData(vin, mileage, months, skip, limit, sort, year) {
    let cond;
    console.log(`paginateData recommended maintenance ${year} year`)
    if (year) {
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
                        mileage
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
                        mileage
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
                        mileage
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
                        year
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
                        year
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
                        year
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
    } else {
      console.log(`else paginateData recommended maintenance ${year} year`)
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
    mileage = parseInt(mileage);
    months = parseInt(months);
    console.log(typeof vin)
    let status = true;
    let q = this
      .aggregate();
    if (vin) {
      q = q.match({
        vehicle_id: vin,
        status
      });
    }
    q = q
      .project({
        'maintenance_id': 1,
        'maintenance_notes': 1,
        'maintenance_name': 1,
        'unit': 1,
        'interval_type': 1,
        'value': 1,
        'unit': 1,
        'is_recommended': {
          '$switch': {
            'branches': [{
              'case': {
                '$and': [{
                  '$eq': [
                    '$unit', 'Months'
                  ],
                }, {
                  '$eq': [
                    '$interval_type', 'At'
                  ]
                }]
              },
              'then': {
                '$cond': {
                  'if': {
                    '$and': [{
                        '$gt': [months, '$initial_value']
                      },
                      {
                        '$eq': [months, '$value']
                      }
                    ]
                  },
                  'then': true,
                  'else': false
                }
              }
            }, {
              'case': {
                '$and': [{
                  '$eq': [
                    '$unit', 'Months'
                  ],
                }, {
                  '$eq': [
                    '$interval_type', 'Every'
                  ]
                }]
              },
              'then': {
                '$cond': {
                  'if': {
                    '$and': [{
                        '$gt': [months, '$initial_value']
                      },
                      {
                        '$eq': [
                          0,
                          {
                            $mod: [months, '$value']
                          }
                        ]
                      }
                    ]
                  },
                  'then': true,
                  'else': false
                }
              }
            }, {
              'case': {
                '$and': [{
                  '$eq': [
                    '$unit', 'Miles'
                  ],
                }, {
                  '$eq': [
                    '$interval_type', 'At'
                  ]
                }]
              },
              'then': {
                '$cond': {
                  'if': {
                    '$and': [{
                        '$gt': [mileage, '$initial_value']
                      },
                      {
                        '$eq': [mileage, '$value']
                      }
                    ]
                  },
                  'then': true,
                  'else': false
                }
              }
            }, {
              'case': {
                '$and': [{
                  '$eq': [
                    '$unit', 'Miles'
                  ],
                }, {
                  '$eq': [
                    '$interval_type', 'Every'
                  ]
                }]
              },
              then: {
                '$let': {
                  'vars': {
                    'mods': {
                      '$mod': [mileage, '$value']
                    },
                    'mileagePercent': {
                      '$multiply': ['$value', config.get('thresholdPercentageForMile')]
                    }
                  },
                  'in': {
                    '$or': [{
                      '$and': [{
                        '$lte': [
                          '$$mods',
                          '$$mileagePercent'
                        ]
                      }, {
                        '$gte': [
                          mileage,
                          '$value'
                        ]
                      }]
                    }, {
                      '$gte': [
                        '$$mods',
                        {
                          '$subtract': [
                            '$value',
                            '$$mileagePercent'
                          ]
                        }
                      ],
                    }]
                  }
                }
              }
            }],
            'default': false
          }
        },
        // 'takenValues': {
        //   '$let': {
        //     'vars': {
        //       'mods': {
        //         '$mod': [mileage, '$value']
        //       },
        //       'mileagePercent': {
        //         '$multiply': ['$value', config.get('thresholdPercentageForMile')]
        //       }
        //     },
        //     'in': {
        //       'mods': '$$mods',
        //       'mileagePercent': '$$mileagePercent',
        //       'miles': mileage,
        //       'subtracted': {
        //         '$subtract': [
        //           '$value',
        //           '$$mileagePercent'
        //         ]
        //       },
        //       'status': {
        //         '$or': [{
        //           '$lte': [
        //             '$$mods',
        //             '$$mileagePercent'
        //           ]
        //         }, {
        //           '$gte': [
        //             '$$mods',
        //             {
        //               '$subtract': [
        //                 '$value',
        //                 '$$mileagePercent'
        //               ]
        //             }
        //           ],
        //         }]
        //       }
        //     }
        //   }
        // }
      })
    // return q.exec();
    q = q.match({
        'is_recommended': true
      })
      .lookup({
        'from': 'services',
        'localField': 'maintenance_id',
        'foreignField': 'maintenance_id',
        'as': 'service'
      })
      .unwind({
        'path': '$service',
        'preserveNullAndEmptyArrays': true
      })
      // .match({
      //   'service.status': true
      // })
      .lookup({
        "from": "offers",
        "localField": "service._id",
        "foreignField": "services",
        "as": "offers"
      })
      .project({
        "_id": "$service._id",
        "name": '$service.name',
        'maintenance_notes': 1,
        'interval_type': 1,
        'value': 1,
        'unit': 1,
        'maintenance_name': 1,
        "maintance_id": "$_id",
        "description": '$service.description',
        "price": '$service.price',
        "picture": '$service.picture',
        "recommended": '$service.recommended',
        "offers": {
          "$arrayElemAt": [{
            "$filter": {
              "input": "$offers",
              "as": "offer",
              "cond": cond
            }
          }, 0]
        },
        "offers1": {
          "$filter": {
            "input": "$offers",
            "as": "offer",
            "cond": cond
          }
        }
      })
      .project({
        "name": 1,
        "offers1": 1,
        'maintenance_notes': 1,
        'maintenance_name': 1,
        "maintance_id": 1,
        'interval_type': 1,
        'value': 1,
        'unit': 1,
        "_id": 1,
        "id": "$_id",
        "description": 1,
        "price": 1,
        "picture": 1,
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
      console.log(sort)
      q = q.sort(sort);
    }
    if (skip) {
      q = q.skip(skip);
    }
    if (limit) {
      q = q.limit(limit);
    }
    return await q.exec();
  }
  static async paginateDataCount(vin, mileage, months) {
    mileage = parseInt(mileage);
    months = parseInt(months);
    console.log('siva')
    console.log(typeof vin)
    console.log('munish')
    let status = true;
    let q = this
      .aggregate();
    if (vin) {
      q = q.match({
        vehicle_id: vin,
        status
      });
    }
    q = q
      .project({
        'maintenance_id': 1,
        'maintenance_notes': 1,
        'maintenance_name': 1,
        'unit': 1,
        'interval_type': 1,
        'value': 1,
        'is_recommended': {
          '$switch': {
            'branches': [{
              'case': {
                '$and': [{
                  '$eq': [
                    '$unit', 'Months'
                  ],
                }, {
                  '$eq': [
                    '$interval_type', 'At'
                  ]
                }]
              },
              'then': {
                '$cond': {
                  'if': {
                    '$and': [{
                        '$gt': [months, '$initial_value']
                      },
                      {
                        '$eq': [months, '$value']
                      }
                    ]
                  },
                  'then': true,
                  'else': false
                }
              }
            }, {
              'case': {
                '$and': [{
                  '$eq': [
                    '$unit', 'Months'
                  ],
                }, {
                  '$eq': [
                    '$interval_type', 'Every'
                  ]
                }]
              },
              'then': {
                '$cond': {
                  'if': {
                    '$and': [{
                        '$gt': [months, '$initial_value']
                      },
                      {
                        '$eq': [
                          0,
                          {
                            $mod: [months, '$value']
                          }
                        ]
                      }
                    ]
                  },
                  'then': true,
                  'else': false
                }
              }
            }, {
              'case': {
                '$and': [{
                  '$eq': [
                    '$unit', 'Miles'
                  ],
                }, {
                  '$eq': [
                    '$interval_type', 'At'
                  ]
                }]
              },
              'then': {
                '$cond': {
                  'if': {
                    '$and': [{
                        '$gt': [mileage, '$initial_value']
                      },
                      {
                        '$eq': [mileage, '$value']
                      }
                    ]
                  },
                  'then': true,
                  'else': false
                }
              }
            }, {
              'case': {
                '$and': [{
                  '$eq': [
                    '$unit', 'Miles'
                  ],
                }, {
                  '$eq': [
                    '$interval_type', 'Every'
                  ]
                }]
              },
              then: {
                '$let': {
                  'vars': {
                    'mods': {
                      '$mod': [mileage, '$value']
                    },
                    'mileagePercent': {
                      '$multiply': ['$value', config.get('thresholdPercentageForMile')]
                    }
                  },
                  'in': {
                    '$cond': {
                      if: {
                        '$eq': [
                          '$$mods',
                          mileage
                        ]
                      },
                      then: {
                        '$lte': [{
                            '$subtract': ['$value', mileage]
                          },
                          '$$mileagePercent'
                        ]
                      },
                      else: {
                        '$lte': [
                          '$$mods',
                          '$$mileagePercent'
                        ]
                      }
                    }
                  }
                }
              }
            }],
            'default': false
          }
        }
      })
      .lookup({
        'from': 'services',
        'localField': 'maintenance_id',
        'foreignField': 'maintenance_id',
        'as': 'service'
      })
      .unwind('service')
      .match({
        'service.status': true
      }).group({
        '_id': null,
        'count': {
          '$sum': 1
        }
      });
    let services = await q.exec();
    return services.length ? services[0].count : 0;
  }
  static async paginateDataQuery(where, skip, limit, sort) {
    let _q = this
      .aggregate()
      .match(where)
      .lookup({
        from: "vehicles",
        localField: "vehicle_id",
        foreignField: "vehicle_id",
        as: "vin"
      })
      .unwind('vin')
      .project({
        "_id": 1,
        "vehicle_id": 1,
        "engine_id": 1,
        "maintenance_name": 1,
        "maintenance_notes": 1,
        "interval_type": 1,
        "value": 1,
        "unit": 1,
        "mileage": 1,
        "vin": "$vin.vin"
      })
    if (skip) {
      _q = _q.skip(skip);
    }
    if (limit) {
      _q = _q.limit(limit);
    }
    if (sort) {
      _q = _q.sort(sort);
    }
    return await _q.exec();
  }
}

tableSchema.loadClass(RecommendedMaintenance);
module.exports = mongoose.model('OEM_Recommended_Maintenance', tableSchema);
