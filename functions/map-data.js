/**
 * Created by Kliment on 5/2/2017.
 */
const pool = require('../database/postgres');

let cities = [];
let connections = [];

let initMapData = ()=>{
    pool.query('SELECT name FROM cities')
        .then(data=>{
            // console.log(data.rows);
            for(let i = 0;i<data.rows.length;i++){
                cities.push(data.rows[i].name);
            }
            pool.query('SELECT first, second, distance, time FROM connections')
                .then(data=>{
                    for(let i = 0;i<data.rows.length;i++){
                        let temp = data.rows[i];
                        connections.push([--temp.first,--temp.second,temp.distance,temp.time]);
                    }
                    console.log(connections.length);
                },err=> {
                    console.log(err)
                })
        },err=>{
            console.log(err);
        });
};

module.exports = {cities, connections, initMapData};