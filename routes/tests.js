/**
 * Created by Kliment on 5/5/2017.
 */
const express = require('express');
const router = express.Router();
const validator = require('validator');
const {validUserInput,validTicketInput,validSearchInput} = require('../functions/validators');

router.get('/', (req, res, next)=> {
    res.render('index', { title: 'Express' });
});

router.post('/user-input',(req,res)=>{
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

module.exports = router;