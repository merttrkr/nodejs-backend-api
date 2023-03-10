const ErrorResponse = require('../utils/errorResponse')
const Course = require('../models/Course');
const asyncHandler = require('../middleware/async');
const Bootcamp = require('../models/Bootcamp');


//  @desc       get all courses
//  @route      GET /api/v1/courses
//  @route      GET /api/v1/bootcamps/:bootcampId/courses
//  @access     Public

exports.getCourses = asyncHandler(async(req, res, next) => {
    
    if (req.params.bootcampId) {
        const Courses = await Course.find({ bootcamp: req.params.bootcampId});
        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
            });
    }
    else{
        return res.status(200).json(res.advancedResults);
    }


}); 


//  @desc       get courses
//  @route      GET /api/v1/courses/:id
//  @access     Public
exports.getCourse = asyncHandler(async(req, res, next) => {
   
   
    const course = await Course.findById(req.params.id).populate({
        path:'bootcamp',
        select: 'name description'
    });

    if(!course){
        return next(new ErrorResponse(`No course with the id of ${req.params.id}`),404);
    };

    res.status(200).json({
        success: true,
        data: course
      });
}); 



//  @desc       add course
//  @route      POST /api/v1/bootcamps/:bootcampId/courses
//  @access     Private
exports.addCourse = asyncHandler(async(req, res, next) => {

    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;
    const course = await Course.create(req.body);

    res.status(200).json({
        success: true,
        data: course
      });
}); 

//  @desc       update course
//  @route      PUT /api/v1/courses/:id
//  @access     Private
exports.updateCourse = asyncHandler(async(req, res, next) => {

    let course = await Course.findByIdAndUpdate(req.params.id,req.body, {
        new:true,
        runValidators:true
    })
    res.status(200).json({
        success: true,
        data: course
      });
}); 


//  @desc       delete course
//  @route      DELETE /api/v1/courses/:id
//  @access     Private
exports.deleteCourse = asyncHandler(async(req, res, next) => {

    await Course.findByIdAndDelete(req.params.id);
      
    res.status(200).json({
        success: true,
        data: {},
        postMessage:'DELETED'
      });
}); 