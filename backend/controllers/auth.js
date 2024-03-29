const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

//  @desc       register user
//  @route      POST /api/v1/auth/register
//  @access     Public

exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  //create user
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  sendTokenResponse(user, 200, res);
});

//  @desc       login user
//  @route      POST /api/v1/auth/login
//  @access     Public

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //  validate email and password
  if (!email || !password) {
    return next(new ErrorResponse(`please provide an email and password`, 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }
  sendTokenResponse(user, 200, res);
});

//get token from mode create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  //  Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  //send response
  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
  });
};

//  @desc       get current logged in user
//  @route      GET /api/v1/auth/me
//  @access     Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    sucess: true,
    data: user,
  });
});

//  @desc       forgot passwords
//  @route      POST /api/v1/auth/forgotPasswords
//  @access     Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });
  
  // Create reset url
  const resetUrl = `${req.get('Referrer')}resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. 
  Please click this link to: \n\n ${resetUrl} reset your passwords`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message,
      reset: resetUrl,
      
    });

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

//  @desc       send verification email
//  @route      POST /api/v1/auth/sendverificationemail
//  @access     Private
exports.sendVerificationEmail = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.user.email });

  // Get reset token
  const resetToken = user.generateEmailConfirmToken();
  
  // Create reset url
  const resetUrl = `${req.get('Referrer')}verifyemail/${resetToken}`;
  console.log("reset token" ,resetToken);
  const message = `You are receiving this email because you (or someone else) has requested the verification of email. 
  Please click this link to verify your email: \n\n ${resetUrl} `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Email verification token',
      message,
      reset: resetUrl,
      
    });
    user.save();
    console.log("confirm email ",user.confirmEmailToken);

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    console.log(err);
    user.confirmEmailToken = undefined;
    user.gen = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }

});

//  @desc       reset passwords
//  @route      PUT /api/v1/auth/resetpassword/:resettoken
//  @access     Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  //find user through resetpasswordToken
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

//  @desc       verify email
//  @route      GET /api/v1/auth/verifyemail/:verificationCode
//  @access     Private
exports.verifyEmail = asyncHandler(async (req, res, next) => {
  
  //find user through resetpasswordToken
  const verificationToken = req.params.verificationCode
  console.log("token",verificationToken);
  const user = await User.findOne({
    confirmEmailToken: verificationToken
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  // Set new password
  user.confirmEmailToken = undefined;
  user.isEmailConfirmed = true;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc      Update user details
// @route     PUT /api/v1/auth/updatedetails
// @access    Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc      Update user password
// @route     PUT /api/v1/auth/updatedetails
// @access    Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Current password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc      Log user out / clear cookie
// @route     GET /api/v1/auth/logout
// @access    Public
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

