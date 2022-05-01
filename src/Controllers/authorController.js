
const authorModel = require("../Models/authorModel")
const bcrypt = require('bcrypt')
const saltRounds = 11;
const jwt = require("jsonwebtoken")

let emailRegex = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/;     //email validation
let passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,15}$/    //password validation
let nameRegex = /^[A-Za-z]{2,}$/    //Name validation

const isValidTitle = function (title) {
    return ['Mr', 'Mrs', 'Miss'].indexOf(title) !== -1     //enum validation
}

// Author Creation
const createAuthor = async function (req, res) {
    try {
        const data = req.body
        if (Object.keys(data).length != 0) {

            if (!data.fname || !data.fname.trim() ) return res.status(400).send({ status: false, msg: "Please enter the required field fName" })
           
            if (!data.lname || !data.lname.trim()) return res.status(400).send({ status: false, msg: "Please enter the required field lName" })
          
            if (!isValidTitle(data.title)) return res.status(400).send({ status: false, msg: "Please enter the required field title" })
          
            if (!data.email) return res.status(400).send({ status: false, msg: "Please enter the required field email" })
           
            if (!data.password) return res.status(400).send({ status: false, msg: "Please enter the required field password" })
           
            //Name validation
            if(!nameRegex.test(data.fname) || !nameRegex.test(data.lname)) return res.status(400).send({ status: false, msg: "Name must be alphabetical and min length 2." })
           
            // Email Validation
            if (!emailRegex.test(data.email)) return res.status(400).send({ status: false, msg: "Please provide valid email" })

            // Unique Email
            const usedEmail = await authorModel.findOne({ email: data.email })
            if (usedEmail) return res.status(400).send({ status: false, msg: "Email Id already exists." })

            // Password Validation
            if (!passwordRegex.test(data.password))
                return res.status(400).send({ status: false, msg: "Your password must contain atleast one number,uppercase,lowercase and special character[ @ $ ! % * ? & ] and length should be min of 6-15 charachaters" })

            //Hashing password
            const salt = bcrypt.genSalt(saltRounds)
            const hashPassword = bcrypt.hash(data.password, salt)
            req.body["password"] = hashPassword;

            const savedData = await authorModel.create(data);
            return res.status(201).send({ status: true, msg: savedData });
        }
        else {
            return res.status(400).send({ status: false, msg: "NO USER INPUT" })
        }
    }
    catch (err) {
        console.log(err.message)
        return res.status(500).send({ status: false, msg: err.message });
    }
}

const loginUser = async function (req, res) {
    try {

        let userId = req.body.email;
        let password = req.body.password;
        if (!userId) return res.status(400).send({ status: false, msg: "email is required." })
        if (!password) return res.status(400).send({ status: false, msg: "Password is required." })
        let getUser = await authorModel.findOne({ email: userId }).select({ password: 1 })
        if (!getUser) return res.status(404).send({ status: false, msg: "Author not found!" })
        let matchPassword = bcrypt.compare(password, getUser.password)
        if (!matchPassword) return res.status(401).send({ status: false, msg: "Password is incorrect." })
        //To create token
        let token = jwt.sign({
            authorId: getUser._id,
            developer: "Sachin"
        }, "GKjdk@Xp2");

        res.setHeader("x-api-key", token);
        return res.status(201).send({ status: true, msg: "User login sucessful" })
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



