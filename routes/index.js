const express = require('express');
const router = express.Router();
const validator = require('validator');
const {validUserInput} = require('../functions/validators');

/* GET home page. */
router.get('/', (req, res, next)=> {
  res.render('index', { title: 'Express' });
});

module.exports = router;
