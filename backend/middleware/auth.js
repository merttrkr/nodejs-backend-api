const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse =require('../utils/errorResponse');
const user = require('../models/User');
const User = require('../models/User');

//  protect routes

exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
   
    token = req.headers["authorization"].split(' ')[1];
  }

    else if (req.cookies.token) {
      token = req.cookies.token
    }

  //make sure token exist
  if (!token) {
    return next(new ErrorResponse('Not authorize to access this route',401));
  }

  //verify token
  try {
    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    console.log("decoded: ",decoded);

    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    next(new ErrorResponse('Not authorize to access this route',401));
  }
});


//  grant access to specific roles
exports.authorize = (...roles)=>{
  return (req,res,next) => {
    if (!roles.includes(req.user.role)) {
      next(new ErrorResponse(`User role ${req.user.role } is not authorized to access this route`,403));
    }
    next();
  }
}

// check existence of resource and ownership

exports.checkIfExistsAndOwned = (Model) => asyncHandler(async (req, res, next) => {
  let id = Object.values(req.params)[0];
  let resource = await Model.findById(id);
  if (!resource) {
    console.log(req.params);
    return next(new ErrorResponse(`No resource with the id of ${id}`),404);
  }  
  
   //make sure user is resource owner
   console.log(resource.user,"req user id",req.user.id);
   if (resource.user.toString() !== req.user.id && req.user.role !=='admin') {
      return next(new ErrorResponse(`user id ${req.user.id} is not authorized to update this resource} `,401));
  }
  next();
});