
const mongoose = require("mongoose");

let isValidRequestBody = function (body) {
    if (Object.keys(body).length === 0) return false;
    return true;
}

let isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false;
    if (typeof value === 'string' && value.trim().length === 0) return false;
    return true;
}


let isValidObjectId = function (objectId) {
    if (!mongoose.Types.ObjectId.isValid(objectId)) return false;
    return true;
}


//   /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/
let isValidEmail = function (email) {
    let emailRegex =  /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/;
    return emailRegex.test(email) 
}


let isValidPassword = function(password) {
    let passwordRegex=/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,15}$/
    return passwordRegex.test(password);
}

let isValidName=function(name){
    let nameRegex = /^[A-Za-z\s]{1,15}$/ 
    return nameRegex.test(name);
}

let isValidTitle= function(title) {
    return ["Mr", "Mrs","Miss"].indexOf(title) !==-1;
}


module.exports = {isValidRequestBody,isValid,isValidObjectId,isValidEmail,isValidPassword,isValidName,isValidTitle}