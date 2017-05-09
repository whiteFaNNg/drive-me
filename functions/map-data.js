const pool = require('../database/postgres');

let cities = [];
let connections = [];
let connMap = new Map();

let initConnMap = ()=>{
    for(let i = 0;i<cities.length;i++){
        connMap.set(cities[i],new Map());
    }
    // city -> city -> [distance,time]
    for(let i = 0;i<connections.length;i++){
        connMap.get(cities[connections[i][0]]).set(cities[connections[i][1]],[connections[i][2],connections[i][3]]);
        connMap.get(cities[connections[i][1]]).set(cities[connections[i][0]],[connections[i][2],connections[i][3]]);
    }
};

let initMapData = ()=>{
    pool.query('SELECT name FROM cities ORDER BY id')
        .then(data=>{
            for(let i = 0;i<data.rows.length;i++){
                cities.push(data.rows[i].name);
            }
            pool.query('SELECT first, second, distance, time FROM connections')
                .then(data=>{
                    for(let i = 0;i<data.rows.length;i++){
                        let temp = data.rows[i];
                        connections.push([--temp.first,--temp.second,temp.distance,temp.time]);
                    }
                    initConnMap();
                },err=> {
                    console.log(err)
                })
        },err=>{
            console.log(err);
        });
};

module.exports = {cities, connections, connMap, initMapData};