const express = require('express');

const {register,login, getMe, forgotPassword, resetPassword, updateDetails, updatePassword,logout, sendVerificationEmail, verifyEmail} = require('../controllers/auth');

const router = express.Router();
const {protect} = require('../middleware/auth');

router.post('/register',register);
router.post('/login',login);
router.get('/logout',logout);
router.get('/me',protect,getMe);
router.post('/sendverificationemail',protect,sendVerificationEmail);
router.post('/forgotPasswords',forgotPassword);
router.put('/resetpassword/:resettoken',resetPassword);
router.get('/verifyemail/:verificationCode',verifyEmail);
router.put('/updateDetails',protect,updateDetails);
router.put('/updatePassword',protect,updatePassword);
module.exports = router;