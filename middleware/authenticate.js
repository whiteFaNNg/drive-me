/**
 * Created by Kliment on 5/1/2017.
 */
const pool = require('../database/postgres');
const secret = require('../config/jwt.json');
const jwt = require('jsonwebtoken');

let authenticate = (req, res, next) => {
    let token = req.header('x-auth');
    let decoded;

    try {
        decoded = jwt.verify(token, secret.key);
    } catch (e) {
        res.status(401).send();
        return;
    }
    pool.query('select id, name, surname, email, token, age from users where id = $1 and token = $2',[decoded.id,token])
        .then(data=>{
            if(data.rowCount!==1){
                res.status(401).send();
            }else{
                req.user = data.rows[0];
                req.token = token;
                next();
            }
        },err=>{
            res.status(401).send();
        });
};

module.exports = authenticate;

