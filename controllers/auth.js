const mysql =require('mysql');
const jwt=require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { authUser } = require('./basicAuth');
const { Router, response } = require('express');
const express=require('express');
const router =express.Router();
const { search, get } = require('../routes/auth');
const axios = require('axios');
const pages =require('../routes/pages')
const { data, parseHTML } = require('jquery');
const fs = require('fs');
const date = require('date-and-time');
const exphbs = require('express-handlebars');
const Handlebars = require('handlebars');
const HandlebarsIntl = require('handlebars-intl');
const rp = require('request-promise')
var FormData = require('form-data');
var parkingcost = 500;
function addMonths(date, months) {
    var d = date.getDate();
    date.setMonth(date.getMonth() + +months);
    if (date.getDate() != d) {
      date.setDate(0);
    }
    return date;
}

async function getRental(id,req){
    return axios.get('http://strapi.nonstopplc.com:1440/Rentals/'+id,
    tokenPayload(req))
}
// for parking payment
async function ppaidunitil(req,rid){
    var lastpayed = null ;
    
    await axios.get('http://strapi.nonstopplc.com:1440/Parkingpayments?_where[rental.id]='+rid,
     tokenPayload(req))
    .then(async function(results){
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
                
            }
        }
       
      //  console.log(lastpayed)
        
    })

    return (lastpayed);
}

async function paidunitil(req,rid){
    var lastpayed = null ;
    
    await axios.get('http://strapi.nonstopplc.com:1440/Payments?_where[rental.id]='+rid,
     tokenPayload(req))
    .then(async function(results){
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
                
            }
        }
       
      //  console.log(lastpayed)
        
    })

    return (lastpayed);
}




