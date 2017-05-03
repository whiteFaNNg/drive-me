const express = require('express');
const router = express.Router();
const pool = require('../database/postgres');
const bcrypt = require('bcryptjs');
const authenticate = require('../middleware/authenticate');
const getUserData = require('../middleware/user-info');
const generateToken = require('../functions/functions').generateToken;


router.get('/', (req, res, next)=> {
    res.send('respond with a resource');
});

router.post('/register', (req, res, next)=> {
    let email = req.body.email;
    let name = req.body.name;
    let surname = req.body.surname;
    let age = req.body.age;
    let password = req.body.password;
    if(email !== null){
        pool.query('SELECT email FROM users WHERE email = $1', [email])
            .then(data => {
                if(data.rowCount===0){
                    let salt = bcrypt.genSaltSync(10);
                    password = bcrypt.hashSync(password, salt);
                    pool.query('insert into users (name,surname,email,password,age) values($1,$2,$3,$4,$5)',
                        [name,surname,email,password,age])
                        .then(data=>{
                            console.log(data);
                            console.log(data.rows[0]);
                            res.send({message:"user created"});
                        },err=>{
                            console.error(err);
                            res.status(500).end();
                        })
                }else{
                    res.send({message:"email is already in use"});
                }
            },err=>{
                console.error(err);
                res.status(500).end();
            });
    }else{
        res.send({message:'invalid email'});
    }
});

router.post('/login', (req, res)=> {
    let email = req.body.email;
    let password = req.body.password;
    if(email !== null){
        pool.query('SELECT * FROM users WHERE email = $1', [email])
            .then(data=>{
               if(data.rowCount !== 1){
                   res.send('email not found');
               } else{
                   if(bcrypt.compareSync(password, data.rows[0].password)){
                       let token = generateToken(data.rows[0].id, "access");
                       pool.query('UPDATE users SET token = $1 WHERE email = $2',[token,email])
                           .then(data=>{
                               res.send({message:"successful login",token:token});
                           },err=>{
                               console.error(err);
                               res.status(500).end();
                           })
                   }else{
                       res.send({message:'incorrect password'});
                   }
               }
            },err=>{
                console.error(err);
                res.status(500).end();
            });
    }else{
        res.send({message:'invalid email'});
    }
});

router.get('/me',authenticate, getUserData, (req,res)=>{
    res.send(req.user);
});

router.post('/find',authenticate,getUserData, (req,res)=>{
   let startTimeRange = req.body.startTimeRange;
   let priceRange = req.body.priceRange;
   let destination = req.body.destination;
   let preferences = {
        pets : req.query.pets||false,
        smoking: req.query.smoking||false,
        music: req.query.music||false,
        chatty: req.query.chatty||false
   };
   let matchLocationQuery = "%"+destination.from+"%"+destination.to+"%";
   //res.send(preferences);
    pool.query("SELECT trips.id, trips.route, trips.start_time, trips.end_time, drivers.name, drivers.surname, "+
        "CAST(drivers.total_rating AS real)/drivers.total_votes AS rating "+
        "FROM trips JOIN drivers ON trips.driver_id = drivers.id "+
        "WHERE trips.start_time <= $1 AND trips.end_time > $1 AND trips.route LIKE $2 AND drivers.pets = $3 AND "+
        "drivers.music = $4 and drivers.smoking = $5 and drivers.chatty = $6 "+
        "ORDER BY rating DESC",
        [startTimeRange.from,matchLocationQuery,preferences.pets,preferences.music,preferences.smoking,preferences.chatty])
        .then(data=>{
            console.log(data.rows[0]);
            res.send({message:"success"});
        },err=>{
            console.error(err);
            res.code(500).end();
        });
});

module.exports = router;
