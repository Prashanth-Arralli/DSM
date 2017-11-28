const bcrypt = require('bcrypt');
const config = require('config');
const settingsModel = require(MODELS + 'settings');
const pphModel = require(MODELS + 'purchase_plan_history');
const saltRounds = config.get('bcrypt.saltRounds');
const request = require('request');
const fs = require('fs');
const fetch = require('node-fetch');
exports.cryptPassword = (p) => bcrypt.hashSync(p, saltRounds);
exports.comparePassword = (p1, p2) => bcrypt.compareSync(p1, p2);
exports.paginateQueryAssigner = (where, infinitive) => {
  if (where['name'])
    where['name'] = {
      $regex: where['name'],
      $options: 'i'
    };
  let skip = where['skip'] ? parseInt(where['skip']) : 0;
  let limit = where['limit'] ? parseInt(where['limit']) : 10;
  let sort;
  if (where['sort']) {
    sort = {};
    sort[where['sort']] = parseInt(where['sort_type']) || -1;
  }
  delete where['skip'];
  delete where['limit'];
  delete where['sort'];
  delete where['sort_type'];
  if (!infinitive)
    return {
      where,
      skip,
      limit,
      sort
    };
  else return {
    where,
    undefined,
    undefined,
    sort
  };
};
exports.getSettings = async () => {
  return await settingsModel.findOne({ master_setting: true });
};
exports.getDealerSettings = async (dealer, field) => {
  return await settingsModel.findOne({ master_setting: true }).select(field);
  // return await settingsModel.findOne({ dealer }).select(field);
}
exports.getSocialSettings = async () => await settingsModel.findOne().select('social_providers');
exports.downloadImage = async (uri, name) => {
  return await new Promise((rs, rj) => {
    request(uri).pipe(fs.createWriteStream(filename)).on('close', rs);
  })
};
let makeQueryParams = exports.makeQueryParams = (paramsObject) => {
  return Object
    .keys(paramsObject)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(paramsObject[key])}`)
    .join('&');
}
exports.streetAutoComplete = async (q) => {
  let url = config.get('streetApi.endPoint') + '?' +
    makeQueryParams({
      'street': q,
      'auth-id': config.get('streetApi.authId')
    })
  console.log(url)
  return await fetch(url);
}
exports.decrementMarketingEmail = (user) => {
  let $and = [
    {
      starts: {
        '$gte': new Date()
      }
    },
    {
      ends: {
        '$lte': new Date()
      }
    }
  ];
  pphModel.update({
    user,
    $and
  }, {
      $inc: { marketing_email_count: -1 }
    }, console.log)
}
exports.getDealerPlan = async (user) => {
  let $and = [
    {
      starts: {
        '$gte': new Date()
      }
    },
    {
      ends: {
        '$lte': new Date()
      }
    }
  ];
  let plan = await pphModel.findOne({
    user,
    $and
  }).select('transactional_email transactional_sms marketing_email_count marketing_sms_count');
  if (!plan) {
    return {
      transactional_email: true,
      transactional_sms: true,
      marketing_email_count: 0,
      marketing_sms_count: 0
    }
  }
  return plan.toObejct();;
}