const express = require('express');
const router = express.Router();
const validator = require('validator');

/* GET home page. */
router.get('/', (req, res)=> {
  res.render('index', { title: 'Drive Me' });
});

module.exports = router;
