var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : `${process.env.DB_USERNAME}`,
  password : `${process.env.DB_PASSWORD}`,
  database : `${process.env.DB_NAME}`
});

connection.connect( function (err) {
    if(err){
        console.log("error occurred while connecting");
    }
    else{
        console.log("connection created with Mysql successfully");
    }
 });


module.exports = connection;
