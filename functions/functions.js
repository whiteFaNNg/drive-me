/**
 * Created by Kliment on 5/1/2017.
 */
const jwt = require('jsonwebtoken');
const secret = require('../config/jwt.json');

function generateToken(id,type){
    return jwt.sign({id: id, access: type}, secret.key).toString();
}

module.exports = {generateToken};