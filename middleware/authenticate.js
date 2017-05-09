const pool = require('../database/postgres');
const secret = require('../config/jwt.json');
const jwt = require('jsonwebtoken');

let authenticate = (req, res, next) => {
    let token = req.header('x-auth')||"";
    let decoded;
    req.user = {};
    try {
        decoded = jwt.verify(token, secret.key);
        req.user.token = token;
        req.user.id = decoded.id;
        next();
    } catch (err) {
        console.error(err);
        res.status(401).send();
    }
};

module.exports = authenticate;

