const ErrorResponse = require('../utils/errorResponse')
const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const path = require('path');

//  @desc       get all bootcamps
//  @route      GET /api/v1/bootcamps
//  @access     Public
exports.getBootcamps = asyncHandler(async(req, res, next) => {
  
  res.status(200).json(res.advancedResults);
  
});

//  @desc       get bootcamp
//  @route      GET /api/v1/bootcamps:/id
//  @access     Public
exports.getBootcamp = asyncHandler(async(req, res, next) => {
  
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
      next(new ErrorResponse(`No bootcamp with the id of ${req.params.id}`),404);
    }

    res.status(200).json({
      success: true,
      data: bootcamp,
    });
 
});

//  @desc       create new bootcamp
//  @route      POST /api/v1/bootcamps
//  @access     Private
exports.createBootcamps = asyncHandler(async (req, res, next) => {
  // add user to req body
  req.body.user = req.user.id;

  // check for published bootcamp
  const publishedBootcamp = await Bootcamp.findOne({user: req.user.id});

  //only one bootcamp can be added
  if (publishedBootcamp && req.user.role !=='admin') {
    return next(
      new ErrorResponse(
        `the user with ID ${req.user.id} has already published bootcamp`,400
      )
    );
  }
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({
    success: true,
    data: bootcamp,
  });

});
//  @desc       Update bootcamp
//  @route      PUT /api/v1/bootcamps:/id
//  @access     Private
exports.updateBootcamps = asyncHandler(async (req, res, next) => {

    let bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: bootcamp,
    });
 
});

//  @desc       delete bootcamp
//  @route      DELETE /api/v1/bootcamps:/id
//  @access     Private
exports.deleteBootcamps = asyncHandler(async (req, res, next) => {
  
    const bootcamp = await Bootcamp.findById(req.params.id);
    //trigger middleware
    bootcamp.remove();
    res.status(200).json({
      success: true,
      data: bootcamp,
    });
 
});

//  @desc       get bootcamps within a radius
//  @route      GET /api/v1/bootcamps/radius/:zipcode/:distance/
//  @access     Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc radius using radians
  // Divide dist by radius of Earth
  // Earth Radius = 3,963 mi / 6,378 km
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  });
});

//  @desc       Upload photo for bootcamp
//  @route      PUT /api/v1/bootcamps:/id
//  @access     Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {

  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id);

  if (!req.files) {
    return next(
      new ErrorResponse(`please add a photo`,400)
    );
  }
  const file = req.files.file;
  if (!file.mimetype.startsWith('image')) {
    return next(
      new ErrorResponse(`please add an image file`,400)
    );
  }

  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(`your image size: ${file.size} should be less than ${process.env.MAX_FILE_UPLOAD}`,400)
    );
  }

  //create custom filename
  file.name=`photo_${bootcamp._id}${path.parse(file.name).ext}`;


  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err=>{
    if (err) {
      console.error(err);
      return next(
        new ErrorResponse(`problem with file upload`,500)
      );
    }
    await Bootcamp.findByIdAndUpdate(req.params.id, {photo: file.name});
    res.status(200).json({
    success: true,
    data: file.name
  });

  });
  
});