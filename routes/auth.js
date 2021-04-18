const { Router, response, request } = require('express');
const express=require('express');
const authController =require('../controllers/auth')
const router =express.Router();
const multer = require('multer')
const upload = multer ({dest:'./uploads/'});
const asyncHandler =require('express-async-handler');
const { route } = require('./pages');

//login
router.post('/login',authController.login);
//Create
router.post('/register',authController.register)
//router.post('/cusregister',authController.registerUser)
router.post('/registerCustomer',authController.registerCustomer);
router.post('/registerPayment',authController.registerPayment);
//router.post('/registerParkingPayment',authController.registerParkingPayment)
router.post('/registerParking',authController.registerParking)
router.post('/registerRoom',authController.registerRoom)


router.post('/uploadfile5',upload.single('mint'),authController.uploadfile)
router.post('/uploadfile3',upload.single('licence'),authController.uploadfile)
router.post('/uploadfile4',upload.single('meted'),authController.uploadfile)
router.post('/uploadfile2',upload.single('vat'),authController.uploadfile)
router.post('/uploadfile',upload.single('identification'),authController.uploadfile)
router.post('/upload',upload.single('myprofile'),authController.upload)
router.post('/registerRental', authController.registerRental)

router.post('/changePassword',authController.changepassword)
router.post('/terminate-rental',authController.terminaterental)
router.post('/refund',authController.refund);
router.post('/refundparking',authController.refundparking)
// //Edit page

router.post('/editRoom',authController.editRoom)
router.post('/editPayment',authController.editPayment)
router.post('/editcus',authController.editCus)
//router.post('/editRental',authController.editRental)
module.exports = router;
