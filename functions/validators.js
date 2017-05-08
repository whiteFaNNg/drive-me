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

let validateEmailAndPassword = (email,password)=>{
    return validator.isEmail(email) && password.length>=6;
};

let validUserInput = (userInput)=>{
    sanitizeInput(userInput);
    if(userInput.name === "" || userInput.surname ==="" || userInput.email ==="" || userInput.password === ""||userInput.age===""){
        return false;
    }
    if(!validator.isEmail(userInput.email) || userInput.password.length<6){
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

let isValidObject = (obj)=>{
    return (typeof obj === "object" && obj !== null);
};

let validSearchInput = (searchInput)=>{
    if(!isValidObject(searchInput.destination)||!isValidObject(searchInput.priceRange)||!isValidObject(searchInput.startTimeRange)){
        return false;
    }

    searchInput.destination.from = sanitize(searchInput.destination.from || "");
    searchInput.destination.to = sanitize(searchInput.destination.to || "");
    searchInput.startTimeRange.from = getInt(sanitize(searchInput.startTimeRange.from || ""));
    searchInput.startTimeRange.to = getInt(sanitize(searchInput.startTimeRange.to || ""));
    searchInput.priceRange.from = getInt(sanitize(searchInput.priceRange.from || ""));
    searchInput.priceRange.to = getInt(sanitize(searchInput.priceRange.to || ""));

    if(isNaN(searchInput.startTimeRange.from)||isNaN(searchInput.startTimeRange.to)||isNaN(searchInput.priceRange.from)||isNaN(searchInput.priceRange.to)){
        return false;
    }
    if(searchInput.startTimeRange.from<0 || searchInput.startTimeRange.from>=searchInput.startTimeRange.to){
        return false;
    }
    if(searchInput.priceRange.from<0 || searchInput.priceRange.from>=searchInput.priceRange.to){
        return false;
    }
    sanitizeInput(searchInput.preferences);
    Object.entries(searchInput.preferences).forEach(
        ([key, value]) => {
            searchInput.preferences[key]=validator.toBoolean(value,true);
        }
    );
    return true;
};

module.exports = {validUserInput,validTicketInput,validSearchInput, getInt,validateEmailAndPassword};
