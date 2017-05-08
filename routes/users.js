const express = require('express');
const router = express.Router();
const pool = require('../database/postgres');
const bcrypt = require('bcryptjs');
const authenticate = require('../middleware/authenticate');
const getUserData = require('../middleware/user-info');
const {generateToken,refineSearch,getStartTime,calculateRoute,calculatePrice} = require('../functions/functions');
const {validUserInput,validTicketInput,validSearchInput,getInt} = require('../functions/validators');


router.get('/', (req, res, next)=> {
    res.send('respond with a resource');
});

router.post('/register', (req, res)=> {
    let userInput = {
        email : req.body.email || "",
        name : req.body.name || "",
        surname : req.body.surname || "",
        age : req.body.age || "",
        password : req.body.password || ""
    };

    if(validUserInput(userInput)){
        pool.query('SELECT email FROM users WHERE email = $1', [email])
            .then(data => {
                if(data.rowCount===0){
                    let salt = bcrypt.genSaltSync(10);
                    userInput.password = bcrypt.hashSync(userInput.password, salt);
                    pool.query('INSERT INTO users (name,surname,email,password,age) VALUES ($1,$2,$3,$4,$5)',
                        [userInput.name,userInput.surname,userInput.email,userInput.password,userInput.age])
                        .then(data2=>{
                            if(parseInt(data2.rowCount) === 1 ){
                                res.send({message:"user created"});
                            }else{
                                res.send({message:"could not create user"});
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
        res.send({message:'invalid input'});
    }
});

router.post('/login', (req, res)=> {
    let email = req.body.email || "";
    let password = req.body.password || "";
    pool.query('SELECT * FROM users WHERE email = $1', [email])
        .then(data=>{
           if(data.rowCount !== 1){
               res.send('email not found');
           } else{
               if(bcrypt.compareSync(password, data.rows[0].password)){
                   let token = generateToken(data.rows[0].id, "access");
                   pool.query('UPDATE users SET token = $1 WHERE email = $2',[token,email])
                       .then(data2=>{
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
});

router.get('/me',authenticate, getUserData, (req,res)=>{
    res.send(req.user);
});

router.post('/find',authenticate,getUserData, (req,res)=>{
    let searchInput = {};
    searchInput.startTimeRange = req.body.startTimeRange;
    searchInput.priceRange = req.body.priceRange;
    searchInput.destination = req.body.destination;
    searchInput.preferences = {
        pets : req.query.pets||"false",
        smoking: req.query.smoking||"false",
        music: req.query.music||"false",
        chatty: req.query.chatty||"false"
    };
    if(validSearchInput(searchInput)){
        let matchLocationQuery = "%"+searchInput.destination.from+"%"+searchInput.destination.to+"%";
        let refinedSearch = {primary:[],secondary:[]};
        pool.query("SELECT trips.id, trips.route, trips.start_time, trips.end_time, drivers.name, drivers.surname, "+
            "CAST(drivers.total_rating AS real)/drivers.total_votes AS rating, drivers.vehicle_gas, drivers.vehicle_seats "+
            "FROM trips JOIN drivers ON trips.driver_id = drivers.id "+
            "WHERE trips.start_time <= $1 AND trips.end_time > $1 AND trips.route LIKE $2 AND drivers.pets = $3 AND "+
            "drivers.music = $4 and drivers.smoking = $5 and drivers.chatty = $6 "+
            "ORDER BY rating DESC",
            [searchInput.startTimeRange.from,matchLocationQuery,searchInput.preferences.pets,
                searchInput.preferences.music,searchInput.preferences.smoking,searchInput.preferences.chatty])
            .then(data=>{
                // console.log(data);
                if(parseInt(data.rowCount)>=1){
                    refineSearch(refinedSearch, data.rows,searchInput.startTimeRange,searchInput.priceRange,searchInput.destination,refinedSearch)
                        .then(data=>{
                            res.send(data);
                        },err=>{
                            console.error(err);
                            res.status(501).end();
                        });
                }else{
                    res.send({message:"no match"});
                }
            },err=>{
                console.error(err);
                res.code(500).end();
            });
    }else{
        res.send({message:"invalid input"});
    }
});

router.post('/ticket', authenticate, getUserData, (req,res)=>{
    let ticketInfo = {
        tripId: req.body.tripId || "",
        startIndex: req.body.startIndex || "",
        endIndex: req.body.endIndex || ""
    };
    if(validTicketInput(ticketInfo)){
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
                                            res.send({message:"could not reserve ticket"});
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
    }else{
        res.send({message:'invalid input'});
    }
});

router.get('/ticket',authenticate, getUserData, (req,res)=>{
    pool.query('SELECT * FROM tickets WHERE user_id = $1',[req.user.id])
       .then(data=>{
           let ticketsObj = {};
           ticketsObj.count = data.rowCount;
           ticketsObj.tickets = data.rows;
           res.send(ticketsObj);
       },err=>{
           res.status(500).end();
       })
});

router.delete('/ticket/:id',authenticate,getUserData, (req,res)=>{
    let ticketId = getInt(req.params.id || "");
    if(!isNaN(ticketId)){
        pool.query('SELECT start_time, end_location FROM tickets WHERE id = $1 and user_id = $2',[ticketId, req.user.id])
            .then(data=>{
                if(parseInt(data.rowCount)===1){
                    //res.send({message:"ticket deleted"});
                    if(new Date().getTime()/60000<data.rows[0].start_time){
                        pool.query('DELETE FROM tickets WHERE id = $1 and user_id = $2', [ticketId, req.user.id])
                            .then(data2=>{
                                if(parseInt(data2.rowCount)===1){
                                    pool.query('UPDATE cities SET popularity = popularity - 1 WHERE name = $1',[data.rows[0].end_location])
                                        .then(data3=>{
                                            if(parseInt(data3.rowCount)===1){
                                                res.send({message:"ticket deleted"});
                                            }else{
                                                res.send({message:"destination error prevented ticket deletion"});
                                            }
                                        },err=>{
                                            console.error(err);
                                            res.status(500).end();
                                        })
                                }else{
                                    res.send({message:"could not delete ticket"});
                                }
                            },err=>{
                                console.error(err);
                                res.status(500).end();
                            });
                    }else{
                        res.send({message:"cannot delete ticket after start time"});
                    }
                }else{
                    res.send({message:"could not delete ticket"});
                }
            },err=>{
                console.error(err);
                res.status(500).end();
            });
    }else{
        res.send({message:"invalid input"});
    }
});

router.get('/ticket/:id',authenticate,getUserData,(req,res)=>{
    let ticketId = getInt(req.params.id || "");
    if(!isNaN(ticketId)){
        pool.query('SELECT tickets.id, tickets.start_location, tickets.end_location, tickets.start_position, tickets.end_position, '+
            'drivers.name, drivers.surname, drivers.email, drivers.phone_number, drivers.vehicle_gas, drivers.vehicle_seats, trips.route, '+
            'CAST(drivers.total_rating AS real)/drivers.total_votes AS rating '+
            'FROM tickets JOIN trips ON tickets.trip_id=trips.id JOIN drivers ON trips.driver_id=drivers.id '+
            'WHERE tickets.id=$1',[ticketId])
            .then(data=>{
                // res.send(data);
                if(parseInt(data.rowCount)!==1){
                    res.send({message:"could not find that ticket"});
                }else{
                    let locations = data.rows[0].route.split('-');
                    let distance = calculateRoute(locations,data.rows[0].start_position,data.rows[0].end_position,0);
                    let time = calculateRoute(locations,data.rows[0].start_position,data.rows[0].end_position,1);
                    let price = calculatePrice(data.rows[0].start_position,data.rows[0].end_position,distance,data.rows[0].vehicle_gas,locations);
                    let ticketObj = {};
                    ticketObj.ticket = {
                        id:ticketId,
                        user_id:req.user.id,
                        from: data.rows[0].start_location,
                        to: data.rows[0].end_location,
                        distance: distance,
                        time: time,
                        price: price
                    };
                    ticketObj.driver = {
                        name:data.rows[0].name,
                        surname:data.rows[0].surname,
                        email:data.rows[0].email,
                        phone:data.rows[0].phone_number,
                        rating: data.rows[0].rating
                    };
                    ticketObj.other = {
                        seats: data.rows[0].vehicle_seats
                    };
                    res.send(ticketObj);
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
