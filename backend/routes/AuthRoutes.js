const express=require('express')
const router=express.Router();
const {register,login,googleAuth,forgotPassword,verifyResetOTP,resetPassword}=require('../controllers/AuthController')
router.post('/register',register)
router.post('/login',login)
router.post('/google',googleAuth)
router.post('/forgot-password',forgotPassword)
router.post('/verify-reset-otp',verifyResetOTP)
router.post('/reset-password',resetPassword)
module.exports=router