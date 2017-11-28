const appntmntSltsModel = require(MODELS + 'appointmentSlots');
const appntmntModel = require(MODELS + 'appointments');
exports.checkForFutureAppointment = async(req, res, next) => {
  try {
    let date = req.body.current_date ? new Date(req.body.current_date): undefined;
    let appFlag = await appntmntModel.checkForFutureAppointment(req.user._id, req.body.vin, date);
    if (appFlag) return next(new Error('You can\'t have multiple appointments.'));
    next();
  } catch (ex) {
    next(ex);
  }
};
exports.checkForFutureAppointmentService = async(req, res, next) => {
  try {
    let date = req.body.current_date ? new Date(req.body.current_date): undefined;
    let appFlag = await appntmntModel.checkForFutureAppointment(req.body.user, req.body.vin, date);
    if (appFlag) return next(new Error('You can\'t have multiple appointments.'));
    next();
  } catch (ex) {
    next(ex);
  }
};
exports.isSlotAvailable = async(req, res, next) => {
  if (!req.body.booked_at && !req.query.booked_at) return next();
  try {
    req.body.booked_at = new Date(req.body.booked_at || req.query.booked_at);
    req.body.booked_at_string = req.body.booked_at.toISOString();
    let isSlotAvailable = await appntmntSltsModel.isSlotAvailable(req.body.booked_at);
    if (!isSlotAvailable) return next(new Error('Slot is not available.'));
    next();
  } catch (ex) {
    next(ex);
  }
};
