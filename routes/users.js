const express = require('express');
const router = express.Router();
const pool = require('../database/postgres');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secret = require('../config/jwt.json');
const authenticate = require('../middleware/authenticate');
const generateToken = require('../functions/functions').generateToken;


router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/register', function(req, res, next) {
    let email = req.body.email;
    let name = req.body.name;
    let surname = req.body.surname;
    let age = req.body.age;
    let password = req.body.password;
    if(email !== null){
        pool.query('SELECT name from users where email = $1', [email])
            .then(data => {
                if(data.rowCount===0){
                    let salt = bcrypt.genSaltSync(10);
                    password = bcrypt.hashSync(password, salt);
                    pool.query('insert into users (name,surname,email,password,age) values($1,$2,$3,$4,$5)',[name,surname,email,password,age])
                        .then(data=>{
                            console.log(data);
                            console.log(data.rows[0]);
                            res.send({status:"user profile was created", token: "test"});
                        },err=>{
                            console.log(err);
                            res.send({haha:"keked"})
                        })
                }else{
                    res.send({message:"Email is already in use"});
                }
            });
    }else{
        res.end("Some error");
    }
});

router.post('/login', function(req, res, next) {
    let email = req.body.email;
    let password = req.body.password;
    if(email !== null){
        pool.query('SELECT * from users where email = $1', [email])
            .then(data=>{
               if(data.rowCount !== 1){
                   res.send('That email was not found');
               } else{
                   if(bcrypt.compareSync(password, data.rows[0].password)){
                       let token = generateToken(data.rows[0].id, "access");
                       pool.query('update users set token = $1 where email = $2',[token,email])
                           .then(data=>{
                               res.send({message:"successful login",token:token});
                           },err=>{
                               res.send({error:err})
                           })
                   }else{
                       res.send({message:"password was incorrect"});
                   }
               }
            },err=>{
                console.log(err);
                res.send("Error");
            });
    }else{
        res.send('No email provided');
    }
});

router.get('/me',authenticate, function(req,res,next){
    res.send(req.user);
});

module.exports = router;
