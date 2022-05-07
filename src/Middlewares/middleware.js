const jwt = require("jsonwebtoken");
const blogModel = require("../Models/blogModel");
const { isValidObjectId ,isValid} = require("../utility/validator");

//Authentication
const authentication = async function (req, res, next) {
    try {
        let token = req.headers["x-api-key"]
        if (!token) token = req.headers["X-Api-Key"]
        if (!token) return res.status(400).send({ status: false, msg: "You are not logged in. Token is required." })
        try {
            decodeToken = await jwt.verify(token, "GKjdk@Xp2")
            req.authorId=decodeToken.authorId
        } catch (err) {
            return res.status(401).send({ status: false, msg: "Invalid Token", error: err.message })
        }
        next()
    } catch (err) {
        console.log(err.message)
        return res.status(500).send({ status: false, msg: "Error", error: err.message })
    }
}
// Blog Id authorization
const authorization = async function (req, res, next) {
    try {
        let blogId = req.params.blogId || req.query.blogId
        if (!isValid(blogId)) return res.status(400).send({ status: false, msg: "Blog id is required" })
        if(!isValidObjectId(blogId)) return res.status(400).send({ status: false, msg: `${blogId} is not a valid blog id` })
      
        let getBlog = await blogModel.findById(blogId)
        if (!getBlog) return res.status(404).send({ status: false, msg: "Blog Not Found." })
        if (req.authorId.toString() !== getBlog.authorId.toString()) return res.status(403).send({ status: false, msg: "You are not authorize to perform this operation" })
        next();
    }
    catch (err) {
        console.log(err.message)
        return res.status(500).send({ status: false, msg: "Error", error: err.message })
    }
}


module.exports.authentication = authentication
module.exports.authorization = authorization


