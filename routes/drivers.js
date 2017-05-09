const express = require('express');
const router = express.Router();
const pool = require('../database/postgres');
const bcrypt = require('bcryptjs');
const authenticate = require('../middleware/authenticate');
const getDriverData = require('../middleware/driver-info');
const {generateToken,calculateRoute} = require('../functions/functions');
const {validEmailAndPassword,validDriverInput,validTripInput} = require('../functions/validators');

router.get('/', (req, res)=> {
    res.send('respond with a resource');
});

router.post('/register', (req, res) =>{
    let driverInput = {
        email: req.body.email || "",
        name: req.body.name || "",
        surname: req.body.surname || "",
        age: req.body.age || "",
        password: req.body.password || "",
        shortInfo: req.body.shortInfo || "",
        phoneNumber: req.body.phoneNumber || "",
        driverLicense: req.body.driverLicense || "",
        vehicleType: req.body.vehicleType || "",
        vehicleYear: req.body.vehicleYear || "",
        vehicleGas: req.body.vehicleGas || "",
        vehicleSeats: req.body.vehicleSeats || ""
    };
    if(validDriverInput(driverInput)){
        pool.query('SELECT email FROM drivers WHERE email = $1', [driverInput.email])
            .then(data => {
                if(data.rowCount===0){
                    let salt = bcrypt.genSaltSync(10);
                    driverInput.password = bcrypt.hashSync(driverInput.password, salt);
                    pool.query('INSERT INTO drivers ' +
                        '(name,surname,email,password,age,short_info,phone_number,driver_license,vehicle_type,vehicle_year,vehicle_gas,vehicle_seats) ' +
                        'VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',
                        [driverInput.name,driverInput.surname,driverInput.email,driverInput.password,driverInput.age,driverInput.shortInfo,
                         driverInput.phoneNumber,driverInput.driverLicense,driverInput.vehicleType,driverInput.vehicleYear,
                         driverInput.vehicleGas,driverInput.vehicleSeats])
                        .then(data2=>{
                            if(parseInt(data2.rowCount)!==1){
                                res.status(400).send({message:"could not insert the driver"});
                            }else{
                                res.send({message:'driver created'});
                            }
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
    let email = req.body.email || "";
    let password = req.body.password || "";
    if(validEmailAndPassword(email,password)){
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
    let tripInput = {
        id: req.user.id || "",
        tripRoute: req.body.tripRoute || "",
        startTime: req.body.startTime || ""
    };
    if(validTripInput(tripInput)){
        pool.query('SELECT count(*) FROM trips WHERE driver_id = $1 AND end_time > $2',[tripInput.id,tripInput.startTime])
            .then(data=>{
                if(parseInt(data.rowCount)!== 1){
                    res.status(500).end();
                }else if(parseInt(data.rows[0].count)!==0){
                    res.send({message:"cannot have overlapping trips1"});
                }else{
                    pool.query('INSERT INTO trips (route,driver_id,start_time,end_time) VALUES ($1,$2,$3,$4)',
                        [tripInput.tripRoute,tripInput.id,tripInput.startTime,tripInput.endTime])
                        .then(data2=>{
                            if(parseInt(data2.rowCount)!==1){
                                res.status(400).end();
                            }else{
                                res.send({message:'trip inserted'});
                            }
                        },err=>{
                            console.error(err);
                            res.status(500).end();
                        });
                }
            },err=>{
                console.error(err);
                res.status(500).end();
            });
    }else{
        res.send({message:"invalid input"});
    }
});

module.exports = router;
