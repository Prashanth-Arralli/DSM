const express = require('express');
const router = express.Router();
const managerAppointmentController = require(CONTROLLERS + 'usedCarManagers/appointments');

router.get('/', managerAppointmentController.query);

router.get('/search', managerAppointmentController.searchAppointment);

router.get('/:id', managerAppointmentController.fetchSingle);


module.exports = router;