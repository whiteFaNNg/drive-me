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

module.exports = router;
