const express = require('express');
const router = express.Router();
const validation = require(VALIDATIONS + 'index');
const sSAppointmentController = require(CONTROLLERS + 'serviceSchedulers/appointments');
const fileMiddleware = require(MIDDLEWARES + 'file');
const usersMiddleware = require(MIDDLEWARES + 'users');
const servicesMiddleware = require(MIDDLEWARES + 'service');
const offersMiddleware = require(MIDDLEWARES + 'offer');
const appntmntsMiddleware = require(MIDDLEWARES + 'appointment');

router.get('/', sSAppointmentController.query);

router.post('/',
    (req, res, next) => {
        if (!req.body.services && !req.body.offers)
            return next(new Error('Services or Offers should be present.'));
        //adding predefined data
        req.body.price = 0;
        req.body.created_by = req.user._id;
        req.body.service_status = {
            "description": "Your appointment is not yet been confirmed.",
            "status": 1,
            "created_at": new Date()
        };
        req.body.service_logs = [{
            "description": "Your appointment is not yet been confirmed.",
            "status": 1,
            "created_at": new Date()
        }]
        next();
    },
    appntmntsMiddleware.checkForFutureAppointmentService,
    appntmntsMiddleware.isSlotAvailable,
    servicesMiddleware.isServicesExist,
    offersMiddleware.isOffersExist,
    offersMiddleware.excludeServicesByOffer,
    servicesMiddleware.getCostForServices,
    offersMiddleware.getCostForOffers,
    sSAppointmentController.bookAppointment
);

router.post('/delete/single', sSAppointmentController.blockAppointment);

router.get('/history', sSAppointmentController.getHistory);

router.get('/search', sSAppointmentController.searchAppointment);

router.get('/slots',
    sSAppointmentController.getAppntmntSlts
);

router.get('/:id', sSAppointmentController.fetchSingle);

router.post('/:id', sSAppointmentController.cancelAppointment);


router.put('/:id',
    fileMiddleware.imgUpload("signatures").fields([{
        name: 'check_in_signature'
    }]),
    fileMiddleware.assignImageDataToBody("fields", ["check_in_signature"]),
    validation.validate('updateAppointment'),
    (req, res, next) => {
        req.body.price = 0;
        req.body.offers = req.body.offers ? req.body.offers : [];
        req.body.services = req.body.services ? req.body.services : [];
        delete req.body.type;
        next();
    },
    // appntmntsMiddleware.isSlotAvailable,
    // servicesMiddleware.isServicesExist,
    offersMiddleware.isOffersExist,
    offersMiddleware.excludeServicesByOffer,
    servicesMiddleware.getCostForServices,
    offersMiddleware.getCostForOffers,
    sSAppointmentController.updateAppointment
);



module.exports = router;
