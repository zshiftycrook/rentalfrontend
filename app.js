const express =require('express');
const dotenv = require('dotenv');
const path =require("path");
const cookieParser = require('cookie-parser') ;

dotenv.config({path:'./.env'});
const app = express();


const publicDirectory = path.join(__dirname,'./public');


app.use(express.static(publicDirectory));
//parse url-encoded bodies from the html
app.use(express.urlencoded({extended:false}));
//parse json bodies
app.use(express.json());

app.use(cookieParser());

app.set('view engine', 'hbs');



//routes
app.use('/',require('./routes/pages'));
app.use('/auth',require('./routes/auth'));


app.listen(5001,() => { 
    console.log("server started on port 5000");

})