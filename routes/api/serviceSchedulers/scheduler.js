const express = require('express');
const router = express.Router();
const SSSchedulerController = require(CONTROLLERS + 'serviceSchedulers/scheduler');
const validation = require(VALIDATIONS + 'index');
const auth = require(MIDDLEWARES + 'auth')
const slotMiddleware = require(MIDDLEWARES + 'slots')
router.post('/',
  // validation.validate('appointmentSlotsAdding'),
  // usersMiddleware.isUserAvailable('service_adviser', 'service_adviser', 'Service adviser'),
  // slotMiddleware.addDataToBody,
  slotMiddleware.checkAvailableSlots,
  SSSchedulerController.createAppntmntSlts
);
router.get('/',
  SSSchedulerController.getAppntmntSlts
);
router.get('/:id',
SSSchedulerController.getAppntmntSltsSingle
);
router.get('/appointments/:id/:vin',
SSSchedulerController.getMyAppointments
);
router.put('/:id',
SSSchedulerController.updateSingleSlts
);
router.post('/delete',
SSSchedulerController.deleteSingleSlts
);
router.post('/deleteslots',
SSSchedulerController.deleteSlts
);
module.exports = router;
