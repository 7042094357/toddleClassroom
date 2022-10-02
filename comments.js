const db = require('./dbConnection');
const jwt = require("jsonwebtoken");

const addComments = async(req,res,next)=>{
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
                if(data?.subjectCode && data?.classCode && data?.comment){
                    let insertClassQuery = `insert into comments(classCode, subjectCode, comment, user) values(${data.classCode}, ${data.subjectCode},"${data.comment}", ${userDetails.userId})`
                    db.query(insertClassQuery,function(err,result){
                    if(err) throw err;
                    response.message = `Comment added to the subject`
                    console.log(`Comment added to the subject`);
                    res.status(apiStatusCode).send(response);
                    });
                }else{
                    response.message = "Missing required parameters"
                    console.log("Missing required parameters");
                    res.status(apiStatusCode).send(response);
                }
                }
                else{
                apiStatusCode=401
                response.message = "Sorry you don't have the permission to add comment in subject"
                console.log("Sorry you don't have the permission to add comment in subject");
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
        console.log("error",err);
    }
}

const getComments = async(req,res,next) =>{
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
            let subjectCode = data?.subjectCode;
            console.log("userDetails===>",userDetails)
            if((userDetails.role).toLowerCase() !== 'admin'){
                let getCommentsQuery = `select comment from comments where user=${userDetails.userId}`;
                if(subjectCode){
                    getCommentsQuery = getCommentsQuery + ` and subjectCode=${subjectCode}`
                }
                console.log("comments query",getCommentsQuery)
                db.query(getCommentsQuery,function(err,result){
                    if(err) throw err;
                    response.message = `Comments posted by current user`
                    response.comments = result
                    res.status(apiStatusCode).send(response);
                });
            }
            else{
              apiStatusCode=401
              response.message = "Sorry you don't have the permission to query for comments"
              console.log("Sorry you don't have the permission to query for comments");
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

module.exports={
    addComments,
    getComments
}