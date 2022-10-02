const db = require('./dbConnection');
const jwt = require("jsonwebtoken");


const createClass = async(req,res,next) =>{
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
            console.log("userDetails===>",userDetails)
            if((userDetails.role).toLowerCase() === 'teacher'){
              if(data?.class){
                let insertClassQuery = `insert into classes(class,user) values("${data.class}",${userDetails.userId})`
                db.query(insertClassQuery,function(err,result){
                  if(err) throw err;
                  response.message = `Class titled ${data.class} created by ${userDetails.name}`
                  response.classCode = `${result.insertId}`
                  console.log(`Class titled ${data.class} created by ${userDetails.name}`);
                  res.status(apiStatusCode).send(response);
                });
              }else{
                response.message = "class is a required parameter"
                console.log("class is a required parameter");
                res.status(apiStatusCode).send(response);
              }
            }
            else{
              apiStatusCode=401
              response.message = "Sorry you don't have the permission to create a class"
              console.log("Sorry you don't have the permission to create a class");
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

const joinClass = async(req,res,next) =>{
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
            console.log("userDetails===>",userDetails)
            if((userDetails.role).toLowerCase() !== 'admin'){
              if(data?.classCode){
                let insertClassQuery = `insert into classStudents(classCode,user) values("${data.classCode}",${userDetails.userId})`
                db.query(insertClassQuery,function(err,result){
                  if(err) throw err;
                  response.message = `Student added to class`
                  console.log(`Student added to class`);
                  res.status(apiStatusCode).send(response);
                });
              }else{
                response.message = "class code is a required to join a class"
                console.log("class code is a required to join a class");
                res.status(apiStatusCode).send(response);
              }
            }
            else{
              apiStatusCode=401
              response.message = "Sorry you don't have the permission to join a class"
              console.log("Sorry you don't have the permission to join a class");
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

const classStrength = async(req,res,next) =>{
    try{
      let response = {};
      let apiStatusCode=200;
      let data = req.query;
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
            console.log("userDetails===>",userDetails)
            if((userDetails.role).toLowerCase() === 'teacher'){
                let insertClassQuery = `select cl.class, u.name, u.contact, c.classCode from users u inner join classStudents c on u.id=c.user inner join classes cl on c.classCode=cl.classCode `;
                if(data?.classCode){
                    insertClassQuery = insertClassQuery + `where c.classCode=${data?.classCode}`;
                }
                console.log("class query",insertClassQuery)
                db.query(insertClassQuery,function(err,result){
                    if(err) throw err;
                    response.message = `Strength and details of student presented below`
                    if(data?.classCode)
                        response.strength = result.length
                    response.students = result
                    res.status(apiStatusCode).send(response);
                });
            }
            else{
              apiStatusCode=401
              response.message = "Sorry you don't have the permission to query a class"
              console.log("Sorry you don't have the permission to query a class");
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
    createClass,
    joinClass,
    classStrength
}