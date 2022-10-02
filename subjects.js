const db = require('./dbConnection');
const jwt = require("jsonwebtoken");


const addSubject = async(req,res,next) =>{
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
              if(data?.subject && data?.classCode){
                let subjectCodeQuery = `select * from subject ORDER BY subjectCode DESC LIMIT 0, 1`;
                db.query(subjectCodeQuery,function(err,result,fields){
                    if(err) throw err;
                    let subjectCode;
                    if(result && result.length){
                        subjectCode = result[0].subjectCode+1;
                        
                    }
                    else{
                        subjectCode = 1;
                    }
                    let insertClassQuery = `insert into subject(subjectCode, classCode, subject, user) values(${subjectCode}, ${data.classCode}, "${data.subject}", ${userDetails.userId})`;
                    db.query(insertClassQuery,function(err,result){
                    if(err) throw err;
                    response.message = `Subject added to class`
                    console.log(`Subject added to class`);
                    res.status(apiStatusCode).send(response);
                    });
                })
                
              }else{
                response.message = "Subject and class code is a required"
                console.log("Subject and class code is a required");
                res.status(apiStatusCode).send(response);
              }
            }
            else{
              apiStatusCode=401
              response.message = "Sorry you don't have the permission to add subject"
              console.log("Sorry you don't have the permission to add subject");
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

module.exports = {addSubject}