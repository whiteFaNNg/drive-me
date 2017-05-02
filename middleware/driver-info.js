/**
 * Created by Kliment on 5/2/2017.
 */
const pool = require('../database/postgres');

let getDriverData = (req, res, next) => {
    let token = req.user.token;
    let id = req.user.id;
    pool.query('SELECT id, name, surname, email, token, age, driver_license FROM drivers WHERE id = $1 AND token = $2',[id,token])
        .then(data=>{
            if(data.rowCount!==1){
                console.log(data.rowCount);
                res.status(401).send();
            }else{
                req.user = data.rows[0];
                req.token = token;
                next();
            }
        },err=>{
            console.error(err);
            res.status(500).end();
        });
};

module.exports = getDriverData;
