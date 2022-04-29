const authorModel = require("../Models/authorModel");
const jwt = require("jsonwebtoken");
const blogModel = require("../Models/blogModel");
const mongoose = require("mongoose");
const ObjectId = require("mongoose").Types.ObjectId;

let decodeToken;
let authenticateUser =  function (req, res, next) {
    try {
        let token = req.headers["x-api-key"]
        if (!token) token = req.headers["X-Api-Key"]
        if (!token) return res.status(400).send({ status: false, msg: "Token is required" })
        try {
            decodeToken = jwt.verify(token, "GKjdk@Xp2")
        } catch (err) {
            return res.status(401).send({ status: false, msg: "Error", error: err.message })
        }
        next()
    } catch (err) {
        return res.status(500).send({ status: false, msg: "Error", error: err.message })
    }
}

let authoriseUser = async function (req, res, next) {
    try {
        let blogId = req.params.blogId;
        if (!ObjectId.isValid(blogId)) return res.status(400).send({ status: false, msg: "Not a valid blog id" })
        let getAuthor = await blogModel.findById(blogId)
        if (!Object.keys(getAuthor).length) return res.status(404).send({ status: false, msg: "No blog found" })
        if (decodeToken.authorId.toString() !== getAuthor.authorId.toString()) return res.status(401).send({ status: false, msg: "User is not a authorise user" })
        next();
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: "Error", error: err.message })
    }
}


let authUser = async function (req, res, next) {
    try{
    let authorId = req.params.authorId
    console.log(authorId)
    if (!ObjectId.isValid(authorId)) return res.status(400).send({ status: false, msg: "Not a valid author id" })
    let getAuthor = await authorModel.findById(authorId)
    if(!Object.keys(getAuthor).length) return res.status(404).send({ status: false, msg: "No author found" })
    if(decodeToken.authorId.toString()!==authorId.toString()) return res.status(401).send({ status: false, msg: "User is not a authorise user" })
    next()
}
    catch(err) {
        return res.status(500).send({ status: false, msg: "Error", error: err })
    }
}


module.exports.authenticateUser = authenticateUser;
module.exports.authoriseUser = authoriseUser;
module.exports.authUser = authUser;
