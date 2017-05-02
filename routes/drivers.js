/**
 * Created by Kliment on 5/2/2017.
 */
const express = require('express');
const router = express.Router();
const pool = require('../database/postgres');
const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const secret = require('../config/jwt.json');
const authenticate = require('../middleware/authenticate');
const generateToken = require('../functions/functions').generateToken;

router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/register', function(req, res) {
    let email = req.body.email;
    let name = req.body.name;
    let surname = req.body.surname;
    let age = req.body.age;
    let password = req.body.password;
    let shortInfo = req.body.shortInfo;
    let phoneNumber = req.body.phoneNumber;
    let driverLicense = req.body.driverLicense;
    let vehicleType= req.body.vehicleType;
    let vehicleYear = req.body.vehicleYear;
    let vehicleGas = req.body.vehicleGas;
    let vehicleSeats = req.body.vehicleSeats;
    if(email !== null){
        pool.query('SELECT email FROM drivers WHERE email = $1', [email])
            .then(data => {
                if(data.rowCount===0){
                    let salt = bcrypt.genSaltSync(10);
                    password = bcrypt.hashSync(password, salt);
                    pool.query('INSERT INTO drivers ' +
                        '(name,surname,email,password,age,short_info,phone_number,driver_license,vehicle_type,vehicle_year,vehicle_gas,vehicle_seats) ' +
                        'VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',
                        [name,surname,email,password,age,shortInfo,phoneNumber,driverLicense,vehicleType,vehicleYear,vehicleGas,vehicleSeats])
                        .then(data=>{
                            console.log(data);
                            console.log(data.rows[0]);
                            res.send({status:"driver profile was created", token: "test"});
                        },err=>{
                            res.send({message: 'cannot create profile: '+err});
                        })
                }else{
                    res.send({message:"Email is already in use"});
                }
            });
    }else{
        res.end("Some error");
    }
});

router.post('/login', function(req, res) {
    let email = req.body.email;
    let password = req.body.password;
    if(email !== null){
        pool.query('SELECT * from drivers where email = $1', [email])
            .then(data=>{
                if(data.rowCount !== 1){
                    res.send({message:'That email was not found'});
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
                res.send({message:'Error'});
            });
    }else{
        res.send('No email provided');
    }
});

// router.get('/me',authenticate, function(req,res){
//     res.send(req.user);
// });

module.exports = router;
