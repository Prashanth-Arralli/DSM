const mongoose = require('mongoose');
const config = require('config');
const Schema = mongoose.Schema;
const commonHelper = require(HELPERS + 'common');
const tableSchema = new Schema({
  name: {
    type: String,
    index: true,
  },
  phone: {
    type: String
  },
  manufactur: {
    type: Schema.Types.ObjectId,
    ref: 'Make'
  },
  subscription_plan: {
    type: Schema.Types.ObjectId,
    ref: 'Purchase_plan_history'
  },
  verification: {
    token: String,
    status: {
      type: Boolean,
      default: false
    }
  },
  email: {
    type: String,
    unique: true,
    index: true,
    required: true
  },
  picture: {
    path: String,
    url: String,
    cdn_url: String,
    cdn_id: String
  },
  social_identifier: {
    fb: String,
    google: String
  },
  zip: String,
  address: String,
  password: {
    type: String,
    set: v => commonHelper.cryptPassword(v),
    default: null
  },
  dealer: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  roles: [{
    type: String,
    enum: config.get('userRoles'),
    default: 'user'
  }],
  forgot_password: {
    token: String,
    expiry: Date
  },
  accesstokens: [{
    token: String,
    expiry: {
      type: Date,
      default: null,
      set: (v) => {
        return new Date(new Date(v).getTime() + config.get('tokenExpiryBuffer'))
      }
    },
    platform: {
      type: String,
      enum: config.get('platforms')
    }
  }],
  status: {
    type: Boolean,
    default: true
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
class UserClass {
  get icon() {
    return this.picture.cdn_url || this.picture.url || config.get('defaultProfilePicture');
  }
  static async doLogin(email, password, roles, platform) {
    email = email.toLowerCase();
    console.log(email);
    var user = await this.findOne({
      email,
      roles
    });
    if (user === null) throw new Error('Email is not found.');
    else if (!commonHelper.comparePassword(password, user.password))
      throw new Error('Password is not matched.');
    else {
      let token = commonHelper.cryptPassword(new Date().getTime() + user.id);
      platform = platform || 'web';
      user.accesstokens.push({
        token: token,
        expiry: platform === 'web' ? new Date() : null,
        platform: platform
      }); //generating accesstoken for user and set expory for that
      await user.save();
      user = user.toObject();
      user.accesstoken = token; //send single access token
      delete user.picture;
      delete user.password;
      delete user.accesstokens;
      delete user._id;
      delete user.__v;
      return user;
    };
  }
  static async loginUserBySocialProvider(id, provider, platform) {
    let where = {};
    where['social_identifier'] = {};
    where['social_identifier'][provider] = id;
    var user = await this.findOne(where);
    if (user === null) throw new Error('User is not found.');
    else {
      let token = commonHelper.cryptPassword(new Date().getTime() + user.id);
      platform = platform || 'web';
      user.accesstokens.push({
        token: token,
        expiry: platform === 'web' ? new Date() : null,
        platform: platform
      }); //generating accesstoken for user and set expory for that
      await user.save();
      user = user.toObject();
      user.accesstoken = token; //send single access token
      delete user.picture;
      delete user.password;
      delete user.roles;
      delete user.accesstokens;
      delete user._id;
      delete user.__v;
      return user;
    };
  }
  static async registerUserBySocialProvider(profile, platform) {
    let userExist = await this.count({
      email: profile.email
    });
    if (userExist) throw new Error('Email is already exist.');
    profile['accesstokens'] = [];
    profile['roles'] = ['user'];
    let token = commonHelper.cryptPassword(String(new Date().getTime()));
    profile['platform'] = platform || 'web';
    profile['accesstokens'].push({
      token: token,
      expiry: platform === 'web' ? new Date() : null,
      platform: platform
    });
    let user = await new this(profile).save();
    user = user.toObject();
    user.accesstoken = token; //send single access token
    delete user.picture;
    delete user.password;
    delete user.roles;
    delete user.accesstokens;
    delete user._id;
    delete user.__v;
    return user;
  }
  static async registerUser(
    name,
    email,
    password,
    phone,
    address,
    zip,
    platform,
    roles
  ) {
    email = email.toLowerCase();
    let userExist = await this.count({
      email
    });
    if (userExist) throw new Error('Email is already exist.');
    let accesstokens = [];
    let user;
    roles = roles ? [roles] : ['user'];
    let token = commonHelper.cryptPassword(String(new Date().getTime()));
    platform = platform || 'web';
    accesstokens.push({
      token: token,
      expiry: platform === 'web' ? new Date() : null,
      platform: platform
    });
    user = await new this({
      name,
      email,
      password,
      phone,
      address,
      zip,
      accesstokens,
      roles
    }).save();
    user = user.toObject();
    user.accesstoken = token; //send single access token
    delete user.picture;
    delete user.password;
    delete user.roles;
    delete user.accesstokens;
    delete user._id;
    delete user.__v;
    return user;
  }
  static async generateForgotToken(email, roles) {
    var user = await this.findOne({
      email,
      roles
    });
    if (!user) throw new Error('Email is not found.');
    else {
      var token = commonHelper.cryptPassword(new Date().getTime() + email);;
      var token_data = {
        "token": token,
        "expiry": new Date(new Date().getTime() + (60 * 60 * 1000))
      };
      user.forgot_password = token_data
      await user.save();
      user = user.toObject();
      user.forgot_password = token; //send single access token
      delete user.picture;
      delete user.password;
      delete user.roles;
      delete user.accesstokens;
      delete user._id;
      delete user.__v;
      return user;
    }
  }
  static async resetPassword(token, password) {
    var user = await this.findOne({
      'forgot_password.token': token
    });
    if (user === null) throw new Error('Token is invalid.');
    else {
      if (new Date(user.forgot_password.expiry).getTime() >= new Date().getTime()) {
        user.password = password;
        user.save();
      } else {
        throw new Error("Token has been expired.");
      }
      user = user.toObject();
      delete user.picture;
      delete user.password;
      delete user.roles;
      delete user.forgot_password;
      delete user.accesstokens;
      delete user._id;
      delete user.__v;
      return user;
    }
  }
  static async paginateData(where, skip, limit, sort) {
    let _q = this.find(where);
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
  static async changePassword(_id, old_password, password) {
    var user = await this.findOne({
      _id
    });
    if (!commonHelper.comparePassword(old_password, user.password))
      throw new Error('Old password is wrong.');
    else {
      user.password = password;
      user.save();
      user = user.toObject();
      delete user.picture;
      delete user.password;
      delete user.roles;
      delete user.forgot_password;
      delete user.accesstokens;
      delete user._id;
      delete user.__v;
      return user;
    }
  }

  static async query(where, skip, limit, sort) {
    let dealer = where.dealer;
    delete where.dealer;
    let _q = this.aggregate()
      .match(where)
      .lookup({
        from: "vehicles",
        localField: "_id",
        foreignField: "user",
        as: "vehicles"
      })
      .unwind('vehicles')
      .match({
        'vehicles.dealer': dealer
      })
      .group({
        _id: "$_id",
        name: {
          "$first": "name",
        },
        email: {
          "$first": "$email"
        },
        vehicles: {
          "$push": "$vehicles"
        }
      })
      .project({
        _id: 1,
        name: 1,
        email: 1,
        vehicles: {
          _id: 1,
          vin: 1,
          mileage: 1,
          name: 1,
          details: 1
        }
      })
    return _q.exec();
  }

  static async countUser(where) {
    let dealer = where.dealer;
    delete where.dealer;
    let _q = this.aggregate()
      .match(where)
      .lookup({
        from: "vehicles",
        localField: "_id",
        foreignField: "user",
        as: "vehicles"
      })
      .unwind('vehicles')
      .match({
        'vehicles.dealer': dealer
      })
      .group({
        _id: "$_id",
        name: {
          "$first": "$name",
        },
        email: {
          "$first": "$email"
        },
        vehicles: {
          "$push": "$vehicles"
        }
      })
      .group({
        _id: null,
        count: {
          "$sum": 1
        }
      })
    let result = await _q.exec();
    console.log(result)
    return result.length ? result[0].count : 0;
  }
};
tableSchema.loadClass(UserClass);
module.exports = mongoose.model('User', tableSchema);
