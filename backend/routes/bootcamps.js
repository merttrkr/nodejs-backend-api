const express = require('express');
const router = express.Router();

const {
  getBootcamps,
  getBootcamp,
  updateBootcamps,
  deleteBootcamps,
  createBootcamps,
  getBootcampsInRadius,
  bootcampPhotoUpload,
} = require('../controllers/bootcamps');

const Bootcamp = require('../models/Bootcamp');
const advancedResults = require('../middleware/advancedResults');

// include other resource routers
const courseRouter = require('./courses');

const { protect, authorize, checkIfExistsAndOwned } = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps) //passing middleware
  .post(protect, authorize('publisher', 'admin'), createBootcamps);

router
  .route('/:id')
  .get(getBootcamp)
  .put(protect, authorize('publisher', 'admin'), updateBootcamps)
  .delete(protect, authorize('publisher', 'admin'),checkIfExistsAndOwned(Bootcamp), deleteBootcamps);

router
  .route('/:id/photo')
  .put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);

module.exports = router;
