/**
 * Created by Kliment on 5/5/2017.
 */
const validator = require('validator');

let getInt = (input)=>{
    return validator.toInt(input);
};

let sanitize = (input)=>{
    return validator.escape(validator.trim(input));
};

let sanitizeInput = (objectData)=>{
    Object.entries(objectData).forEach(
        ([key, value]) => {
            objectData[key] = sanitize(value);
        }
    );
};

let validUserInput = (userInput)=>{
    sanitizeInput(userInput);
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

let validTicketInput = (ticketInput)=>{
    let isValid = true;
    sanitizeInput(ticketInput);
    Object.entries(ticketInput).forEach(
        ([key, value]) => {
            ticketInput[key] = validator.toInt(value);
            if(isNaN(ticketInput[key])){
                isValid=false;
            }else if(ticketInput[key]<0){
                isValid=false;
            }
        }
    );
    if(ticketInput.startIndex>=ticketInput.endIndex){
        isValid = false;
    }
    return isValid;
};

module.exports = {validUserInput,validTicketInput,getInt};
