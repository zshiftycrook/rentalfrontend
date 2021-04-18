const { Router } = require('express');
const express=require('express');
const { authUser }= require('../controllers/basicAuth')
const router =express.Router();
const axios = require('axios');

const asyncHandler =require('express-async-handler');
const { get } = require('./auth');
async function earnings(req){
    var total = 0;
    await axios.get('http://strapi.nonstopplc.com:1440/Payments',
    tokenPayload(req))
    .then(function(results){
        
        for (var i=0;results.data[i] != undefined;i++){
            total = results.data[i].price + total
            
        }
        console.log(total)
       
    })
    return total;
}
async function paidunitil(req,rid){
    var lastpayed = null ;
    
    await axios.get('http://strapi.nonstopplc.com:1440/Payments?_where[rental.id]='+rid,
     tokenPayload(req))
    .then(async function(results){
       // console.log(results.data)
        if(results.data == ''){
            var j= await getRental(rid,req)
            lastpayed = j.data.starting
        }
        else{ 
            for (var i=0;results.data[i] != undefined; i++){
            if(lastpayed == null){
               lastpayed = results.data[i].ends
               
            }
            else if(lastpayed<results.data[i].ends){
                lastpayed = results.data[i].ends
                
            }
            
        }}
       
       //console.log(lastpayed)
        
    })

    return (lastpayed);
}

