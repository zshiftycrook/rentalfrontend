const { Router } = require('express');
const express=require('express');
const { authUser }= require('../controllers/basicAuth')
const router =express.Router();
const axios = require('axios');
const asyncHandler =require('express-async-handler')
function tokenPayload(value){
    return config = {
        headers:{
            Authorization: `Bearer ${value.cookies.jwt}` 
        }
    }
}
function Payment(req){
    return     axios.get('http://strapi.nonstopplc.com:1440/Payments', tokenPayload(req))

}

function Rental(req){
    return axios.get('http://strapi.nonstopplc.com:1440/Rentals',
    tokenPayload(req))
}
function listPayment(rental,payment){
    var i
    var j
    var display ={}
    var name = 'data'
   display[name] = [];
    for (i=0;payment.data[i] != undefined; i++){
        for (j=0;rental.data[j] != undefined; j++){
            if(payment.data[i].rental.id==rental.data[j].id)
            {
                    var data ={
                        cname : rental.data[j].customer.name,
                        roomnumber : rental.data[j].room.roomnumber,
                        paid : payment.data[i].price
                    };
                    
                    display[name].push(data)
            }
        }
    }
    return display[name];
 //   console.log(data)
}

router.get('/',(req,res)=>{
    res.render('login');
})
router.get('/index',(req,res)=>{
    res.render('index')
})
router.get('/forgot-password',(req,res)=>{
    res.render('forgot-password');
})
router.get('/add-rental',(req,res)=>{
    res.render('add-rental')
})
router.get('/add-room',(req,res)=>{
    res.render('add-room')
})
router.get('/add-tenant',(req,res)=>{
    res.render('add-tenant');
})
router.get('/add-payment',(req,res)=>{
    res.render('add-payment');
})

router.get('/payment_list',asyncHandler(async (req,res)=>{
rental = await Rental(req)
payment = await Payment(req)
list = listPayment(rental, payment)
console.log(listPayment(rental,payment))

res.render('payment_list',{test : list})
}))



router.get('/rental_list',(req,res)=>{
    axios.get('http://strapi.nonstopplc.com:1440/Rentals',
    tokenPayload(req) )
    .then(function(results){
       console.log(results.data)
       res.render('rental_list',{rental: results.data})
    })
    
})
router.get('/register',(req,res)=>{
    res.render('register')
})
router.get('/profile',(req,res)=>{
    axios.get('http://strapi.nonstopplc.com:1440/Users/'+req.cookies.id,
    tokenPayload(req) )
    .then(function(results){
     console.log(results.data)
    res.render('profile',{profile: results.data})
    })
    
})
router.get('/404',(req,res)=>{
    res.render('404')
})
router.get('/room_list',(req,res)=>{
    axios.get('http://strapi.nonstopplc.com:1440/Rooms',
    tokenPayload(req) )
    .then(function(results){
     console.log(results.data[0])
    res.render('room_list',{room: results.data})
    })
})

router.get('/table',(req,res)=>{
    res.render('table')
})
router.get('/tenant_list',(req,res)=>{
    axios.get('http://strapi.nonstopplc.com:1440/Customers',
    tokenPayload(req) )
    .then(function(results){
     console.log(results.data[0])
    res.render('tenant_list',{tenant: results.data})
    })
    
})
module.exports = router;


