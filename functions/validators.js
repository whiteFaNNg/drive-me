/**
 * Created by Kliment on 5/5/2017.
 */
const validator = require('validator');
const {calculateRoute} = require('./functions');

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

let validEmailAndPassword = (email,password)=>{
    return validator.isEmail(email) && password.length>=6;
};

let validRequiredFields = (objectData)=>{
    let isValid = true;
    Object.entries(objectData).forEach(
        ([key, value]) => {
            if(value === ""){
                isValid = false;
            }
        }
    );
    return isValid;
};

let validUserInput = (userInput)=>{
    sanitizeInput(userInput);
    if(!validRequiredFields(userInput) || !validEmailAndPassword(userInput.email, userInput.password)){
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

let validRating = (rating)=>{
    return !isNaN(rating) && rating>0 && rating<6;
};

let validDriverInput = (driverInput)=>{
    sanitizeInput(driverInput);
    if(!validRequiredFields(driverInput) || !validEmailAndPassword(driverInput.email, driverInput.password)){
        return false;
    }
    driverInput.age = validator.toInt(driverInput.age);
    driverInput.vehicleSeats = validator.toInt(driverInput.vehicleSeats);
    driverInput.vehicleYear = validator.toInt(driverInput.vehicleYear);
    driverInput.vehicleGas = validator.toFloat(driverInput.vehicleGas);

    if(isNaN(driverInput.age) || isNaN(driverInput.vehicleSeats) || isNaN(driverInput.vehicleYear) || isNaN(driverInput.vehicleGas)){
        return false;
    }else if(driverInput.age<1 || driverInput.age>150){
        return false;
    }
    return true;
};

let validTripInput = (tripInput)=>{
    let currentTime = new Date().getTime()/60000;
    sanitizeInput(tripInput);

    if(!validRequiredFields(tripInput)){
        return false;
    }

    tripInput.id = validator.toInt(tripInput.id);
    tripInput.startTime = validator.toInt(tripInput.startTime);
    if(isNaN(tripInput.id) || isNaN(tripInput.startTime)){
        return false;
    }

    if(tripInput.startTime<currentTime){
        return false;
    }

    tripInput.locations = tripInput.tripRoute.split('-');
    if(tripInput.locations.length<2){
        return false;
    }

    tripInput.endTime = tripInput.startTime + calculateRoute(tripInput.locations,0,tripInput.locations.length-1,1);

    if(tripInput.startTime === tripInput.endTime){
        return false;
    }
    return true;
};

module.exports = {validUserInput,validTicketInput,validSearchInput, getInt,validEmailAndPassword,validRating,validDriverInput,validTripInput};
