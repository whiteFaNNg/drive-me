/**
 * Created by Kliment on 5/5/2017.
 */
const validator = require('validator');

let sanitize = (input)=>{
    return validator.escape(validator.trim(input));
};

let sanitizeUserInput = (userInput)=>{
    Object.entries(userInput).forEach(
        ([key, value]) => {
            userInput[key] = sanitize(value);
        }
    );
};

let validUserInput = (userInput)=>{
    sanitizeUserInput(userInput);
    if(userInput.name === "" || userInput.surname ==="" || userInput.email ==="" || userInput.password === ""||userInput.age===""){
        return false;
    }
    if(!validator.isEmail(userInput.email)){
        return false;
    }
    if(userInput.password.length<6){
        return false;
    }
    userInput.age = validator.toInt(userInput.age);
    if(isNaN(userInput.age)){
        return false;
    }else if(userInput.age<1 || userInput.age>150){
        return false;
    }
    return true;
};

module.exports = {validUserInput};