async function marketer(value,res){
    
    console.log("error")
    console.log(value.cookies.aut)
    if ( await value.cookies.aut == "Manager"){
        console.log("Marketer")
        return true
    }
    else 
    {   
        return res.status(500).render('login',{message:"authentication error please use a Management account to access these future "})
    }
}
async function marketer(value,res){
    
    
  
        if ( await value.cookies.aut == "Marketer" || await value.cookies.aut == "Manager"){
            console.log("Marketer")
            return true
        }
        else 
        {
            
            return res.status(500).render('login',{message:"authentication error please use a Marketing account to access these future "})
        }

 
}
async function finance(value,res){

    if (value.cookies.aut == "Finance" || value.cookies.aut == "Manager"){
        return true
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
function isManager(req){
    if (req == "Manager")
    {
        return true
    }
    else {
        return false;
    }
}
function isMarketer(req){
    if(req == "Marketer"||req == "Manager")
    {
        return true;
    }
    else {
        return false;
    }
}
function isFinanace(req){
    if(req == "Finance"||req == "Manager")
    {
        return true;
    }
    else 
    {
        return false;
    }
}
exports.refundparking =async(req,res)=>{
const {id}=req.body;
    console.log(req.data)
    axios.put('http://strapi.nonstopplc.com:1440/Parkings/'+id,
    {
    Valid: false
        },
        tokenPayload(req) )
        .then(function (response){
            console.log("response");
            return res.cookie('jwt',req.cookies.jwt)
            .redirect('http://tarman.nonstopplc.com:5001/parking_list' )
        })
        .catch(function (error){
            console.log(error);
            return res.status(400).end()
        })

}
//refund
exports.refund =async(req,res)=>{
    const {id}=req.body;
    axios.put('http://strapi.nonstopplc.com:1440/Payments/'+id,
    {
    refunded: true
        },
        tokenPayload(req) )
        .then(function (response){
            console.log("response");
            return res.cookie('jwt',req.cookies.jwt)
            .redirect('http://tarman.nonstopplc.com:5001/payment_list' )
        })
        .catch(function (error){
            console.log(error);
            return res.status(400).end()
        })

}
// upload file
exports.uploadfile =async(req,res) =>{
    //console.log(req.file.fieldname)
    if(req.file.fieldname == "identification"){
         uploadfiles(req,res,req.file,"Identification")}
    else if(req.file.fieldname == "vat"){
        uploadfiles(req,res,req.file,"Vat_Reg")}
    else if(req.file.fieldname == "licence"){
        uploadfiles(req,res,req.file,"Licence")}
    else if(req.file.fieldname == "meted"){
        uploadfiles(req,res,req.file,"Meted")}
    else if(req.file.fieldname="meme"){
        uploadfiles(req,res,req.file,"Meme")
    }

}
async function  uploadfiles(req,res,file,field){
    if(file == undefined)
    {
        return res.redirect(req.get('referer'));
    }
    else {
        let out = await rp({
            method: 'POST',
            uri: 'http://strapi.nonstopplc.com:1440/upload',
            formData: {
                // Like <input type="text" name="ref">
                'ref': "rental",  // name of the Strapi data type, singular
                'field': field, // a field named "attachments" of type "Media"
                'refId': req.body.id, // strapi ID of object to attach to
                // Like <input type="file" name="files">
              //  "source": "users-permissions",
                "files": {  // must be called "files" to be "seen" by Strapi Upload module
                    name: file.filename+".pdf",
                    value: fs.createReadStream(file.path),
                    options: {
                        filename: req.cookies.id+req.file.originalname,

                        contentType:  'multipart/form-data'
                    },
                },
            },
            headers: {Authorization: `Bearer ${req.cookies.jwt}`}  // put your JWT code here
        });
        return res.redirect(req.get('referer'));
    }

    
}


//register parking
exports.registerParking = async(req,res)=>{
    console.log("Here i am")
    if ( await finance(req,res) ){
    const {roomnumber,month,spot,cost}=req.body;
   // console.log(req.body);
    
        axios.get('http://strapi.nonstopplc.com:1440/Rentals?_where[room.roomnumber]='+roomnumber+'&_where[passed] =false',
        tokenPayload(req) )
        .then(async function(results){
            console.log(results.data)      
            const start = new Date() 
            var starting=new Date(start);          
            const ending = await addMonths(start,month)           
            axios.post('http://strapi.nonstopplc.com:1440/Parkings',
            {
            spot:spot,
            starting: starting,
            ends: ending,
            cost: month*500*spot,
            rental:{
                id: results.data[0].id
            },
            room:{
                id: roomnumber,
            },
          
            },
            tokenPayload(req) )
            .then(function (response){
               
                return res.cookie('jwt',req.cookies.jwt)
                .redirect('http://tarman.nonstopplc.com:5001/parking_list' )
            })
            .catch(function (error){
                console.log(error);
                return res.status(400).end()
            })
            
        })
        .catch(function(error){
            console.log(error);
            return res.status(400).end()
        })
    }
}
// upload pic 
exports.upload = async(req,res)=>{

        if(req.file == undefined){
            return res
            .cookie('image',req.cookies.image)
            .redirect(req.get('referer',));
        }
        else {
        let out = await rp({
            method: 'POST',
            uri: 'http://strapi.nonstopplc.com:1440/upload',
            formData: {
                // Like <input type="text" name="ref">
                'ref': "user",  // name of the Strapi data type, singular
                'field': "picture", // a field named "attachments" of type "Media"
                'refId': req.cookies.id, // strapi ID of object to attach to
                // Like <input type="file" name="files">
                "source": "users-permissions",
                "files": {  // must be called "files" to be "seen" by Strapi Upload module
                    name: req.file.filename+".jpg",
                    value: fs.createReadStream(req.file.path),
                    options: {
                        filename: req.cookies.id+req.file.originalname,

                        contentType:  'multipart/form-data'
                    },
                },
            },
            headers: {Authorization: `Bearer ${req.cookies.jwt}`}  // put your JWT code here
        });
        await axios.get("http://strapi.nonstopplc.com:1440/Users?_where[id]="+req.cookies.id,
        tokenPayload(req) )
        .then(function(resu)
        {
            var route="http://strapi.nonstopplc.com:1440"+resu.data[0].picture.url

            return res.cookie('image',route/*getImageurlcookies(req))*/).redirect(req.get('referer'));

        })
        .catch(function(error){
            var route= req.cookies.image
            return res.cookie('image',route).redirect(req.get('referer'));

        })   
       
        
           
    }
}
// Change Password
exports.changepassword = async(req,res)=>{
    
    const {current,latest,confirm} = req.body;

    axios.put (' http://strapi.nonstopplc.com:1440/Users/'+req.cookies.id,
     {
       password: latest,
       passwordConfirmation: confirm,
     },tokenPayload(req)
     ) .then (response => {
       // Handle success.
       console.log ('Your user \' s password has been changed. ');
       return res.redirect(req.get('referer'));
     })
     .catch (error => {
       // Handle error.
       console.log ('An error occurred:', error);
       return redirect(req.get('referer'));
     });
   }

// Login
exports.login = async (req,res)=>{

    try{
        const {email,password}=req.body;
        if(!email || !password){
            return res.status(400).render('login',{message: 'Please provide an Email and Password'})
        }
        else
        {
            axios.post('http://strapi.nonstopplc.com:1440/auth/local',
            {
                identifier: email,
                password: password
            })
            .then(function (response){
                let val 
                if (response.data.user.picture == null){
                    val= "assets/img/dogs/image2.jpeg"
                }
                else
                {
                    console.log(response.data.user.picture.url)
                    val= "http://strapi.nonstopplc.com:1440"+response.data.user.picture.url
                }
                
                
                var htmlFinanace =  isFinanace(response.data.user.Autorization);
                var htmlManager =  isManager(response.data.user.Autorization);
                var htmlMarketer = isMarketer(response.data.user.Autorization);
                return res  .cookie('jwt',response.data.jwt)
                            .cookie('aut',response.data.user.Autorization)
                            .cookie('id',response.data.user.id)
                            .cookie('user',response.data.user.firstname)
                            .cookie('image',val) //security issue check later
                            .status(200)
                            .render('index',{layout: false,data: response.data,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
            })
            .catch(function (error){
                console.log(error);
                
                return res.status(400).render('login',{layout: false,message: "Incorrect Username or Password",image:req.cookies.image,user:req.cookies.user})
            })
        }
    }catch (error) {
        console.log(error);
    }
}
//Register Empoloyee
exports.register = async (req,res)=>{  
    if ( await marketer(req,res) ){
    const {first_name,last_name,user_name,Authorization,PhoneNumber,email, password,password_repeat,SubCity,Country}=req.body;
       // Validation of confirmed password 
       
       if(password == password_repeat){
         axios.post('http://strapi.nonstopplc.com:1440/Users', 
            {
                username: user_name,
                email: email,
                firstname: first_name,
                password: password,
                lastname: last_name,
                Autorization: Authorization,
                phonenumber: PhoneNumber,
                city: SubCity,
                country: Country,
            },
            tokenPayload(req) )
            .then(function (response){
                return res.status(200).render('index',{layout: false})
            })
            .catch(function (error){
                console.log(error.response.data.message)
                return res.status(400).render('register',{layout: false,message: error.response.data.message})
            })
        }
        else
        {
            return res.status(400).render('register',{message: "Password Doesnt Match",layout: false})
        }
    }
    
}
//Register Customer
exports.registerCustomer = async(req,res)=>{
    var htmlFinanace = await isFinanace(req);
    var htmlManager = await isManager(req);
    var htmlMarketer = await isMarketer(req);
    if ( await marketer(req,res) ){
    const {username,tin,buisness,contactperson,phonenumber,kebeleid,email,note,password,repeatepassword,status,checkbox}=req.body;
    console.log(req.body)
    if(checkbox == 'on'){
        if(password == repeatepassword){
            axios.post('http://strapi.nonstopplc.com:1440/Customers',
            {
                name: username,
                email: email,
                phonenumber: phonenumber,
                TIN: tin,
                ContactPerson: contactperson,
                KebeleId: kebeleid,
                Status: status,
                buisness: buisness,
                note: note,
                password: password

            },
            tokenPayload(req) )
            .then(function (response){
                console.log(response.data);
                return res.status(200).redirect('http://tarman.nonstopplc.com:5001/tenant_list')
            })
            .catch(function (error){
                console.log(error.response.data.message);
                return res.status(400).redirect('http://tarman.nonstopplc.com:5001/tenant_list')
            })
        }
        else
        {
            return res.status(400).render('add-tenant',{layout: false,message: "Password is not the same",finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
        }
    }
    else
       {
           return res.status(400).render('add-tenant',{layout: false,message: "Agree to terms and services",finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
       }
    }
}
//Register Room
exports.registerRoom = async(req,res)=>{
    var htmlFinanace = await isFinanace(req);
    var htmlManager = await isManager(req);
    var htmlMarketer = await isMarketer(req);

    if ( await marketer(req,res) ){
        const {roomnumber,floor,size,Status}=req.body;
        console.log(req.body)
        axios.get('http://strapi.nonstopplc.com:1440/Floor-Numbers?_where[floor]='+floor,
        tokenPayload(req) )
        .then(function(results)
        {
            console.log(results.data)
            if(results.data==''){
                return res.status(400).render('add-room',{layout: false,message: "The Floor Doesnt Exist",finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})

            }
            else{
            //floorid=;
            axios.post('http://strapi.nonstopplc.com:1440/Rooms',
            {
                roomnumber: roomnumber,
                status: Status,
                floor_number: {
                    id: results.data[0].id
                },
                size: size
            },
            tokenPayload(req) )
            .then(function (response){
                console.log(response.data[0]);

                return res
                .cookie('jwt',req.cookies.jwt)
                .redirect('http://tarman.nonstopplc.com:5001/room_list')
            //  return res.status(200).render('room_list',{room: response.data})
            })
            .catch(function (error){
                console.log(error);
                return res.status(400).render('add-room',{layout: false,message: "Room is Rented",finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
            })
        }
        })
        .catch(function(error){
            console.log(error);
            return res.status(400).render('add-room',{layout: false,message: "Floor is Rented",finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
        });
    }
    
        

   // return res.render("add-room")
 

}
//Register Rental
exports.registerRental = async(req,res)=>{
    var htmlFinanace = await isFinanace(req);
    var htmlManager = await isManager(req);
    var htmlMarketer = await isMarketer(req);

    console.log(req);
    if ( await marketer(req,res) ){
        const {cname,uid,sdate,edate,price,roomnumber,parking}=req.body;
        console.log(req.body)
        axios.get('http://strapi.nonstopplc.com:1440/Rooms?_where[roomnumber]='+roomnumber,
        tokenPayload(req) )
        .then(function(resu)
        {
                axios.get('http://strapi.nonstopplc.com:1440/Customers?_where[name]='+cname,
                tokenPayload(req) )
                .then( function (results) {
                        console.log(results.data[0].id)
                        console.log(resu.data[0].id)
                        try {
                             axios.post('http://strapi.nonstopplc.com:1440/Rentals',
                                {
                                    parking:parking,
                                    customer: {
                                        id: results.data[0].id
                                    },
                                    users_permissions_user: {
                                        id: req.cookies.id
                                    },
                                    starting: sdate,
                                    ends: edate,
                                    price: price,
                                    room: {
                                        id: resu.data[0].id,
                                    }
                                },
                                tokenPayload(req))
                                .then(function (response) {
                                    console.log(req);
                                    //uploadfile(req,req.file,response.data.id)
                                    return res.cookie('jwt',req.cookies.jwt)
                                    .redirect('http://tarman.nonstopplc.com:5001/rental_list');
                                })
                                .catch(function (error) {
                                    console.log(error);
                                    return res.status(400).render('add-rental', {layout: false, message: error.response.data.message ,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user});
                                });
                        }
                        catch (error) {
                            res.status(400).render('add-rental', { layout: false,message: "The Tenant Was not found pls check again" ,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user});
                        }

                    })
                .catch(function (error){
                    console.log(error);
                    return results.status(400).render('add-rental',{layout: false,message: error.response.data.message ,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
                })
                
        })
        .catch(function(error){
            console.log(error);
            return res.status(400).render('add-rental',{layout: false,message: error.response.data.message ,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
        })   
    }
}

//Register Payment
exports.registerPayment = async(req,res)=>{
    if ( await finance(req,res) ){
    const {roomnumber,month,serial}=req.body;
   // console.log(req.body);
    
        axios.get('http://strapi.nonstopplc.com:1440/Rentals?_where[room.roomnumber]='+roomnumber+'&_where[passed] =false',
        tokenPayload(req) )
        .then(async function(results){
            
            const start = new Date(await paidunitil(req,results.data[0].id)) 
            var starting=new Date(start);
            
            const ending = await addMonths(start,month)
            
            axios.post('http://strapi.nonstopplc.com:1440/Payments',
        {
            pcost: results.data[0].parking*month*parkingcost*1.15,
            starting: starting,
            ends: ending,
            rental:{
                id: results.data[0].id,
            },
            price: month*((results.data[0].price*1.15)),
            months : month,
            Serial : serial
            },
            tokenPayload(req) )
            .then(function (response){
               
                return res.cookie('jwt',req.cookies.jwt)
                .redirect('http://tarman.nonstopplc.com:5001/payment_list' )
            })
            .catch(function (error){
                console.log(error);
                return res.status(400).end()
            })
            
        })
        .catch(function(error){
            console.log(error);
            return results.status(400).end()
        })
    }
}
//List
//List Employee
//Delete

//Edit 
exports.editCus= async (req,res)=>{
    const {username,tin,buisness,contactperson,phonenumber,kebeleid,email,note,password,repeatepassword,Status,id}=req.body;
    var htmlFinanace =  isFinanace(req);
    var htmlManager =  isManager(req);
    var htmlMarketer =  isMarketer(req);
    console.log(Status)
  if(Status=='')
  {
        if ( await marketer(req,res) ){
   // const {username,tin,buisness,contactperson,phonenumber,kebeleid,email,note,password,repeatepassword,status,checkbox}=req.body;
    console.log(req.body)
    
            axios.put('http://strapi.nonstopplc.com:1440/Customers/'+id,
            {
                name: username,
                email: email,
                phonenumber: phonenumber,
                TIN: tin,
                ContactPerson: contactperson,
                KebeleId: kebeleid,
               // Status: Status,
                buisness: buisness,
                note: note,
                //password: password

            },
            tokenPayload(req) )
            .then(function (response){
                
                return res.status(200).cookie('jwt',req.cookies.jwt)
                .redirect('http://tarman.nonstopplc.com:5001/tenant_list')
            })
            .catch(function (error){
                console.log(error.response);
                return res.status(400).render('add-tenant',{layout: false,message: error.response.data.message,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
            })
        }
        
    
    
    }
    else{
        if ( await marketer(req,res) ){
             
                     axios.put('http://strapi.nonstopplc.com:1440/Customers/'+id,
                     {
                         name: username,
                         email: email,
                         phonenumber: phonenumber,
                         TIN: tin,
                         ContactPerson: contactperson,
                         KebeleId: kebeleid,
                         Status: Status,
                         buisness: buisness,
                         note: note,
                         //password: password
         
                     },
                     tokenPayload(req) )
                     .then(function (response){
                         console.log(response);
                         return res.status(200).cookie('jwt',req.cookies.jwt)
                         .redirect('http://tarman.nonstopplc.com:5001/tenant_list')
                     })
                     .catch(function (error){
                         console.log(error.response);
                         return res.status(400).render('add-tenant',{layout: false,message: error.response.data.message,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
                     })
                 }
                
             
    }
  }



exports.editRoom= async (req,res)=>{
    const {roomnumber,floor,size,Status,id}=req.body;
    console.log(req.body)
    var htmlFinanace = await isFinanace(req);
    var htmlManager = await isManager(req);
    var htmlMarketer = await isMarketer(req);
    if(Status==''){
        if ( await marketer(req,res) ){
            
            console.log(req.body)
            axios.get('http://strapi.nonstopplc.com:1440/Floor-Numbers?_where[floor]='+floor,
            tokenPayload(req) )
            .then(function(results)
            {
                floorid=results.data[0].id;
                axios.put('http://strapi.nonstopplc.com:1440/Rooms/'+id,
                {
                    roomnumber: roomnumber,
                    //status: Status,
                    floor_number: {
                        id: floorid
                    },
                    size: size
                },
                tokenPayload(req) )
                .then(function (response){
                    console.log(response.data[0]);
                    return res.cookie('jwt',req.cookies.jwt)
                    .redirect('http://tarman.nonstopplc.com:5001/room_list')
                //  return res.status(200).render('room_list',{room: response.data})
                })
                .catch(function (error){
                    console.log(error);
                    return res.status(400).render('edit-room',{layout: false,message: error.response.data.message,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
                })
            })
            .catch(function(error){
                console.log(error);
                return res.status(400).render('edit-room',{layout: false,message: error.response.data.message,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
            });
        }
        

    }
    else{
        if ( await marketer(req,res) ){
            
            console.log(req.body)
            axios.get('http://strapi.nonstopplc.com:1440/Floor-Numbers?_where[floor]='+floor,
            tokenPayload(req) )
            .then(function(results)
            {
                floorid=results.data[0].id;
                axios.put('http://strapi.nonstopplc.com:1440/Rooms/'+id,
                {
                    roomnumber: roomnumber,
                    status: Status,
                    floor_number: {
                        id: floorid
                    },
                    size: size
                },
                tokenPayload(req) )
                .then(function (response){
                    console.log(response.data[0]);
                    return res.cookie('jwt',req.cookies.jwt)
                    .redirect('http://tarman.nonstopplc.com:5001/room_list')
                //  return res.status(200).render('room_list',{room: response.data})
                })
                .catch(function (error){
                    console.log(error);
                    return res.status(400).render('edit-room',{layout: false,message: error.response.data.message,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
                })
            })
            .catch(function(error){
                console.log(error);
                return res.status(400).render('edit-room',{layout: false,message: error.response.data.message,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
            });
        }
    }
}

exports.editPayment= async (req,res)=>{
     var htmlFinanace = await isFinanace(req);
    var htmlManager = await isManager(req);
    var htmlMarketer = await isMarketer(req);
   
    if ( await finance(req,res) ){
        const {roomnumber,month,id,sdate,serial}=req.body;
        console.log(req.body);
        
            axios.get('http://strapi.nonstopplc.com:1440/Rentals?_where[room.roomnumber]='+roomnumber,
            tokenPayload(req) )
            .then(async function(results){
                
                const start = new Date(await paidunitil(req,results.data[0].id)) 

                var starting=new Date(start);
                
                const ending = await addMonths(start,month)
            
                axios.put('http://strapi.nonstopplc.com:1440/Payments/'+id,
            {
                starting:starting,
                ends:ending,
                rental:{
                    id: results.data[0].id,
                },
                price: month*((results.data[0].price*1.15)),
                Serial : serial
                },
                tokenPayload(req) )
                .then(function (response){
                    console.log("response");
                    return res.cookie('jwt',req.cookies.jwt)
                    .redirect('http://tarman.nonstopplc.com:5001/payment_list' )
                })
                .catch(function (error){
                    console.log(error);
                    return res.status(400).end()
                })
                
            })
            .catch(function(error){
                console.log(error);
                return results.status(400).end()
            })
        }
}
exports.editRental= async (req,res)=>{
    const {cname,sdate,edate,roomnumber,price,id,parking}=req.body;
    var htmlFinanace = await isFinanace(req);
    var htmlManager = await isManager(req);
    var htmlMarketer = await isMarketer(req);
    if ( await marketer(req,res) ){
        
        console.log(req.body)
        axios.get('http://strapi.nonstopplc.com:1440/Rooms?_where[roomnumber]='+roomnumber,
        tokenPayload(req) )
        .then(function(resu)
        {
                axios.get('http://strapi.nonstopplc.com:1440/Customers?_where[name]='+cname,
                tokenPayload(req) )
                .then( function (results) {
                        try {
                             axios.put('http://strapi.nonstopplc.com:1440/Rentals/'+id,
                                {
                                   

                                    parking:parking,
                                    customer: {
                                        id: results.data[0].id
                                    },
                                    users_permissions_user: {
                                        id: req.cookies.id
                                    },
                                    starting: sdate,
                                    ends: edate,
                                    price: price,
                                    room: {
                                        id: resu.data[0].id,
                                    }
                                },
                                tokenPayload(req))
                                .then(function (response) {
                                    console.log(response);
                                    return res.cookie('jwt',req.cookies.jwt)
                                    .redirect('http://tarman.nonstopplc.com:5001/rental_list');
                                })
                                .catch(function (error) {

                                   
                                    return res.status(400).render('edit-rental', {layout: false, message: error.response.data.message ,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user});
                                });
                        }
                        catch (error) {
                            console.log(error);
                            res.status(400).render('edit-rental', {layout: false, message: "The Tenant Was not found pls check again" ,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user});
                        }

                    })
                .catch(function (error){
                    console.log(error);
                    return results.status(400).render('edit-rental',{layout: false,message: error.response.data.message ,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
                })
                
        })
        .catch(function(error){
            console.log(error);
            return res.status(400).render('edit-rental',{layout: false,message: error.response.data.message ,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
        })   
    }
  
}
exports.terminaterental= async(req,res)=>{
    const {id}=req.body
    
    var htmlFinanace = await isFinanace(req);
    var htmlManager = await isManager(req);
    var htmlMarketer = await isMarketer(req);
    axios.get('http://strapi.nonstopplc.com:1440/Rentals/'+id,
    tokenPayload(req) )

    .then(function(results){
       console.log(results.data.room.roomnumber)

       axios.put('http://strapi.nonstopplc.com:1440/Rooms/'+results.data.room.id,
       {
        status:'Available' 
       },
       tokenPayload(req))

            .then(function(result){
                console.log("Room is Availaible now")
                axios.put('http://strapi.nonstopplc.com:1440/Rentals/'+id,
                {
                    passed:true 
                },
                tokenPayload(req))
                    .then(function(change){
                       return res.redirect(req.get('referer'));

                    })
                    .catch(function (error){
                        console.log(error);
                        return results.status(400).render('404',{layout: false,message: error.response.data.message ,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
                    })
                })
    })
    .catch(function (error){
        console.log(error);
        return results.status(400).render('404',{layout: false,message: error.response.data.message ,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
    })
  

    
  
}

//AdminLog

exports.viewActivity= async (req,res)=>{
    var htmlFinanace = await isFinanace(req);
    var htmlManager = await isManager(req);
    var htmlMarketer = await isMarketer(req);
    try{
        db.query('Select * FROM `Activity`',async (error,results)=>{
           
           return res.render('activity',{message: results});
        })
    
    }catch (error) {
        console.log(error);
    }
}
//SuperUser
exports.viewLog= async (req,res)=>{
    try{
        db.query('Select * FROM `Log`',async (error,results)=>{
           
           return res.render('Log',{message: results});
        })
    
    }catch (error) {
        console.log(error);
    }
}

