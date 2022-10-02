const AesEncryption = require('aes-encryption')
require('dotenv').config()


const aes = new AesEncryption()
aes.setSecretKey(process.env.SECRET_KEY)

function encryptPassword(passwordString){
    const encrypted = aes.encrypt(passwordString)
    return encrypted;
    // const decrypted = aes.decrypt(encrypted)
}

function password(){
    const hashedpassword = encryptPassword("12345678901234567890")
    hashedpassword.then(function(success,err){
        if(err)
            throw err
        console.log(success);
    }).catch((err)=>{
        console.log("err==============>",err)
    })
}


module.exports = {
    encryptPassword
}