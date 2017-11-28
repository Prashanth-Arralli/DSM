const mongoose = require('mongoose');
const config = require('config');
const Schema = mongoose.Schema;
const commonHelper = require(HELPERS + 'common');
const tableSchema = new Schema({
  service_adviser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dealer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  starts_on: {
    type: Date,
    required: true
  },
  start_time: {
    type: Number,
    min: 0,
    max: 23,
    required: true
  },
  end_time: {
    type: Number,
    min: 0,
    max: 23,
    required: true
  },
  ends_on: {
    type: Date,
    default: null
  },
  repeats: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly']
  },
  day_of_the_month: {
    type: Number,
    min: 1,
    max: 31,
    default: 1
  },
  day_of_the_week: {
    type: Number,
    min: 1,
    max: 7,
    default: 1
  },
  status: {
    type: Boolean,
    default: true
  },
  created_by: {
    type: Schema.Types.ObjectId,
    ref: 'User'
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
class AppointmentSlotsClass {
  static async getAppointments(data_range, start, end, where) {
    let _q = this
      .aggregate([{
        "$addFields": {
          "dateRange": data_range
        }
      }])
    if (where)
      _q = _q.match(where)
    // .match({
    // $and: [
    //   {
    //     "starts_on": {
    //       "$gte": start
    //     }
    //   },
    //   {
    //     $or: [{
    //       "ends_on": {
    //         "$lte": end
    //       }
    //     }, {
    //       "ends_on": {
    //         "$eq": null
    //       }
    //     }]
    //   }
    // ]
    // })
    _q = _q.project({
      "time_range": {
        $range: ["$start_time", "$end_time", 1]
      },
      "matched_day": {
        "$filter": {
          "input": "$dateRange",
          "as": "date",
          "cond": {
            "$or": [{
              "$and": [{
                "$eq": [{
                  "$dayOfWeek": "$$date"
                }, "$day_of_the_week"]
              },
              {
                "$eq": ["$repeats", "weekly"]
              }
              ]
            },
            {
              "$and": [{
                "$eq": [{
                  "$dayOfMonth": "$$date"
                }, "$day_of_the_month"]
              },
              {
                "$eq": ["$repeats", "monthly"]
              }
              ]
            },
            {
              "$and": [{
                "$eq": [{
                  "$year": "$$date"
                }, {
                  "$year": "$starts_on"
                }]
              },
              {
                "$eq": [{
                  "$month": "$$date"
                }, {
                  "$month": "$starts_on"
                }]
              },
              {
                "$eq": [{
                  "$dayOfMonth": "$$date"
                }, {
                  "$dayOfMonth": "$starts_on"
                }]
              },
              {
                "$eq": ["$repeats", "none"]
              }
              ]
            },
            {
              "$eq": ["$repeats", "daily"]
            }
            ]
          }
        }
      }
    })
      .match({
        "matched_day": {
          "$ne": []
        }
      })
      .unwind("time_range")
      .unwind("matched_day")
      .group({
        _id: {
          "$concat": [{
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$matched_day"
            }
          },
            "T",
          {
            $cond: [{
              "$eq": [{
                "$strLenCP": {
                  "$substr": ["$time_range", 0, -1]
                }
              }, 1]
            }, {
              "$concat": ["0", {
                "$substr": ["$time_range", 0, -1]
              }]
            },
            {
              "$substr": ["$time_range", 0, -1]
            }
            ]
          },
            ":00:00.000Z"
          ]
        },
        count: {
          "$sum": 1
        }
      })
      .lookup({
        "localField": "_id",
        "foreignField": "booked_at_string",
        "from": "appointments",
        "as": "appointments"
      })
      .project({
        "_id": 1,
        "count": 1,
        "appointments":{
          "$filter": {
            "input": "$appointments",
            "as": "ments",
            "cond":{ 
              "$eq": [ "$$ments.status", 1 ] 
            }
         }
        }
      })
      .unwind({
        path: "$appointments",
        preserveNullAndEmptyArrays: true
      })
      .lookup({
        "localField": "appointments.vin",
        "foreignField": "_id",
        "from": "vehicles",
        "as": "appointments.vin"
      })
      .unwind({
        path: "$appointments.vin",
        preserveNullAndEmptyArrays: true
      })
      .lookup({
        "localField": "appointments.vin.user",
        "foreignField": "_id",
        "from": "users",
        "as": "appointments.vin.user"
      })
      .unwind({
        path: "$appointments.vin.user",
        preserveNullAndEmptyArrays: true
      })
      .group({
        "_id": "$_id",
        "appointments": {
          "$push": "$appointments"
        },
        "count": {
          "$first": "$count"
        }
      })
      .project({
        "date_time": "$_id",
        "slots": {
          "$reduce": {
            "input": "$appointments",
            "initialValue": {
              "booked": 0,
              "total": "$count",
              "remaining": "$count"
            },
            "in": {
              "booked": {
                "$add": [{
                  "$cond": [{
                    "$or": [{
                      "$eq": ["$$this.status", 1]
                    },
                    {
                      "$eq": ["$$this.status", 0]
                    }
                    ]
                  }, 1, 0]
                }, "$$value.booked"]
              },
              "remaining": {
                "$subtract": ["$$value.remaining", {
                  "$cond": [{
                    "$or": [{
                      "$eq": ["$$this.status", 1]
                    },
                    {
                      "$eq": ["$$this.status", 0]
                    }
                    ]
                  }, 1, 0]
                }]
              },
              "total": "$$value.total",
              "appointments": "$appointments"
            }
          }
        }
      })
    return await _q.exec();
  }
  static async isSlotAvailable(date) {
    let slots = await this.aggregate([{
      "$addFields": {
        "selected_date": [date]
      }
    }])
      .project({
        "selected_date": "$selected_date",
        "matched_day": {
          "$arrayElemAt": [{
            "$filter": {
              "input": "$selected_date",
              "as": "date",
              "cond": {
                "$or": [{
                  "$and": [{
                    "$eq": [{
                      "$dayOfWeek": "$$date"
                    }, "$day_of_the_week"]
                  },
                  {
                    "$eq": ["$repeats", "weekly"]
                  }
                  ]
                },
                {
                  "$and": [{
                    "$eq": [{
                      "$dayOfMonth": "$$date"
                    }, "$day_of_the_month"]
                  },
                  {
                    "$eq": ["$repeats", "monthly"]
                  }
                  ]
                },
                {
                  "$and": [{
                    "$eq": [{
                      "$year": "$$date"
                    }, {
                      "$year": "$starts_on"
                    }]
                  },
                  {
                    "$eq": [{
                      "$month": "$$date"
                    }, {
                      "$month": "$starts_on"
                    }]
                  },
                  {
                    "$eq": [{
                      "$dayOfMonth": "$$date"
                    }, {
                      "$dayOfMonth": "$starts_on"
                    }]
                  },
                  {
                    "$eq": ["$repeats", "none"]
                  }
                  ]
                },
                {
                  "$eq": ["$repeats", "daily"]
                }
                ]
              }
            }
          }, 0]
        },
        "time_range": {
          $range: ["$start_time", "$end_time", 1]
        }
      })
      .match({
        "matched_day": {
          "$ne": []
        },
        "matched_day": {
          "$ne": null
        }
      })
      .project({
        "matched_day": 1,
        "matched_hour": {
          "$arrayElemAt": [{
            "$filter": {
              "input": "$time_range",
              "as": "time",
              "cond": {
                "$eq": [{
                  $hour: {
                    "$arrayElemAt": ["$selected_date", 0]
                  }
                }, "$$time"]
              }
            }
          }, 0]
        }
      })
      .group({
        _id: {
          "$concat": [{
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$matched_day"
            }
          },
            "T",
          {
            $cond: [{
              "$eq": [{
                "$strLenCP": {
                  "$substr": ["$matched_hour", 0, -1]
                }
              }, 1]
            }, {
              "$concat": ["0", {
                "$substr": ["$matched_hour", 0, -1]
              }]
            },
            {
              "$substr": ["$matched_hour", 0, -1]
            }
            ]
          },
            ":00:00.000Z"
          ]
        },
        count: {
          "$sum": 1
        }
      })
      .lookup({
        "localField": "_id",
        "foreignField": "booked_at_string",
        "from": "appointments",
        "as": "appointments"
      })
      .project({
        "date_time": "$_id",
        "slots": {
          "$reduce": {
            "input": "$appointments",
            "initialValue": {
              "booked": 0,
              "total": "$count",
              "remaining": "$count"
            },
            "in": {
              "booked": {
                "$add": [{
                  "$cond": [{
                    "$or": [{
                      "$eq": ["$$this.status", 1]
                    },
                    {
                      "$eq": ["$$this.status", 0]
                    }
                    ]
                  }, 1, 0]
                }, "$$value.booked"]
              },
              "remaining": {
                "$subtract": ["$$value.remaining", {
                  "$cond": [{
                    "$or": [{
                      "$eq": ["$$this.status", 1]
                    },
                    {
                      "$eq": ["$$this.status", 0]
                    }
                    ]
                  }, 1, 0]
                }]
              },
              "total": "$$value.total"
            }
          }
        }
      });
    if (slots.length === 0) return false;
    if (!slots[0].slots || !slots[0].slots.remaining || slots[0].remaining <= 0)
      return false;
    return slots[0];
  }
  static async getAppointmentsSingle(data_range, start, end, where) {
    let _q = this
      .aggregate([{
        "$addFields": {
          "dateRange": data_range
        }
      }])
    if (where)
      _q = _q.match(where)
    _q = _q.project({
      "time_range": {
        $range: ["$start_time", "$end_time", 1]
      },
      "matched_day": {
        "$filter": {
          "input": "$dateRange",
          "as": "date",
          "cond": {
            "$or": [{
              "$and": [{
                "$eq": [{
                  "$dayOfWeek": "$$date"
                }, "$day_of_the_week"]
              },
              {
                "$eq": ["$repeats", "weekly"]
              }
              ]
            },
            {
              "$and": [{
                "$eq": [{
                  "$dayOfMonth": "$$date"
                }, "$day_of_the_month"]
              },
              {
                "$eq": ["$repeats", "monthly"]
              }
              ]
            },
            {
              "$and": [{
                "$eq": [{
                  "$year": "$$date"
                }, {
                  "$year": "$starts_on"
                }]
              },
              {
                "$eq": [{
                  "$month": "$$date"
                }, {
                  "$month": "$starts_on"
                }]
              },
              {
                "$eq": [{
                  "$dayOfMonth": "$$date"
                }, {
                  "$dayOfMonth": "$starts_on"
                }]
              },
              {
                "$eq": ["$repeats", "none"]
              }
              ]
            },
            {
              "$eq": ["$repeats", "daily"]
            }
            ]
          }
        }
      }
    })
      .match({
        "matched_day": {
          "$ne": []
        }
      })
    return await _q.exec();
  }
}
tableSchema.loadClass(AppointmentSlotsClass);
module.exports = mongoose.model('Appointment_slots', tableSchema);
