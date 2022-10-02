const {encryptPassword} = require('./encryption');
const db = require('./dbConnection');

const createUser = async (req, res, next) => {
    try {
      let data = req.body;
      let response = {};
      let apiStatusCode=200;
      const user = {
        username: data.username,
        email: data.email,
        role: data.role,
        contact: data.contact,
        password: data.password,
        deleted: 0
      };
  
      if(req.headers.authorization === process.env.ADMIN_TOKEN){
        if(!user.username || !user.role || !user.contact || !user.password || !user.email){
          response.errorMessage="Missing required fields"
          res.status(apiStatusCode).send(response);
        }
        else{
          const existingUserQuery = `select name from users where email = "${user.email}"`;
          db.query(existingUserQuery,function(err,result,fields){
            if(err) throw err;
            if(result && result.length){
              response.message = "User with this email already exists"
              console.log("User with this email already exists") 
              res.status(apiStatusCode).send(response); 
            }
            else{
              user.password = encryptPassword(user.password);
      
              const query = `insert into users (name, role, contact, password, deleted, email) values ("${user.username}", "${user.role}", "${user.contact}", "${user.password}", ${user.deleted}, "${user.email}")`;
    
              db.query(query,function (err, result) {  
                if (err) throw err;  
                response.message = "Record added successfully"
                console.log("Record addedd successfully")  
                res.status(apiStatusCode).send(response);
              });  
              
            }
          })
        }
      }
      else{
        response.errorMessage="Authorization failed"
        apiStatusCode=401
        res.status(apiStatusCode).send(response);
      }
        
      
      
    }
     catch (err) {
      console.log("error",err)
    }
}

module.exports = {createUser}