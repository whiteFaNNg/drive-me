const express = require('express');
const router = express.Router();
const validator = require('validator');
const {validUserInput} = require('../functions/validators');

/* GET home page. */
router.get('/', (req, res, next)=> {
  res.render('index', { title: 'Express' });
});

router.post('/test',(req,res)=>{
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

module.exports = router;
