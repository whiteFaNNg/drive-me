/**
 * Created by Kliment on 5/2/2017.
 */
const pool = require('../database/postgres');

let getDriverData = (req, res, next) => {
    let token = req.user.token;
    let id = req.user.id;
    console.log(id + ' ----- ' + token);
    pool.query('select id, name, surname, email, token, age, driver_license from drivers where id = $1 and token = $2',[id,token])
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
            console.log(err);
            res.status(401).send();
        });
};

module.exports = getDriverData;
