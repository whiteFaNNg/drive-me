/**
 * Created by Kliment on 5/5/2017.
 */
const express = require('express');
const router = express.Router();
const validator = require('validator');
const {validUserInput,validTicketInput} = require('../functions/validators');

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
    // console.log(typeof ticketInfo.startIndex);
    if(validTicketInput(ticketInfo)){
        res.send("OK");
    }else{
        res.send("ERROR");
    }
});

module.exports = router;