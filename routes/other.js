const express = require('express');
const router = express.Router();
const pool = require('../database/postgres');

router.get('/destinations', (req, res)=> {
    pool.query('SELECT name FROM cities ORDER BY popularity DESC LIMIT 10')
        .then(data=>{
            if(data.rowCount>0){
                res.send(data.rows);
            }else{
                res.status(501).end();
            }
        },err=>{
           console.error(err);
           res.status(500).end();
        });
});

router.get('/age-history', (req,res)=>{
   pool.query('SELECT id FROM age_history ORDER BY total DESC LIMIT 10')
       .then(data=>{
           res.send(data.rows);
       },err=>{
           console.error(err);
           res.status(500).end();
       })
});

module.exports = router;
