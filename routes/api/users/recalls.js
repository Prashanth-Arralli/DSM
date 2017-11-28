const express = require('express');
const router = express.Router();
const recallsController = require(CONTROLLERS + 'users/recalls');
const validation = require(VALIDATIONS + 'index');
const auth = require(MIDDLEWARES + 'auth')
const appntmntsMiddleware = require(MIDDLEWARES + 'appointment');
const recallMiddleware = require(MIDDLEWARES + 'recalls');

router.get('/',
  auth.authenticateAsUser,
  recallsController.getRecalls
);
router.put('/request/:id',
auth.authenticateAsUser,
recallsController.requestRecall
);
router.put('/close/:id',
recallsController.closeCompleteRecall
);

router.get('/ready',
auth.authenticateAsUser,
recallsController.getReadyRecalls
);
router.post('/schedule',
  auth.authenticateAsUser,
  recallMiddleware.getRecall,
  // appntmntsMiddleware.isSlotAvailable,
  recallsController.scheduleRecall
);

module.exports = router;
