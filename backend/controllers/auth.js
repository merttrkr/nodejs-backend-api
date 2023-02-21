const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');

//  @desc       register user
//  @route      POST /api/v1/auth/register
//  @access     Public

exports.register = asyncHandler(async (req, res, next) => {
  const {name, email, password, role} = req.body;
  
  //create user
  const user = await User.create({
    name,
    email,
    password,
    role
  });

  //  Create token
  const token =user.getSignedJwtToken();

  res.status(200).json({
    success: true,
    token
  });

});
