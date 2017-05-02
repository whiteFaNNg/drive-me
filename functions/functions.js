/**
 * Created by Kliment on 5/1/2017.
 */
const jwt = require('jsonwebtoken');
const secret = require('../config/jwt.json');

let generateToken = (id,type)=>{
    return jwt.sign({id: id, access: type}, secret.key).toString();
};

let verifyRoute = (trip_route)=>{
    
};

module.exports = {generateToken,verifyRoute};