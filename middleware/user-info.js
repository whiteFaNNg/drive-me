const pool = require('../database/postgres');

let getUserData = (req, res, next) => {
    let token = req.user.token;
    let id = req.user.id;
    pool.query('SELECT id, name, surname, email, token, age FROM users WHERE id = $1 AND token = $2',[id,token])
        .then(data=>{
            if(data.rowCount!==1){
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

module.exports = getUserData;
