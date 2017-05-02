/**
 * Created by Kliment on 5/2/2017.
 */
const pool = require('../database/postgres');

let getUserData = (req, res, next) => {
    let token = req.user.token;
    let id = req.user.id;
    // console.log(id+" --- "+token);
    pool.query('select id, name, surname, email, token, age from users where id = $1 and token = $2',[id,token])
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

module.exports = getUserData;