async function getRented(req){
    var send;
    await axios.get(' http://strapi.nonstopplc.com:1440/Rentals?_where[passed]=false',
     tokenPayload(req))
    .then(async function(results){

        for (var i=0;results.data[i] != undefined; i++){
          
         results.data[i].paiduntil= await paidunitil(req,results.data[i].id)
        
        }
        
        send = results
         
        })
        return (send)

 }
 async function notRented(req){
     return axios.get('http://strapi.nonstopplc.com:1440/Rooms?_where[status_ne]=Rented',
    tokenPayload(req))
 }



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
function Rentedroom(req){
    return axios.get('http://strapi.nonstopplc.com:1440/Rooms?_where[status]=Rented',
    tokenPayload(req))
}
function totalVacant(req){
    return axios.get('http://strapi.nonstopplc.com:1440/Rooms?_where[status]=Available',
    tokenPayload(req))
}
function totalTenant(req){
    return axios.get('http://strapi.nonstopplc.com:1440/Customers',
    tokenPayload(req))
}
function totalMaintaince (req){
    return axios.get('http://strapi.nonstopplc.com:1440/Rooms?_where[status]=Maintenance',
    tokenPayload(req))
}
function room(req){
    return axios.get('http://strapi.nonstopplc.com:1440/Rooms',
    tokenPayload(req))
}
async function getRental(id,req){
    return axios.get('http://strapi.nonstopplc.com:1440/Rentals/'+id,
    tokenPayload(req))
}
function Rental(req){
    return axios.get('http://strapi.nonstopplc.com:1440/Rentals',
    tokenPayload(req))
}
function Parkings(req){
    return axios.get('http://strapi.nonstopplc.com:1440/Parkings',
    tokenPayload(req))
}
function getRoomNumber(data,req){
    return axios.get('http://strapi.nonstopplc.com:1440/Rooms/'+data,tokenPayload(req))
}
function listparking(rental,parking){
    var i
    var j
    var display ={}
    var name = 'data'
    var flag =false
   display[name] = [];
    for (i=0;parking.data[i] != undefined; i++){
        for (j=0;rental.data[j] != undefined; j++){
            flag = false
            controller = new Date();
            
            if(new Date(parking.data[i].ends) > controller)
            {   
                if(parking.data[i].Valid == true)
                {
                   // console.log(flag) 
                    flag=true
                }
            }
            console.log(parking.data[i])
            if(parking.data[i].rental.id==rental.data[j].id)
            {
                    var data ={
                        id : parking.data[i].id,
                        cname : rental.data[j].customer.name,
                        roomnumber : rental.data[j].room.roomnumber,
                        paid : parking.data[i].cost,
                        refundable : flag
                    };
                    
                    display[name].push(data)
            }
        }
    }
    return display[name];
 //   console.log(data)
}
function listPayment(rental,payment){
    var i
    var j
    var display ={}
    var name = 'data'
    var flag =false
   display[name] = [];
    for (i=0;payment.data[i] != undefined; i++){
        for (j=0;rental.data[j] != undefined; j++){
            flag = false
            controller = new Date();
            
            if(new Date(payment.data[i].ends) > controller)
            {   console.log(i)
                console.log(payment.data[27])
                if(payment.data[i].refunded != true)
                {
                   // console.log(flag) 
                    flag=true
                }
            }
        
            if(payment.data[i].rental.id==rental.data[j].id)
            {
                    var data ={
                        id : payment.data[i].id,
                        cname : rental.data[j].customer.name,
                        roomnumber : rental.data[j].room.roomnumber,
                        paid : payment.data[i].price,
                        refundable : flag
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
    res.render('login',{layout: false});
})
router.get('/index',auth,asyncHandler(async (req,res)=>{
    var Rented = await Rentedroom(req)
    var Total = await room(req)
    var Vacant = await totalVacant(req)
    var Maintaince = await totalMaintaince(req)
    var Occupancy = Math.round((Rented.data.length/Total.data.length)*100);
    // Totalrental = await Rental(req)
    var Totalpayment = await earnings(req)
    //var Totalroom = await Room(req)
    var Totaltenants = await totalTenant(req)
    var htmlFinanace  = await isFinanace(req);
    var htmlManager = await isManager(req);
    var htmlMarketer = await isMarketer(req);
    var rentedList = await getRented(req)
    var notRentedlist = await notRented(req);
    
    res.render('index',{tableList1: notRentedlist.data, tableList2: rentedList.data,layout: false,Totaltenants: Totaltenants.data.length,RoomTotal: Total.data.length,Maintaince: Maintaince.data.length ,Vacant: Vacant.data.length ,Rented: Rented.data.length ,Occupancy:Occupancy,earnings: Totalpayment ,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager ,image:req.cookies.image,user:req.cookies.user})
}))
router.get('/forgot-password',auth,(req,res)=>{
    res.render('forgot-password');
})
router.get('/add-parking',auth,finance,(req,res)=>{
    var htmlFinanace =  isFinanace(req);
    var htmlManager =  isManager(req);
    var htmlMarketer =  isMarketer(req);
    axios.get('http://strapi.nonstopplc.com:1440/Users/'+req.cookies.id,
    tokenPayload(req) )
    .then(function(results){
        console.log(results)
    res.render('add-parking',{layout:false,finance: htmlFinanace,image:req.cookies.image,user: results.data.firstname})
    })
})

router.get('/add-rental',auth,marketer,(req,res)=>{
    var htmlFinanace =  isFinanace(req);
    var htmlManager =  isManager(req);
    var htmlMarketer =  isMarketer(req);
    axios.get('http://strapi.nonstopplc.com:1440/Users/'+req.cookies.id,
    tokenPayload(req) )
    .then(function(results){
        console.log(results)
    res.render('add-rental',{layout: false,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user: results.data.firstname})
    })
})
router.get('/reciept',auth,finance,(req,res)=>{
    var htmlFinanace =  isFinanace(req);
    var htmlManager =  isManager(req);
    var htmlMarketer =  isMarketer(req);
    axios.get('http://strapi.nonstopplc.com:1440/Payments/'+req.query.id,
    tokenPayload(req) )
    .then(async function(results){
       // console.log(results.data.rental.room)
    var rental = await getRental(results.data.rental.id,req)
    var month = Math.round(results.data.price/(rental.data.price*1.15))
    var vat =Math.round(results.data.price-(rental.data.price* month))
    var subtotal =Math.round(rental.data.price* month,vat);
    //console.log (rental.data)
    res.render('reciept',{layout: false,month,rentalData:rental.data,payment:results.data,subtotal: subtotal, vat, finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
    })
  //  res.render('refund',{layout:false})
})
router.get('/parkingreciept',auth,finance,(req,res)=>{
    var htmlFinanace =  isFinanace(req);
    var htmlManager =  isManager(req);
    var htmlMarketer =  isMarketer(req);
    axios.get('http://strapi.nonstopplc.com:1440/Parkings/'+req.query.id,
    tokenPayload(req) )
    .then(async function(results){
       // console.log(results.data.rental.room)
    var rental = await getRental(results.data.rental.id,req)
    // var month = Math.round(results.data.cost/(500*results.data.))
    //  var subtotal =Math.round(results.data.cost*month*);
    var vat =Math.round(subtotal*.15)
    
    //console.log (rental.data)
    res.render('reciept',{layout: false,month,rentalData:rental.data,payment:results.data,subtotal: subtotal , vat, finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
    })
  //  res.render('refund',{layout:false})
})
router.get('/add-room',auth,marketer,(req,res)=>{
    var htmlFinanace =  isFinanace(req);
    var htmlManager =  isManager(req);
    var htmlMarketer =  isMarketer(req);
    axios.get('http://strapi.nonstopplc.com:1440/Users/'+req.cookies.id,
    tokenPayload(req) )
    .then(function(results){
    res.render('add-room',{layout: false ,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user: results.username})
    })
})
router.get('/add-tenant',auth,marketer,(req,res)=>{
    var htmlFinanace =  isFinanace(req);
    var htmlManager =  isManager(req);
    var htmlMarketer =  isMarketer(req);
    axios.get('http://strapi.nonstopplc.com:1440/Users/'+req.cookies.id,
    tokenPayload(req) )
    .then(function(results){
    res.render('add-tenant',{layout: false,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user: results.username})
    })
})
router.get('/add-payment',auth,finance,(req,res)=>{
    var htmlFinanace =  isFinanace(req);
    var htmlManager =  isManager(req);
    var htmlMarketer =  isMarketer(req);
    axios.get('http://strapi.nonstopplc.com:1440/Users/'+req.cookies.id,
    tokenPayload(req) )
    .then(function(results){
    res.render('add-payment',{layout: false,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user: results.username})
    })
})


router.get('/parking_list',auth,asyncHandler(async (req,res)=>{
    rental = await Rental(req)
    parking = await Parkings(req)
    list = listparking(rental, parking)
    //console.log(listPayment(rental,payment))
    var htmlFinanace =  isFinanace(req);
    var htmlManager =  isManager(req);
    var htmlMarketer =  isMarketer(req);
    
    res.render('parking_list',{layout: false,test : list,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
    }))


router.get('/payment_list',auth,asyncHandler(async (req,res)=>{
rental = await Rental(req)
payment = await Payment(req)
list = listPayment(rental, payment)
//console.log(listPayment(rental,payment))
var htmlFinanace =  isFinanace(req);
var htmlManager =  isManager(req);
var htmlMarketer =  isMarketer(req);

res.render('payment_list',{layout: false,test : list,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
}))



router.get('/rental_list',auth,(req,res)=>{
    var htmlFinanace =  isFinanace(req);
    var htmlManager =  isManager(req);
    var htmlMarketer =  isMarketer(req);
    axios.get('http://strapi.nonstopplc.com:1440/Rentals',
    tokenPayload(req) )
    .then(function(results){
       console.log(results.data)
       res.render('rental_list',{layout: false,layout: false,rental: results.data,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user
        
     
    })
    })
    
})
router.get('/register',auth,manager,(req,res)=>{
    res.render('register',{layout: false})
})
router.get('/profile',auth,(req,res)=>{
    var htmlFinanace =  isFinanace(req);
    var htmlManager =  isManager(req);
    var htmlMarketer =  isMarketer(req);
    axios.get('http://strapi.nonstopplc.com:1440/Users/'+req.cookies.id,
    tokenPayload(req) )
    .then(function(results){
    res.render('profile',{layout: false,profile: results.data ,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
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
    res.render('room_list',{layout: false,room: results.data,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
    })
})

router.get('/table',auth,(req,res)=>{
    
    res.render('table')
})
router.get('/edit-room',auth,marketer,(req,res)=>{
    var htmlFinanace =  isFinanace(req);
    var htmlManager =  isManager(req);
    var htmlMarketer =  isMarketer(req);
    console.log(req.query.id)
    axios.get('http://strapi.nonstopplc.com:1440/Rooms/'+req.query.id,
    tokenPayload(req) )
    .then(function(results){
     console.log(results.data)
    res.render('edit-room',{layout: false,room: results.data, finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
    })
    
})
router.get('/edit-payment',auth,finance,asyncHandler(async (req,res)=>{
    var htmlFinanace =  isFinanace(req);
    var htmlManager =  isManager(req);
    var htmlMarketer =  isMarketer(req);
    
    axios.get('http://strapi.nonstopplc.com:1440/Payments/'+req.query.id,
    tokenPayload(req) )
    .then(async function(results){
       // console.log(results.data.rental.room)
    var roomnumb = await getRoomNumber(results.data.rental.room,req)
    console.log (roomnumb)
    res.render('edit-payment',{layout: false,serial:results.data.Serial,room: roomnumb.data,id:req.query.id , finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
    })
    
}))
router.get('/edit-tenant',auth,marketer,(req,res)=>{
    var htmlFinanace =  isFinanace(req);
    var htmlManager =  isManager(req);
    var htmlMarketer =  isMarketer(req);
    axios.get('http://strapi.nonstopplc.com:1440/Customers/'+req.query.id,
    tokenPayload(req) )
    .then(function(results){
    res.render('edit-tenant',{layout: false,customers: results.data,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
    })
    
})
router.get('/edit-rental',auth,marketer,(req,res)=>{
    var htmlFinanace =  isFinanace(req);
    var htmlManager =  isManager(req);
    var htmlMarketer =  isMarketer(req);
    
    axios.get('http://strapi.nonstopplc.com:1440/Rentals/'+req.query.id,
    tokenPayload(req) )
    .then(function(results){
        console.log(results.data.Meted)
    res.render('edit-rental',{layout: false,rental: results.data,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
    })
    
})
router.get('/tenant_list',auth,(req,res)=>{
    var htmlFinanace =  isFinanace(req);
    var htmlManager =  isManager(req);
    var htmlMarketer =  isMarketer(req);
    axios.get('http://strapi.nonstopplc.com:1440/Customers',
    tokenPayload(req) )
    .then(function(results){
        console.log(results)
    res.render('tenant_list',{layout: false,tenant: results.data, finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user: results.data.firstname})
    })
    
})
module.exports = router;


