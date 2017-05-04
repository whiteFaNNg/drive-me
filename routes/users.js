const express = require('express');
const router = express.Router();
const pool = require('../database/postgres');
const bcrypt = require('bcryptjs');
const authenticate = require('../middleware/authenticate');
const getUserData = require('../middleware/user-info');
const {generateToken,refineSearch,getStartTime} = require('../functions/functions');


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
   let refinedSearch = {primary:[],secondary:[]};
   //res.send(preferences);
    pool.query("SELECT trips.id, trips.route, trips.start_time, trips.end_time, drivers.name, drivers.surname, "+
        "CAST(drivers.total_rating AS real)/drivers.total_votes AS rating, drivers.vehicle_gas, drivers.vehicle_seats "+
        "FROM trips JOIN drivers ON trips.driver_id = drivers.id "+
        "WHERE trips.start_time <= $1 AND trips.end_time > $1 AND trips.route LIKE $2 AND drivers.pets = $3 AND "+
        "drivers.music = $4 and drivers.smoking = $5 and drivers.chatty = $6 "+
        "ORDER BY rating DESC",
        [startTimeRange.from,matchLocationQuery,preferences.pets,preferences.music,preferences.smoking,preferences.chatty])
        .then(data=>{
            // console.log(data);
            if(parseInt(data.rowCount)>=1){
                refineSearch(refinedSearch, data.rows,startTimeRange,priceRange,destination,refinedSearch)
                    .then(data=>{
                        res.send(data);
                    },err=>{
                        res.status(501).end();
                    });
            }else{
                res.send({message:"no match"});
            }
        },err=>{
            console.error(err);
            res.code(500).end();
        });
});

router.post('/ticket', authenticate, getUserData, (req,res)=>{
    let ticketInfo = {
        tripId: req.body.tripId,
        startIndex: req.body.startIndex,
        endIndex: req.body.endIndex
    };
    pool.query("SELECT trips.id, trips.route, trips.start_time, drivers.vehicle_seats "+
        "FROM trips JOIN drivers ON trips.driver_id = drivers.id "+
        "WHERE trips.id = $1",[ticketInfo.tripId])
        .then(data=>{
            if(parseInt(data.rowCount)!==1){
                res.status(400).end();
            }else{
                let locations = data.rows[0].route.split('-');
                if(ticketInfo.endIndex>=locations.length){
                    res.status(418).end();
                    return;
                }
                let availableSeats = [];
                for(let j = 0; j<locations.length; j++){
                    availableSeats.push(0);
                }
                pool.query('SELECT start_position, end_position FROM tickets WHERE trip_id = $1',[data.rows[0].id])
                    .then(data2=>{
                        if(data2.rowCount>=1){
                            for(let k = 0; k<data2.rowCount; k++){
                                let begin = parseInt(data2.rows[k].start_position);
                                let end = parseInt(data2.rows[k].end_position);
                                for(let m = begin; m<end; m++){
                                    availableSeats[m]++;
                                }
                            }
                        }
                        let isTaken = false;
                        let numOfSeats = parseInt(data.rows[0].vehicle_seats);
                        for(let j = ticketInfo.startIndex; j<ticketInfo.endIndex; j++){
                            if(availableSeats[j]===numOfSeats){
                                isTaken = true;
                                break;
                            }
                        }
                        if(!isTaken){
                            let startingTime = getStartTime(locations,data.rows[0].start_time,ticketInfo.startIndex);
                            // console.log("STARTING TIME => "+startingTime);
                            pool.query('INSERT INTO tickets (start_location, end_location, start_position, end_position, start_time, trip_id, user_id) '+
                                'VALUES ($1,$2,$3,$4,$5,$6,$7)',
                                [locations[ticketInfo.startIndex],locations[ticketInfo.endIndex],ticketInfo.startIndex,ticketInfo.endIndex,
                                startingTime,ticketInfo.tripId,req.user.id])
                                .then(data3=>{
                                    //console.log(data3);
                                    if(parseInt(data3.rowCount) === 1){
                                        res.send({message:"ticket reserved"});
                                    }else{
                                        res.send({message:"cannot reserve ticket"});
                                    }
                                },err=>{
                                    console.error(err);
                                    res.status(500).end();
                                });
                        }else{
                            res.status(400).end();
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
});

module.exports = router;
