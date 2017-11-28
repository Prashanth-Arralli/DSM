const express = require('express');
const router = express.Router();
const offersController = require(CONTROLLERS + 'marketingManagers/offers');
const validation = require(VALIDATIONS + 'index');
const fileMiddleware = require(MIDDLEWARES + 'file');
const serviceMiddleware = require(MIDDLEWARES + 'service');
router.get('/', offersController.query);
router.post('/',
  fileMiddleware.imgUpload("offerPictures").fields([{
    name: 'picture'
  }]),
  fileMiddleware.assignImageDataToBody("fields", ["picture"]),
  validation.validate('addOffers'),
  serviceMiddleware.isServicesExist,
  (req, res, next) => {
    req.body.price = 0;
    next();
  },
  serviceMiddleware.getCostForServices,
  serviceMiddleware.calculateOfferPrice,
  offersController.add
);

router.get('/images', offersController.fetchImages);

router.delete('/:id', offersController.remove);
router.get('/:id', offersController.fetchSingle);

router.put('/services/:id',
  fileMiddleware.imgUpload("offerPictures").fields([{
    name: 'picture'
  }]),
  fileMiddleware.assignImageDataToBody("fields", ["picture"]),
  serviceMiddleware.isServicesExist,
  (req, res, next) => {
    req.body.price = 0;
    next();
  },
  serviceMiddleware.getCostForServices,
  serviceMiddleware.calculateOfferPrice,
  offersController.update
);

router.put('/discount/:id',
  fileMiddleware.imgUpload("offerPictures").fields([{
    name: 'picture'
  }]),
  fileMiddleware.assignImageDataToBody("fields", ["picture"]),
  serviceMiddleware.isServicesExist,
  (req, res, next) => {
    req.body.price = 0;
    next();
  },
  serviceMiddleware.getCostForServices,
  serviceMiddleware.calculateOfferPrice,
  offersController.update
);


router.put('/:id',
  fileMiddleware.imgUpload("offerPictures").fields([{
    name: 'picture'
  }]),
  fileMiddleware.assignImageDataToBody("fields", ["picture"]),
  // serviceMiddleware.isServicesExist,
  // (req, res, next) => {
  //   req.body.price = 0;
  //   next();
  // },
  // serviceMiddleware.getCostForServices,
  // serviceMiddleware.calculateOfferPrice,
  offersController.update
);



module.exports = router;