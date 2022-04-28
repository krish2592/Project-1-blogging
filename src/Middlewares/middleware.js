const authorModel = require("../Models/authorModel");
const jwt = require("jsonwebtoken")

let decodeToken; 
let authenticateUser = async function (req, res, next) {
    try{
    let token = req.headers["x-api-key"]
    if(!token) token =req.headers["X-Api-Key"]
    if(!token) return res.status(400).send({ status: false, msg:"Token is required"})
    try{
     decodeToken = jwt.verify(token, "GKjdk@Xp2")
    if(decodeToken) {
        next()
    }
    } catch(err) {
        return res.status(401).send({ status: false, msg: "Error", error: err.message })
    }
  
    } catch(err) {
        return res.status(500).send({ status: false, msg: "Error", error: err.message })
    }
}

let authoriseUser = async function(req,res){
    userId=req.params.userId
    if(decodeToken.authorId===userId) {
        console.log(true)
    }
}
module.exports.authenticateUser = authenticateUser;
module.exports.authoriseUser=authoriseUser;
