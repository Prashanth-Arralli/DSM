const mongoose = require('mongoose');
const config = require('config');
const Schema = mongoose.Schema;
const commonHelper = require(HELPERS + 'common');
const tableSchema = new Schema({
    value:{
        type: Number,
        enum: [0 /*'At'*/, 1 /*'Every'*/],
        default: 0
    },
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
class LookupIntervalTypeClass {
    static async getRecalls(where) {
        return await this.find(where).select('_id name description long_description picture expires_at icon');
    }
}
tableSchema.loadClass(LookupIntervalTypeClass);
module.exports = mongoose.model('LKP_OEM_Recommended_Maintenance_Interval_Type', tableSchema);
