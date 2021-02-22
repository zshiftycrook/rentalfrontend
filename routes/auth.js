const { Router, response, request } = require('express');
const express=require('express');
const authController =require('../controllers/auth')
const router =express.Router();
const multer = require('multer')
const upload = multer ({dest:'./uploads/'});
const asyncHandler =require('express-async-handler')



//login
router.post('/login',authController.login);
//Create
router.post('/register',authController.register)
//router.post('/cusregister',authController.registerUser)
router.post('/registerCustomer',authController.registerCustomer);
router.post('/registerPayment',authController.registerPayment);
router.post('/registerRoom',authController.registerRoom)
router.post('/upload',upload.single('myprofile'),authController.upload)
router.post('/registerRental', authController.registerRental)
router.post('/changePassword',authController.changepassword)
router.post('/terminate-rental',authController.terminaterental)
router.post('/refund',authController.refund);
//List

// //Delete

// //routes that load the edit page 

// //Edit page

router.post('/editRoom',authController.editRoom)
router.post('/editPayment',authController.editPayment)
router.post('/editcus',authController.editCus)
router.post('/editRental',authController.editRental)
module.exports = router;
