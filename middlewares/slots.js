const appntmntSltsModel = require(MODELS + 'appointmentSlots');
const appntmntModel = require(MODELS + 'appointments');
const _m = require('moment');

// exports.addDataToBody = async (req, res, next) => {
//     try {
//         let start = _m(new Date(req.body.starts_on || req.query.start));
//         let end = _m(new Date(req.body.ends_on || req.query.end));
//         let data_range = [];
//         if (req.body.repeats == 'none') {
//             let dend = _m(new Date(req.body.starts_on)).add(1, 'hours');
//             while (start.utc() < end.utc()) {
//                 data_range.push({
//                     "starts_on": new Date(start),
//                     "ends_on": new Date(dend),
//                     "start_time": start.utc().format("HH"),
//                     "end_time": _m(dend).utc().format("HH"),
//                     "service_adviser": req.body.service_adviser,
//                     "repeats": req.body.repeats,
//                 });
//                 start.add(1, 'hours');
//                 dend.add(1, 'hours');
//             }
//         }
//         if (req.body.repeats == 'daily') {
//             let dateSlots = [];
//             for (
//                 var i = new Date(start), j = 0; i <= new Date(end); i = _m(i).add(1, 'day'), j++
//             ) {
                
//                 dateSlots[j] = {
//                     date: i,
//                     slots: [],
//                 };
//                 console.log(req.body.end_time)
//                 start = _m(new Date(dateSlots[j].date));
//                 end = start.hour(req.body.end_time, 'hours');
//                 var dend = start.add(1, 'hours');
//                 console.log(start)
//                 console.log(end)
//                 while (start < end) {
//                     data_range.push({
//                         "starts_on": start,
//                         "ends_on": dend,
//                         "start_time": start.format("HH"),
//                         "end_time": dend.format("HH"),
//                         "service_adviser": req.body.service_adviser,
//                         "repeats": 'none',
//                     });
//                     start = start.add(1, 'hours');
//                     dend = dend.add(1, 'hours');
//                 }
//             }
//         }
//         if (req.body.repeats == 'weekly') {
//             let dateSlots = [];
//             let var1 = start;
//             let var2 = end;
//             for (
//                 let i = var1, j = 0; i <= var2; i = _m(i).add(1, 'day'), j++
//             ) {
//                 dateSlots[j] = {
//                     date: i,
//                     slots: [],
//                 };

//                 var starts = dateSlots[j].date;
//                 var sday = starts.format("dddd")
//                 let weekdays = req.body.weeks_days;
//                 let wde = weekdays.filter(function (d) {
//                     return d.day == sday && d.checked == true;
//                 });
//                 if (wde.length == 1) {
//                     var dend = starts;
//                     var ends = _m(dend).hour(req.body.end_time, 'hours');
//                     var dend = _m(dend).add(1, 'hours');
//                     while (starts.utc() <= ends.utc()) {
//                         data_range.push({
//                             "starts_on": starts,
//                             "ends_on": dend,
//                             "start_time": starts.format("HH"),
//                             "end_time": dend.format("HH"),
//                             "service_adviser": req.body.service_adviser,
//                             "repeats": 'none',
//                         });
//                         starts = dend;
//                         dend = dend.add(1, 'hours');
//                     }
//                 }
//             }
//         }
//         delete req.body;
//         req.body = data_range;
//         console.log(req.body)
//         // next();
//     } catch (ex) {
//         next(ex);
//     }

// }

exports.checkAvailableSlots = async (req, res, next) => {
    try {
        if(!req.user.dealer) throw new Error('Dealership not added.');
        let data = req.body;
        let indata = [];
        let insertData = Object.keys(data).map(function (key) { return data[key]; });
        for (x of insertData) {
            let already = await appntmntSltsModel.findOne(x);
            if (already === null) {
                x.dealer = req.user.dealer;
                indata.push(x)
            }
        }
        req.body = indata;
        next();
    } catch (ex) {
        next(ex);
    }
};