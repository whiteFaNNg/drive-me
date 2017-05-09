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

router.get('/popular-drivers', (req,res)=>{
    pool.query('SELECT name, surname, email, total_passengers FROM drivers ORDER BY total_passengers DESC LIMIT 10')
       .then(data=>{
           res.send(data.rows);
       },err=>{
           console.error(err);
           res.status(500).end();
       })
});

router.get('/best-rated-drivers', (req,res)=>{
    pool.query('SELECT name, surname, email, CAST(total_rating AS real)/total_votes AS rating FROM drivers '+
        'WHERE total_votes != 0 ORDER BY rating DESC LIMIT 10')
        .then(data=>{
            res.send(data.rows);
        },err=>{
            res.status(500).end();
        });
});

router.get('/most-experienced-drivers', (req,res)=>{
    pool.query('SELECT name, surname, email, total_km FROM drivers ORDER BY total_km DESC LIMIT 10')
        .then(data=>{
            res.send(data.rows);
        },err=>{
            console.error(err);
            res.status(500).end();
        });
});

module.exports = router;
