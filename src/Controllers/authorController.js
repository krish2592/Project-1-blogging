const authorModel = require("../Models/authorModel")
const bcrypt = require('bcrypt')
const saltRounds = 11;
const jwt = require("jsonwebtoken")
const { isValidRequestBody, isValid, isValidEmail, isValidPassword, isValidName, isValidTitle } = require("../Controllers/validator")

// Author Registration
const createAuthor = async function (req, res) {
    try {

        let requestBody = req.body
        if (!isValidRequestBody(requestBody)) return res.status(400).send({ status: false, msg: "NO USER INPUT" });

        let { fname, lname, title, email, password } = requestBody;

        if (!isValid(fname)) return res.status(400).send({ status: false, msg: "First Name is a mendatory" })
        if (!isValidName(fname)) return res.status(400).send({ status: false, msg: `${fname} must be alphabetical and max of 15 characacter` })
        if (!isValid(lname)) return res.status(400).send({ status: false, msg: "Last Name is a mendatory" })
        if (!isValidName(lname)) return res.status(400).send({ status: false, msg: `${lname} must be alphabetical and max of 15 characacter` })
        if (!isValid(title)) return res.status(400).send({ status: false, msg: "Title is a mendatory" })
        if (!isValidTitle(title)) return res.status(400).send({ status: false, msg: `${title} is not a valid title` })
        if (!isValid(email)) return res.status(400).send({ status: false, msg: "email is a mendatory" })
        if (!isValidEmail(email)) return res.status(400).send({ status: false, msg: `${email} is not a valid email` })

        const isUnique = await authorModel.findOne({ email: email })
        if (isUnique) return res.status(400).send({ status: false, msg: "Email is already exists" })
        if (!isValid(password)) return res.status(400).send({ status: false, msg: "password is a mendatory" })
        if (!isValidPassword(password)) return res.status(400).send({ status: false, msg: "Your password must contain atleast one number,uppercase,lowercase and special character[ @ $ ! % * ? & ] and length should be min of 6-15 charachaters" })

        //Hashing password
        const salt = await bcrypt.genSalt(saltRounds)
        const hashPassword = await bcrypt.hash(password, salt)
        password = hashPassword;
       
        const authorData = { fname, lname, title, email, password }
        const savedData = await authorModel.create(authorData);
        return res.status(201).send({ status: true,msg:"User registration sucessful", data: savedData });
    }
    catch (err) {
        console.log(err.message)
        return res.status(500).send({ status: false, msg: err.message });
    }
}

// Author Login
const loginUser = async function (req, res) {
    try {

        let requestBody = req.body
        if (!isValidRequestBody(requestBody)) return res.status(400).send({ status: false, msg: "Please login with credentials" });

        const { email, password } = req.body

        if (!isValid(email)) return res.status(400).send({ status: false, msg: "email is a mendatory" })
        if (!isValidEmail(email)) return res.status(400).send({ status: false, msg: `${email} is not a valid email` })
        if (!isValid(password)) return res.status(400).send({ status: false, msg: "password is a mendatory" })
        if (!isValidPassword(password)) return res.status(400).send({ status: false, msg: "Your password must contain atleast one number,uppercase,lowercase and special character[ @ $ ! % * ? & ] and length should be min of 6-15 charachaters" })

        let getUser = await authorModel.findOne({ email: email }).select({ password: 1 })
        if (!getUser) return res.status(401).send({ status: false, msg: `${email} is incorrect` })

        let matchPassword = await bcrypt.compare(password, getUser.password)
        if (!matchPassword) return res.status(401).send({ status: false, msg: "Password is incorrect." })
        //To create token
        let token =await jwt.sign({
            authorId: getUser._id,
            iat:  Math.floor(Date.now()/1000),
            exp:  Math.floor(Date.now()/1000+5*60*60)
        }, "GKjdk@Xp2");

        res.setHeader("x-api-key", token);
        return res.status(200).send({ status: true, msg: "User login successfull!" })
    }
    catch (err) {
        console.log(err.message)
        return res.status(500).send({ status: false, msg: "Error", error: err.message })
    }
}


module.exports.createAuthor = createAuthor;
module.exports.loginUser = loginUser;

// Authors Email Id and Password Details
// 1. Nazrul Islam
// "email": "nazrul@gmai",
// "password": "Nazrul@123"

// 2. Ruskin Bond
// "email": "ruskin@gmail.com",
// "password": "Ruskin@123"

// 3.Sashi Tharoor
// "email": "sashi@gmail.com",
// "password": "Sashi@123"

// 4. Sudha Murthy
// "email": "sudha@gmail.com",
// "password": "Sudha@123"

// 5.John Wil
//"email": "john@gmail.com",
// "password": "John@123"