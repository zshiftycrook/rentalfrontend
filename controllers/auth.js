const mysql =require('mysql');
const jwt=require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { authUser } = require('./basicAuth');
const { Router } = require('express');
const express=require('express');
const router =express.Router();
const { search } = require('../routes/auth');
const axios = require('axios');

const db = mysql.createConnection({
    host: process.env.DATABSE_HOST,
    user: process.env.DATABASE_USER,
    Password: process.env.DATABSE_Password,
    database: process.env.DATABASE
})

// Login
exports.login = async (req,res)=>{
    try{
        const {email,password}=req.body;
        if(!email || !password){
            return res.status(400).render('login',{message: 'Please provide an Email and Password'})
        }
        else
        {
            axios.post('http://localhost:1337/auth/local',
            {
                identifier: email,
                password: password
            })
            .then(function (response){
                console.log(response.data);
                let val
                return res  .cookie('jwt',response.data.jwt)
                            .cookie('aut',response.data.Authorization)
                            .status(200)
                            .render('index',{data: response.data})
            })
            .catch(function (error){
                console.log(error);
                return res.status(400).render('login',)
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
         axios.post('http://localhost:1337/Users',
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

            })
            .then(function (response){
                console.log(response);
                return res.status(200).render('index')
            })
            .catch(function (error){
                console.log(error);
                return res.status(400).render('register')
            })
        }
        else
        {
            return res.status(400).render('register')
        }
}
//Register Customer
exports.registerCustomer =(req,res)=>{
    
    const {username,tin,buisness,contactperson,phonenumber,kebeleid,email,note,password,repeatepassword,status,checkbox}=req.body;
    console.log(username)
    if(checkbox == 'on'){
        if(password == repeatepassword){
            axios.post('http://localhost:1337/Customers',
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

            })
            .then(function (response){
                console.log(response);
                return res.status(200).render('tenant_list')
            })
            .catch(function (error){
                console.log(error);
                return res.status(400).render('add-tenant')
            })
        }
        else
        {
            return res.status(400).render('add-tenant')
        }
    }
    else
       {
           return res.status(400).render('add-tenant')
       }
}


//Register Room
exports.registerRoom =(req,res)=>{
    
    const {roomnumber,floor,size,status}=req.body;
    
    axios.get('http://localhost:1337/Floor-Numbers?_where[floor]='+floor,{params:{}})
    .then(function(results)
    {
        floorid=results.data[0].id;
        axios.post('http://localhost:1337/Rooms',
        {
            roomnumber: roomnumber,
            status: status,
            floor_number: {
                id: floorid
            },
            size: size
        })
        .then(function (response){
            console.log(response);
            return res.status(200).render('room_list')
        })
        .catch(function (error){
            console.log(error);
            return res.status(400).render('add-room')
        })
    })
    .catch(function(error){
        console.log(error);
        return res.status(400).render('add-room')
    });
    
    
        
   
   // return res.render("add-room")
 

}
//Register Rental
exports.registerRental =(req,res)=>{
    
    const {cname,uid,sdate,edate,price,roomnumber}=req.body;
   console.log(req.body)
    axios.get('http://localhost:1337/Rooms?_where[roomnumber]='+roomnumber)
    .then(function(resu)
    {
            console.log(resu.data[0].id)
            axios.get('http://localhost:1337/Customers?_where[name]='+cname)
            .then(function(results)
            {
                console.log(results)
                axios.post('http://localhost:1337/Rentals',
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

            })
            .then(function (response){
                console.log(response);
                return res.status(200).render('rental_list')
            })
            .catch(function (error){
                console.log(error);
                return res.status(400).render('add-rental')
            })
            })
            .catch(function (error){
                console.log(error);
                return results.status(400).render('add-rental')
            })
            
    })
    .catch(function(error){
        console.log(error);
        return results.status(400).render('add-rental')
    })   
}
//Register Payment
exports.registerPayment =(req,res)=>{
    
    const {roomnumber,name,leasetime,month}=req.body;
    console.log(req.body);
    
        axios.get('http://localhost:1337/Rentals?_where[room.roomnumber]='+roomnumber+'&_where[customer.name]='+name)
        .then(function(results){
         console.log(results.data[0])
            axios.post('http://localhost:1337/Payments',
        {
            rental:{
                id: results.data[0].id,
            },
            price: results.data[0].price1*month,
            })
            .then(function (response){
                console.log(response);
                return res.status(200).get('/payment_list')
            })
            .catch(function (error){
                console.log(error);
                return res.status(400).render('add-payment')
            })
        })
        .catch(function(error){
            console.log(error);
            return results.status(400).render('add-payment')
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

