/**
 * Created by Kliment on 5/2/2017.
 */
const express = require('express');
const router = express.Router();
const pool = require('../database/postgres');
const bcrypt = require('bcryptjs');
const authenticate = require('../middleware/authenticate');
const getDriverData = require('../middleware/driver-info');
const {generateToken,calculateRoute} = require('../functions/functions');
const {validateEmailAndPassword} = require('../functions/validators');

router.get('/', (req, res)=> {
    res.send('respond with a resource');
});

router.post('/register', (req, res) =>{
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
                            res.send({message:'driver created'});
                        },err=>{
                            console.error(err);
                            res.status(500).end();
                        })
                }else{
                    res.send({message:"Email is already in use"});
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
    let email = req.body.email || "";
    let password = req.body.password || "";
    if(validateEmailAndPassword(email,password)){
        pool.query('SELECT * FROM drivers WHERE email = $1', [email])
            .then(data=>{
                if(data.rowCount !== 1){
                    res.send({message:'email not found'});
                } else{
                    if(bcrypt.compareSync(password, data.rows[0].password)){
                        let token = generateToken(data.rows[0].id, "access");
                        pool.query('UPDATE drivers SET token = $1 WHERE email = $2',[token,email])
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
        res.send({message:'invalid input'});
    }
});

router.get('/me',authenticate, getDriverData, (req,res)=>{
    res.send(req.user);
});

router.post('/trip',authenticate,getDriverData, (req, res)=>{
    let id = req.user.id;
    let tripRoute = req.body.route;
    let locations = tripRoute.split('-');
    let startTime = parseInt(req.body.startTime);
    // let endTime = startTime + calculateRoute(tripRoute,1);
    let endTime = startTime + calculateRoute(locations,0,locations.length-1,1);
    //todo: check for validity of input
    pool.query('INSERT INTO trips (route,driver_id,start_time,end_time) VALUES ($1,$2,$3,$4)',[tripRoute,id,startTime,endTime])
        .then(data=>{
            console.log('trip inserted');
            res.send({message:'success'});
        },err=>{
            console.error(err);
            res.status(500).end();
        });
});

module.exports = router;
