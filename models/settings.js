const mongoose = require('mongoose');
const config = require('config');
const Schema = mongoose.Schema;
const commonHelper = require(HELPERS + 'common');
const tableSchema = new Schema({
    'mandril_key': String,
    'master_setting': {
        'type': Boolean,
        'default': false
    },
    'owner_mail': String,
    'owner_mail_password': String,
    'site_title': String,
    'currency': String,
    'pricing_unit': String,
    'manufactur': {
        'type': Schema.Types.ObjectId,
        'ref': 'Make'
    },
    'site_logo': {
        'url': String,
        'cdn_url': String,
        'path': String,
        'cdn_id': String
    },
    'social_providers': {
        'fb': {
            'app_id': String,
            'app_secret': String,
            'redirect_url': String
        },
        'google': {
            'app_id': String,
            'app_secret': String,
            'redirect_url': String
        }
    },
    'fav_icon': {
        'url': String,
        'cdn_url': String,
        'path': String
    },
    'contact': {
        'email': String,
        'phone': String,
        'address': String
    },
    'paypal_email': String,
    'paypal_mode': String,
    'stripe_key': String,
    'google_link': String,
    'facebook_link': String,
    'twitter_link': String,
    'maintenance': {
        'password': {
            type: String,
            set: v => commonHelper.cryptPassword(v),
            default: null
        },
        'token': {
            type: String,
            set: v => commonHelper.cryptPassword(v),
            default: null
        },
        'key': {
            type: String,
            set: v => commonHelper.cryptPassword(v),
            default: null
        }
    },
    dealer: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dataOneCredentials: {
        authorization_code: {
            type: String,
            default: null
        },
        client_id: {
            type: String,
            default: null
        }
    },
    use_credential_globally: {
        type: Boolean,
        default: false,
    },
    vinAuditCredentials: {
        key: {
            type: String,
            default: null
        },
        format: {
            type: String,
            default: 'json'
        },
        period: {
            type: String,
            default: 180
        }
    },
    nadaApiCredentials: {
        Password: {
            type: String,
            default: null
        },
        Username: {
            type: String,
            default: null
        }
    },
    kbbApiCredentials: {
        Password: {
            type: String,
            default: null
        },
        Username: {
            type: String,
            default: null
        }
    }
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
class SettingClass { }
tableSchema.loadClass(SettingClass);
module.exports = mongoose.model('Setting', tableSchema);
