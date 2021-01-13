
const mysql = require('mysql');
var sql = "SELECT * FROM ?? WHERE ?? = ?";
var insertsUsers = ['User', 'Email'];
const db = mysql.createConnection({
    host: process.env.DATABSE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABSE_PASSWORD,
    database: process.env.DATABASE
})
console.log(db)
module.exports ={
    db:db
}
module.exports={
    sql:sql
}
module.exports={
    inserts:insertsUsers
}