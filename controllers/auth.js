const mysql =require('mysql');
const jwt=require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { authUser } = require('./basicAuth');
const { Router, response } = require('express');
const express=require('express');
const router =express.Router();
const { search } = require('../routes/auth');
const axios = require('axios');
const pages =require('../routes/pages')
const { data } = require('jquery');




function tokenPayload(value){
    return config = {
        headers:{
            Authorization: `Bearer ${value.cookies.jwt}` 
        }
    }
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
                console.log(response.data);
                let val
                return res  .cookie('jwt',response.data.jwt)
                            .cookie('aut',response.data.user.Authorization)
                            .cookie('id',response.data.user.id)
                            .status(200)
                            .render('index',{data: response.data})
            })
            .catch(function (error){
                console.log(error);
                return res.status(400).render('login',{message: error.response.data.message})
            })
        }
    }catch (error) {
        console.log(error);
    }
}
//Register Empoloyee

exports.register =(req,res)=>{  
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
                console.log(response);
                return res.status(200).render('index')
            })
            .catch(function (error){
                console.log(error);
                return res.status(400).render('register',{message: error.response.data.message})
            })
        }
        else
        {
            return res.status(400).render('register',{message: "Password Doesnt Match"})
        }
}
//Register Customer
exports.registerCustomer =(req,res)=>{
    
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
                return res.status(400).render('add-tenant',{message: error.response.data.message})
            })
        }
        else
        {
            return res.status(400).render('add-tenant',{message: "Password is not the same"})
        }
    }
    else
       {
           return res.status(400).render('add-tenant',{message: "Agree to terms and services"})
       }
}


//Register Room
exports.registerRoom =(req,res)=>{
    
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
            return res.status(400).render('add-room',{message: error.response.data.message})
        })
    })
    .catch(function(error){
        console.log(error);
        return res.status(400).render('add-room',{message: error.response.data.message})
    });
    
    
        
   
   // return res.render("add-room")
 

}
//Register Rental
exports.registerRental =(req,res)=>{
    
    const {cname,uid,sdate,edate,price,roomnumber}=req.body;
   console.log(req.body)
    axios.get('http://strapi.nonstopplc.com:1440/Rooms?_where[roomnumber]='+roomnumber,
    tokenPayload(req) )
    .then(function(resu)
    {
            
            axios.get('http://strapi.nonstopplc.com:1440/Customers?_where[name]='+cname,
            tokenPayload(req) )
            .then(function(results)
            {
                console.log(results)
                axios.post('http://strapi.nonstopplc.com:1440/Rentals',
            {
                customer: {
                    id: results.data[0].id
                },
                users_permissions_user: {
                    id: resu.data[0].id},
                starting: sdate,
                ends: edate ,
                price: price,
                room: {
                    id: resu.data[0].id,
                 }

            },
            tokenPayload(req) )
            .then(function (response){
                console.log(response);
                return res.redirect('http://tarman.nonstopplc.com:5001/rental_list')
            })
            .catch(function (error){
                console.log(error);
                return res.status(400).render('add-rental',{message: error.response.data.message})
            })
            })
            .catch(function (error){
                console.log(error);
                return results.status(400).render('add-rental',{message: error.response.data.message})
            })
            
    })
    .catch(function(error){
        console.log(error);
        return results.status(400).render('add-rental',{message: error.response.data.message})
    })   
}
//Register Payment
exports.registerPayment =(req,res)=>{
    
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
                return res.status(400).render('add-payment',{message: error.response.data.message})
            })
            
        })
        .catch(function(error){
            console.log(error);
            return results.status(400).render('add-payment',{message: error.response.data.message})
        })

}
//List
//List Employee
//Delete

//Edit 
exports.editCus= async (req,res)=>{
    const {Email,Owner,Password,PhoneNumber,TID,PasswordConfirm,BID}=req.body;
    try{
        if(Password !== PasswordConfirm){
            return res.render('editcustomer',{
                message: "Passwords do not match"
            })
        }
        let hashedPassword =await bcrypt.hash(Password,2);;
        db.query('UPDATE `Customer` SET ? where BID',{Owner:Owner,TID:TID,PhoneNumber:PhoneNumber,Email:Email, Password:hashedPassword, BID},async (error,results)=>{
           return res.render('editcustomer',{message: results});
        })
    
    }catch (error) {
        console.log(error);
    }
}
exports.editEmp= async (req,res)=>{
    const {FirstName,LastName,UserName,AccessLevel,PhoneNumber,Email,UID}=req.body;
    try{
        
        db.query('UPDATE `User` SET ? where UID = ?',{FirstName:FirstName,LastName:LastName,UserName:UserName,AccessLevel:AccessLevel,PhoneNumber:PhoneNumber,Email:Email},[UID],async (error,results)=>{
           return res.render('editemployee',{message: results});
        })
    
    }catch (error) {
        console.log(error);
    }
}
exports.editRoom= async (req,res)=>{
    const {FID,Price,RoomNumber,Status,UID}=req.body;
    try{
        let hashedPassword =await bcrypt.hash(Password,2);;
        db.query('UPDATE `Room` SET ? where RoomNumber = ?',{FID:FID,Price:Price,RoomNumber:RoomNumber,Status:Status, UID:UID},[RoomNumber],async (error,results)=>{
           return res.render('editroom',{message: results});
        })
    
    }catch (error) {
        console.log(error);
    }
}
exports.editPayment= async (req,res)=>{
    const {BID,Paid,RID,RoomNumber,UID,PID}=req.body;
    try{
        let hashedPassword =await bcrypt.hash(Password,2);;
        db.query('UPDATE `Payment` SET ? where PID = ? ',{BID:BID,Paid:Paid,RoomNumber:RoomNumber, UID:UID, RID:RID},[PID],async (error,results)=>{
           return res.render('editpayment',{message: results});
        })
    
    }catch (error) {
        console.log(error);
    }
}
exports.editRental= async (req,res)=>{
    const {BID,Price,RoomNumber,UID,RID}=req.body;
    try{
        let hashedPassword =await bcrypt.hash(Password,2);;
        db.query('UPDATE `Payment` SET ? where PID = ? ',{BID:BID,Price:Price,RoomNumber:RoomNumber, UID:UID},[RID],async (error,results)=>{
           return res.render('editpayment',{message: results});
        })
    
    }catch (error) {
        console.log(error);
    }
}


//AdminLog

exports.viewActivity= async (req,res)=>{
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

