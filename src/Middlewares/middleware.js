const jwt = require("jsonwebtoken");
const authorModel = require("../Models/authorModel");
const blogModel = require("../Models/blogModel");
const ObjectId = require("mongoose").Types.ObjectId;

let decodeToken;
//Authentication
const authentication = function (req, res, next) {
    try {
        let token = req.headers["x-api-key"]
        if (!token) token = req.headers["X-Api-Key"]
        if (!token) return res.status(400).send({ status: false, msg: "You are not logged in. Token is required." })
        try {
            decodeToken = jwt.verify(token, "GKjdk@Xp2")
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
        let blogId = req.params.blogId || req.query
        if (!ObjectId.isValid(blogId)) return res.status(400).send({ status: false, msg: "Not a valid blog id" })
        let getBlog = await blogModel.findById(blogId)
        if (!getBlog) return res.status(404).send({ status: false, msg: "Blog Not Found." })
        if (decodeToken.authorId.toString() !== getBlog.authorId.toString()) return res.status(403).send({ status: false, msg: "You are not authorize to perform this action." })
        next();
    }
    catch (err) {
        console.log(err.message)
        return res.status(500).send({ status: false, msg: "Error", error: err.message })
    }
}

// // Author Id authorization
// const authorization2 = async function (req, res, next) {
//     try {
//         let authorId = req.query.authorId
//         if (!authorId) return res.status(400).send({ status: false, msg: "Author id is required to perform this action." })
//         if (!ObjectId.isValid(authorId)) return res.status(400).send({ status: false, msg: "Not a valid author id." })

//         let getAuthor = await authorModel.findById(authorId)
//         if (!getAuthor) return res.status(404).send({ status: false, msg: "Author Not Found." })

//         if (decodeToken.authorId.toString() !== authorId.toString()) return res.status(403).send({ status: false, msg: "You are not authorize to perform the action." })
//         next()
//     }
//     catch (err) {
//         console.log(err.message)
//         return res.status(500).send({ status: false, msg: "Error", error: err })
//     }
// }

module.exports.authentication = authentication
module.exports.authorization = authorization


