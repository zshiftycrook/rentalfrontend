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
var helpers = require('handlebars-helpers')();
const rp = require('request-promise')
var FormData = require('form-data');


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

// upload pic 
exports.upload = async(req,res)=>{
        if(req.file == undefined){
            return res
            .cookie('image',req.cookies.image)
            .redirect(req.get('referer'));
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
                            .render('index',{data: response.data,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
            })
            .catch(function (error){
                console.log(error);
                
                return res.status(400).render('login',{message: error.response.data.message,image:req.cookies.image,user:req.cookies.user})
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
                return res.status(200).render('index')
            })
            .catch(function (error){
                console.log(error.response.data.message)
                return res.status(400).render('register',{message: error.response.data.message})
            })
        }
        else
        {
            return res.status(400).render('register',{message: "Password Doesnt Match"})
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
                return res.status(200).render('tenant_list',{tenant: response.data})
            })
            .catch(function (error){
                console.log(error.response.data.message);
                return res.status(400).render('add-tenant',{message: error.response.data.message,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
            })
        }
        else
        {
            return res.status(400).render('add-tenant',{message: "Password is not the same",finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
        }
    }
    else
       {
           return res.status(400).render('add-tenant',{message: "Agree to terms and services",finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
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
            floorid=results.data[0].id;
            axios.post('http://strapi.nonstopplc.com:1440/Rooms',
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
                return res.redirect('http://tarman.nonstopplc.com:5001/room_list')
            //  return res.status(200).render('room_list',{room: response.data})
            })
            .catch(function (error){
                console.log(error);
                return res.status(400).render('add-room',{message: error.response.data.message,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
            })
        })
        .catch(function(error){
            console.log(error);
            return res.status(400).render('add-room',{message: error.response.data.message,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
        });
    }
    
        

   // return res.render("add-room")
 

}
//Register Rental
exports.registerRental = async(req,res)=>{
    var htmlFinanace = await isFinanace(req);
    var htmlManager = await isManager(req);
    var htmlMarketer = await isMarketer(req);
    if ( await marketer(req,res) ){
        const {cname,uid,sdate,edate,price,roomnumber}=req.body;
        console.log(req.body)
        axios.get('http://strapi.nonstopplc.com:1440/Rooms?_where[roomnumber]='+roomnumber,
        tokenPayload(req) )
        .then(function(resu)
        {
                axios.get('http://strapi.nonstopplc.com:1440/Customers?_where[name]='+cname,
                tokenPayload(req) )
                .then( function (results) {
                        try {
                             axios.post('http://strapi.nonstopplc.com:1440/Rentals',
                                {
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
                                    return res.redirect('http://tarman.nonstopplc.com:5001/rental_list');
                                })
                                .catch(function (error) {
                                    console.log(error);
                                    return res.status(400).render('add-rental', { message: error.response.data.message ,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user});
                                });
                        }
                        catch (error) {
                            res.status(400).render('add-rental', { message: "The Tenant Was not found pls check again" ,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user});
                        }

                    })
                .catch(function (error){
                    console.log(error);
                    return results.status(400).render('add-rental',{message: error.response.data.message ,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
                })
                
        })
        .catch(function(error){
            console.log(error);
            return results.status(400).render('add-rental',{message: error.response.data.message ,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
        })   
    }
}
//Register Payment
exports.registerPayment = async(req,res)=>{
    if ( await finance(req,res) ){
    const {roomnumber,month}=req.body;
    console.log(req.body);
    
        axios.get('http://strapi.nonstopplc.com:1440/Rentals?_where[room.roomnumber]='+roomnumber,
        tokenPayload(req) )
        .then(function(results){
            axios.post('http://strapi.nonstopplc.com:1440/Payments',
        {
            rental:{
                id: results.data[0].id,
            },
            price: results.data[0].price*month*1.15,
            },
            tokenPayload(req) )
            .then(function (response){
                console.log("response");
                return res.redirect('http://tarman.nonstopplc.com:5001/payment_list' )
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
                
                return res.status(200).redirect('http://tarman.nonstopplc.com:5001/tenant_list')
            })
            .catch(function (error){
                console.log(error.response);
                return res.status(400).render('add-tenant',{message: error.response.data.message,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
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
                         return res.status(200).redirect('http://tarman.nonstopplc.com:5001/tenant_list')
                     })
                     .catch(function (error){
                         console.log(error.response);
                         return res.status(400).render('add-tenant',{message: error.response.data.message,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
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
                    return res.redirect('http://tarman.nonstopplc.com:5001/room_list')
                //  return res.status(200).render('room_list',{room: response.data})
                })
                .catch(function (error){
                    console.log(error);
                    return res.status(400).render('edit-room',{message: error.response.data.message,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
                })
            })
            .catch(function(error){
                console.log(error);
                return res.status(400).render('edit-room',{message: error.response.data.message,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
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
                    return res.redirect('http://tarman.nonstopplc.com:5001/room_list')
                //  return res.status(200).render('room_list',{room: response.data})
                })
                .catch(function (error){
                    console.log(error);
                    return res.status(400).render('edit-room',{message: error.response.data.message,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
                })
            })
            .catch(function(error){
                console.log(error);
                return res.status(400).render('edit-room',{message: error.response.data.message,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
            });
        }
    }
}

exports.editPayment= async (req,res)=>{
     var htmlFinanace = await isFinanace(req);
    var htmlManager = await isManager(req);
    var htmlMarketer = await isMarketer(req);
   
    if ( await finance(req,res) ){
        const {roomnumber,month,id}=req.body;
        console.log(req.body);
        
            axios.get('http://strapi.nonstopplc.com:1440/Rentals?_where[room.roomnumber]='+roomnumber,
            tokenPayload(req) )
            .then(function(results){
                axios.put('http://strapi.nonstopplc.com:1440/Payments/'+id,
            {
                rental:{
                    id: results.data[0].id,
                },
                price: results.data[0].price*month*1.15,
                },
                tokenPayload(req) )
                .then(function (response){
                    console.log("response");
                    return res.redirect('http://tarman.nonstopplc.com:5001/payment_list' )
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
    const {cname,sdate,edate,roomnumber,price,id}=req.body;
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
                                    return res.redirect('http://tarman.nonstopplc.com:5001/rental_list');
                                })
                                .catch(function (error) {
                                    console.log(error);
                                    return res.status(400).render('edit-rental', { message: error.response.data.message ,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user});
                                });
                        }
                        catch (error) {
                            res.status(400).render('edit-rental', { message: "The Tenant Was not found pls check again" ,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user});
                        }

                    })
                .catch(function (error){
                    console.log(error);
                    return results.status(400).render('edit-rental',{message: error.response.data.message ,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
                })
                
        })
        .catch(function(error){
            console.log(error);
            return results.status(400).render('edit-rental',{message: error.response.data.message ,finance: htmlFinanace,marketer: htmlMarketer,manager: htmlManager,image:req.cookies.image,user:req.cookies.user})
        })   
    }
  
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

