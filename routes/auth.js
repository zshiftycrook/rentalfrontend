const { Router, response, request } = require('express');
const express=require('express');
const authController =require('../controllers/auth')
const router =express.Router();
const asyncHandler =require('express-async-handler')



//login
router.post('/login',authController.login);
//Create
router.post('/register',authController.register)
//router.post('/cusregister',authController.registerUser)
router.post('/registerCustomer',authController.registerCustomer);
router.post('/registerPayment',authController.registerPayment);
router.post('/registerRoom',authController.registerRoom)
router.post('/registerRental', authController.registerRental)
//List

//Delete

//routes that load the edit page 

//Edit page
router.post('/editEmp',authController.editEmp);
module.exports = router;
