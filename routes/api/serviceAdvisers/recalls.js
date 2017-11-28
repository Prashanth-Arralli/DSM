const express = require('express');
const router = express.Router();
const recallsController = require(CONTROLLERS + 'serviceAdvisers/recalls');
const validation = require(VALIDATIONS + 'index');
const appntmntsMiddleware = require(MIDDLEWARES + 'appointment');
const auth = require(MIDDLEWARES + 'auth')


router.get('/',
recallsController.getRecalls
);
router.post('/schedule',
(req, res, next) => {
  if (!req.body.recalls)
    return next(new Error('Recalls should be present.'));
  //adding predefined data
  req.body.price = 0;
  req.body.user = req.body.user;
  req.body.created_by = req.user._id;
  req.body.dealer = req.user.dealer;
  req.body.type = 3;
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
appntmntsMiddleware.isSlotAvailable,
recallsController.scheduleRecall
);
router.get('/conform',
recallsController.conformRecall
);
router.get('/all',
recallsController.getAllRecalls
);

router.get('/:id',
recallsController.fetchSingle
);
router.put('/request/:id',
recallsController.requestRecall
);
router.put('/conform/:id',
recallsController.scheduleRecallReady
);


module.exports = router;
