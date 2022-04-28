const authorModel = require("../Models/authorModel");

let authenticateUser = async function (req, res, next) {
    try{
    userId = req.body.userId;
    password = req.body.password;
    
    //let isUserExist = await authorModel.find({email:userId,password:password})
    console.log(userId, password)
  //  res.status(200).send(isUserExist)
    }
    catch(err){
        res.status(400).send({status:false,msg:"Error",error:err})
    }
    
}

module.exports.authenticateUser = authenticateUser;
