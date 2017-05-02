/**
 * Created by Kliment on 5/1/2017.
 */
const jwt = require('jsonwebtoken');
const secret = require('../config/jwt.json');
const {cities, connMap} = require('./map-data');

let generateToken = (id,type)=>{
    return jwt.sign({id: id, access: type}, secret.key).toString();
};

let verifyRoute = (trip_route)=>{
    let locations = trip_route.split('-');
    let valid = true;
    for(let i=0;i<locations.length;i++){
        let temp = false;
        for(let j=0;j<cities.length;j++){
            if(locations[i].toString()===cities[j].toString()){
                temp=true;
                break;
            }
        }
        if(temp===false){
            valid = false;
            break;
        }
    }
    return valid;
};

let calculateRouteTime = (trip_route)=>{
    let locations = trip_route.split('-');
    let total = 0;
    for(let i = 0;i<locations.length-1;i++){
        total += connMap.get(locations[i]).get(locations[i+1])[1];
    }
    return total;
};

module.exports = {generateToken,verifyRoute,calculateRouteTime};