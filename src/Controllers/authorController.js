
const authorModel = require("../Models/authorModel")
const bcrypt = require('bcrypt')
const saltRounds = 11;
const jwt = require("jsonwebtoken")


let emailRegex = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/;
// Author Creation
let createAuthor = async function (req, res) {
    try {
        let data = req.body
        if (Object.keys(data).length != 0) {

            if (!data.fname) return res.status(400).send({ status: false, msg: "Please enter the required field fName" })
            if (!data.lname) return res.status(400).send({ status: false, msg: "Please enter the required field lName" })
            if (!data.title) return res.status(400).send({ status: false, msg: "Please enter the required field title" })
            if (!data.email) return res.status(400).send({ status: false, msg: "Please enter the required field email" })
            if (!data.password) return res.status(400).send({ status: false, msg: "Please enter the required field password" })

            if (data.fname.length < 3) return res.status(400).send({ status: false, msg: "fName length should be min 3" })
            if (data.password.length <= 6) return res.status(400).send({ status: false, msg: "password length should be min 6" })
            // Email Validation
            if (!emailRegex.test(data.email))
                return res.status(400).send({ status: false, msg: "Please provide valid email" })
            // Unique Email
            const usedEmail = await authorModel.findOne({ email: data.email })
            if (usedEmail)
                return res.status(400).send({ status: false, msg: "Email Id already exists" })
            //Hash password
            const salt = await bcrypt.genSalt(saltRounds)
            const hashPassword = await bcrypt.hash(data.password, salt)
            req.body["password"] = hashPassword;
            const saveData = await authorModel.create(data);
            return res.status(201).send({ status: true, msg: saveData });
        }
        else {
            return res.status(400).send({ status: false, msg: "NO USER INPUT" })
        }

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message });
    }
}

let loginUser = async function (req, res) {
    try {
        userId = req.body.userId;
        password = req.body.password;
        if (!userId) return res.status(400).send({ status: false, msg: "User id is required" })
        if (!password) return res.status(400).send({ status: false, msg: "Password is required" })
        let getUser = await authorModel.findOne({ email: userId }).select({ password: 1 })
        if (!Object.keys(getUser).length) return res.status(404).send({ status: false, msg: "User not found" })
        const matchPassword = await bcrypt.compare(password, getUser.password)
        if (!matchPassword) return res.status(401).send({ status: false, msg: "Password is incorrect" })
        //To create token
        let token = jwt.sign({
            authorId: getUser._id,
            developer: "Sachin"
        }, "GKjdk@Xp2");
        res.setHeader("x-api-key",token);
        return res.status(201).send({ status: true, data: token })
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: "Error", error: err.message })
    }
}


module.exports.createAuthor = createAuthor
module.exports.loginUser = loginUser