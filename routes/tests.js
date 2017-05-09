const express = require('express');
const router = express.Router();
const validator = require('validator');
const pool = require('../database/postgres');
const {validUserInput,validTicketInput,validSearchInput,validDriverInput,validTripInput} = require('../functions/validators');

router.get('/', (req, res)=> {
    pool.query('SELECT count(*) FROM trips')
        .then(data=>{
            console.log(data.rows[0].count);
        },err=>{
           console.error(err);
        });
    res.render('index', { title: 'Express' });
});

router.post('/user-register',(req,res)=>{
    let userInput = {
        email : req.body.email || "",
        name : req.body.name || "",
        surname : req.body.surname || "",
        age : req.body.age || "",
        password : req.body.password || ""
    };

    if(validUserInput(userInput)){
        res.send("OK");
    }else{
        res.send("ERROR");
    }
});

router.post('/driver-register',(req,res)=>{
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
        res.send({message:"OK",data: driverInput});
    }else{
        res.send("ERROR");
    }
});

router.post('/ticket-input',(req,res)=>{
    let ticketInfo = {
        tripId: req.body.tripId || "",
        startIndex: req.body.startIndex || "",
        endIndex: req.body.endIndex || ""
    };
    if(validTicketInput(ticketInfo)){
        res.send("OK");
    }else{
        res.send("ERROR");
    }
});

router.post('/ticket-search',(req,res)=>{
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
    res.send({valid: validSearchInput(searchInput),searchInput});
});

router.post('/trip-register', (req,res)=>{
    let tripInput = {
        id: "1",
        tripRoute: req.body.tripRoute || "",
        startTime: req.body.startTime || ""
    };
    if(validTripInput(tripInput)){
        res.send({message:"OK",data: tripInput});
    }else{
        res.send("ERROR");
    }
});

module.exports = router;