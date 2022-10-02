const {encryptPassword} = require('./encryption');
const db = require('./dbConnection');
const jwt = require("jsonwebtoken");
const cron = require('node-cron');

const login = async (req, res, next) => {
    try {
      let response = {};
      let apiStatusCode=200;
      let data = req.body;
      const user = {
        usernameOrEmail: data.usernameOrEmail,
        password: data.password
      };
      if(!user.usernameOrEmail || !user.password){
        console.log("missing required params")
        response.errorMessage = "Missing required parameters"
        res.status(apiStatusCode).send(response);
      }
      else{
        const query = `select * from users where name = "${user.usernameOrEmail}" `;
        db.query(query,function(err,result,fields){
          if(err) throw err;
          user.password = encryptPassword(user.password);
          if(result[0].password === user.password){
            console.log("user authenticated")
            let jwtUser = {
              name:result[0].name,
              email:result[0].email,
              role:result[0].role,
              contact:result[0].contact,
              userId:result[0].id
            }
            let token = jwt.sign({ user: jwtUser }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY });
            let insertTokenQuery = `insert into activeUsers values ("${token}")`
            db.query(insertTokenQuery,function (err, result) {  
              if (err) throw err;  
              // response.message = "Record added successfully"
              console.log("JWT addedd successfully==>",token)  
            }); 
            response.message="user logged in";
            response.accessToken=token;
            res.status(apiStatusCode).send(response);
          }
          else{
            response.errorMessage="password entered is incorrect"
            console.log("user password verification failed")
            res.status(apiStatusCode).send(response);
          }
        })
      }
    }
     catch (err) {
      console.log("error",err)
    }
}

const logout = async (req, res, next) => {
    try {
      let response = {};
      let apiStatusCode=200;
      let token = req?.headers?.authorization;
      token = token?token.split(" ")[1]:'';
  
      if(token){
        let logoutQuery = `delete from activeUsers where jwtToken = "${token}"`
        db.query(logoutQuery,function(err,result){
          if(err) throw err;
          if(result && result.length){
            response.message = "you have been logged out"
            console.log("you have been logged out");
            res.status(apiStatusCode).send(response);
          }
          else{
            response.message = "you have already been logged out"
            console.log("you have already been logged out");
            res.status(apiStatusCode).send(response);
          }
          
        });
      }
      else{
        response.message = "Bearer token is missing"
        console.log("Bearer token is missing");
        res.status(apiStatusCode).send(response);
      }
      
      
      
    }
     catch (err) {
      console.log("error",err)
    }
}

const activeUsers = async(req, res, next) => {
  try{
    let response = {};
    let apiStatusCode=200;
    let data = req.body;
    let token = req?.headers?.authorization;
    token = token?token.split(" ")[1]:'';

    if(token){
      jwt.verify(token, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
          apiStatusCode=401
          response.message = "Session expired. Please login again"
          console.log("Session expired. Please login again");
          res.status(apiStatusCode).send(response);
        } else {
          let userDetails = authData.user;
          if((userDetails.role).toLowerCase() === 'teacher'){
            let totalUsers = `select * from activeUsers`;
            let count=0
            db.query(totalUsers, (err,result,fields)=>{
              if(err)throw err;
              count = result?.length;
              result.forEach(async(jwti)=>{
                jwt.verify(jwti.jwtToken,process.env.JWT_SECRET,(err,result)=>{
                  if(err){
                    console.log("kfdhfkhdhfh=>",jwti.jwtToken)
                    let deleteToken = `delete from activeUsers where jwtToken="${jwti.jwtToken}"`
                    db.query(deleteToken,(err,result)=>{
                      if(err) throw err;
                      console.log("delete result",result)
                      count-=1;
                      console.log("deleted");
                    })
                  }
                  else{
                    console.log("verification==>",jwti.jwtToken);
                  }
                })
              })
              response.message = `Total active users count is ${count}`
              console.log(`Total active users count is ${count}`);
              res.status(apiStatusCode).send(response);
            })
          }
          else{
            apiStatusCode=401
            response.message = "Sorry you don't have the permission to view active users"
            console.log("Sorry you don't have the permission to view active users");
            res.status(apiStatusCode).send(response);
          }
        }
      });
    }
    else{
      response.message = "Bearer token is missing"
      console.log("Bearer token is missing");
      res.status(apiStatusCode).send(response);
    }
    
  }
  catch(err){
    console.log("error",err)
  }
}


module.exports = {
    login,
    logout,
    activeUsers
}