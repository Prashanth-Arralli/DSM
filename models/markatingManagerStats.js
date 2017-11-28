const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const appointmentsModel = require(MODELS + 'appointments');
const _m = require('moment');

const tableSchema = new Schema({
    statMonth: {
        type: String,
        required: true,
        unique: true
    },
    customer: {
        type: Number,
        default: null
    },
    revenue: {
        type: Number,
        default: null
    },
    totalServices:{
        type: Number,
        default: null
    },
    totalOffers:{
        type: Number,
        default: null
    },
    services: [{
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'Service',
            required: true
        },
        price: {
            type: Number,
            default: null
        },
        count: {
            type: Number,
            default: null
        }
    }],
    offers: [{
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'Offer',
            required: true
        },
        price: {
            type: Number,
            default: null
        },
        count: {
            type: Number,
            default: null
        }
    }],
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

class markatingManagerStatsClass {

    static async getStats(where) {
        let _q = this.findOne(where)
            .populate('offers._id')
            .populate('services._id')
            // .select(" _id statMonth offers._id")
            // .match(where)
            // .project()
        return _q.exec();
    }

    static async getTopRecommendedServices(where) {
        let _q = this.findOne(where)
            .populate('services._id')
            .select("services")
        return _q.exec();
    }

    static async addStatistics(where) {
        let month = _m().subtract(1, "M").toDate();
        month = _m(month).format("YYYYMM");

        let topServices;
        let topOffers;
        let getRevenue;
        let customer;

        [topServices, topOffers, getRevenue, customer] = await Promise.all(
            [
                appointmentsModel.topServices(where),
                appointmentsModel.topOffers(where),
                appointmentsModel.getRevenue(where),
                appointmentsModel.totalCustomers(where)
            ]
        );


        let totalOffers = topOffers.length;
        let totalServices = topServices.length;

        let body = {
            "statMonth": month,
            "customer": customer ? customer.length : 0,
            "services": topServices,
            "offers": topOffers,
            "totalServices": totalServices,
            "totalOffers": totalOffers,
            "revenue": getRevenue.length ? getRevenue[0].price : 0
        }
        let test = await new this(body).save();

        return;

    }
}

tableSchema.loadClass(markatingManagerStatsClass);

module.exports = mongoose.model('MarkatingManagerStats', tableSchema);