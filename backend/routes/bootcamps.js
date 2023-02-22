
const express = require('express');
const router = express.Router();

const {
  getBootcamps,
  getBootcamp,
  updateBootcamps,
  deleteBootcamps,
  createBootcamps,
  getBootcampsInRadius,
  bootcampPhotoUpload
} = require('../controllers/bootcamps');

const Bootcamp = require('../models/Bootcamp');
const advancedResults = require('../middleware/advancedResults');

// include other resource routers
const courseRouter = require('./courses');

const {protect} = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:bootcampId/courses',courseRouter);

router
    .route('/radius/:zipcode/:distance')
    .get(getBootcampsInRadius);

router
    .route('/')
    .get(advancedResults(Bootcamp,'courses'),getBootcamps)//passing middleware
    .post(protect,createBootcamps);

router
    .route('/:id')
    .get(getBootcamp)
    .put(protect,updateBootcamps)
    .delete(protect,deleteBootcamps);
    
    router
    .route('/:id/photo')
    .put(protect,bootcampPhotoUpload);

module.exports = router;
