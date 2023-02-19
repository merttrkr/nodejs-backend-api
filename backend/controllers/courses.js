const ErrorResponse = require('../utils/errorResponse')
const Course = require('../models/Course');
const asyncHandler = require('../middleware/async');


//  @desc       get all courses
//  @route      GET /api/v1/courses
//  @route      GET /api/v1/bootcamps/:bootcampId/courses
//  @access     Public

exports.getBootcamps = asyncHandler(async(req, res, next) => {
    let query;
    let bootcampId = req.params.bootcampId;
    if (bootcampId) {
        query= Course.find({ bootcamp: bootcampId})
    }
    else{
        query = Course.find();
    }
    const courses = await query;

    res.status(200).json({
        success: true,
        count: courses.length,
        data: courses
      });
}); 