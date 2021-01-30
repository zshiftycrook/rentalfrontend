const { Router } = require('express');
const express=require('express');
const { authUser }= require('../controllers/basicAuth')
const router =express.Router();
const axios = require('axios');
const asyncHandler =require('express-async-handler')

function manager(req,res,next){
    if (  req.cookies.aut == "Manager" ){  
        next()
    }
    else 
    {
        
        return res.status(500).render('login',{message:"authentication error please use a Management account to access these future "})
    }
}
 function marketer(req,res,next){
        if (  req.cookies.aut == "Marketer" ||  req.cookies.aut == "Manager"){
            console.log("Marketer")
            next()
        }
        else 
        {
            
            return res.status(500).render('login',{message:"authentication error please use a Marketing account to access these future "})
        }
}
function auth(req,res,next){
    if (  req.cookies.jwt != null ){
        console.log.jwt
        next()
    }
    else 
    {
        
        return res.status(500).render('login',{message:"authentication error please login"})
    }
}
function finance(req,res,next){
    if (req.cookies.aut == "Finance" || req.cookies.aut == "Manager"){
        next()
    }
    else 
    {
        return res.status(500).render('/login',{message:"authentication error please use an Finance account to access these future"})
    }
}

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
function isManager(req){
    if (req.cookies.aut == "Manager")
    {
        return true;
    }
    else {
        return false;
    }
}
function isMarketer(req){
    if(req.cookies.aut == "Marketer"||req.cookies.aut == "Manager")
    {
        return true;
    }
    else {
        return false;
    }
}
function isFinanace(req){
    if(req.cookies.aut == "Finance"||req.cookies.aut == "Manager")
    {
        return true;
    }
    else 
    {
        return false;
    }
}

router.get('/logout',auth,(req,res)=>{
    cookie = req.cookies;
    for (var prop in cookie) {
        if (!cookie.hasOwnProperty(prop)) {
            continue;
        }    
        res.cookie(prop, '', {expires: new Date(0)});
    }
    res.redirect('/');
})
router.get('/',(req,res)=>{
    res.render('login');
})
router.get('/index',auth,async(req,res)=>{
    var htmlFinanace = await isFinanace(req);
    var htmlManager = await isManager(req);
    var htmlMarketer = await isMarketer(req);
    
    res.render('index',{finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager})
})
router.get('/forgot-password',auth,(req,res)=>{
    res.render('forgot-password');
})
router.get('/add-rental',auth,marketer,(req,res)=>{
    var htmlFinanace =  isFinanace(req);
    var htmlManager =  isManager(req);
    var htmlMarketer =  isMarketer(req);
    res.render('add-rental',{finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager})
})
router.get('/add-room',auth,marketer,(req,res)=>{
    var htmlFinanace =  isFinanace(req);
    var htmlManager =  isManager(req);
    var htmlMarketer =  isMarketer(req);
    res.render('add-room',{finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager})
})
router.get('/add-tenant',auth,marketer,(req,res)=>{
    var htmlFinanace =  isFinanace(req);
    var htmlManager =  isManager(req);
    var htmlMarketer =  isMarketer(req);
    res.render('add-tenant',{finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager});
})
router.get('/add-payment',auth,finance,(req,res)=>{
    var htmlFinanace =  isFinanace(req);
    var htmlManager =  isManager(req);
    var htmlMarketer =  isMarketer(req);
    res.render('add-payment',{finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager});

})

router.get('/payment_list',auth,asyncHandler(async (req,res)=>{
rental = await Rental(req)
payment = await Payment(req)
list = listPayment(rental, payment)
console.log(listPayment(rental,payment))
var htmlFinanace =  isFinanace(req);
var htmlManager =  isManager(req);
var htmlMarketer =  isMarketer(req);

res.render('payment_list',{test : list,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager})
}))



router.get('/rental_list',auth,(req,res)=>{
    var htmlFinanace =  isFinanace(req);
    var htmlManager =  isManager(req);
    var htmlMarketer =  isMarketer(req);
    axios.get('http://strapi.nonstopplc.com:1440/Rentals',
    tokenPayload(req) )
    .then(function(results){
       console.log(results.data)
       res.render('rental_list',{rental: results.data,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager})
    })
    
})
router.get('/register',auth,manager,(req,res)=>{
    res.render('register')
})
router.get('/profile',auth,(req,res)=>{
    var htmlFinanace =  isFinanace(req);
    var htmlManager =  isManager(req);
    var htmlMarketer =  isMarketer(req);
    axios.get('http://strapi.nonstopplc.com:1440/Users/'+req.cookies.id,
    tokenPayload(req) )
    .then(function(results){
     console.log(results.data)
    res.render('profile',{profile: results.data ,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager})
    })
    
})
router.get('/404',auth,(req,res)=>{
    res.render('404')
})
router.get('/room_list',auth,(req,res)=>{
    var htmlFinanace =  isFinanace(req);
    var htmlManager =  isManager(req);
    var htmlMarketer =  isMarketer(req);
    axios.get('http://strapi.nonstopplc.com:1440/Rooms',
    tokenPayload(req) )
    .then(function(results){
     console.log(results.data[0])
    res.render('room_list',{room: results.data,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager})
    })
})

router.get('/table',auth,(req,res)=>{
    res.render('table')
})
router.get('/tenant_list',auth,(req,res)=>{
    var htmlFinanace =  isFinanace(req);
    var htmlManager =  isManager(req);
    var htmlMarketer =  isMarketer(req);
    axios.get('http://strapi.nonstopplc.com:1440/Customers',
    tokenPayload(req) )
    .then(function(results){
     console.log(results.data[0])
    res.render('tenant_list',{tenant: results.data,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager})
    })
    
})
module.exports = router;


