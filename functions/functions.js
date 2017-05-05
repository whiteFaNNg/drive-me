/**
 * Created by Kliment on 5/1/2017.
 */
const pool = require('../database/postgres');
const jwt = require('jsonwebtoken');
const secret = require('../config/jwt.json');
const {cities, connMap} = require('./map-data');

let generateToken = (id,type)=>{
    return jwt.sign({id: id, access: type}, secret.key).toString();
};

let verifyRoute = (trip_route)=>{
    let locations = trip_route.split('-');
    let valid = true;
    for(let i=0;i<locations.length;i++){
        let temp = false;
        for(let j=0;j<cities.length;j++){
            if(locations[i].toString()===cities[j].toString()){
                temp=true;
                break;
            }
        }
        if(temp===false){
            valid = false;
            break;
        }
    }
    return valid;
};

let getStartTime = (locations, startTime, endIndex)=>{
    let temp = 0;
    // console.log("Start time -> "+startTime+", endIndex -> "+endIndex);
    for(let i = 0; i<endIndex; i++){
        temp+=connMap.get(locations[i]).get(locations[i+1])[0];
    }
    return startTime + temp;
};

let constructRefinedSearch = (row, refinedSearch, locations, startTimeRange, priceRange, destination, availableSeats)=>{
    let subRoutes = getSubroutes(locations,destination);
    let totalSeats = parseInt(row.vehicle_seats);
    let gasConsumption = parseFloat(row.vehicle_gas);
    for(let i = 0; i<subRoutes.length; i++){
        let isTaken = false;
        for(let j = subRoutes.begin; j<subRoutes.end; j++){
            if(availableSeats[j]===totalSeats){
                isTaken = true;
                break;
            }
        }
        if(!isTaken){
            // console.log(row);
            let startingTime = getStartTime(locations,row.start_time,subRoutes[i].begin);
            let obj = Object.assign({id:row.id, at:startingTime, price: gasConsumption/100*subRoutes[i].distance*90}, subRoutes[i]);
            if((obj.price>priceRange.from) && (obj.price<priceRange.to) && (obj.at>startTimeRange.from) && (obj.at<startTimeRange.to)){
                refinedSearch.primary.push(obj);
            }else{
                refinedSearch.secondary.push(obj);
            }
        }
    }
};

let getSubroutes = (locations,destination)=> {
    let tempDistance = 0;
    let tempTime = 0;
    let beginIndex = 0;
    let endIndex = 0;
    let inRoute = false;
    let routes = [];
    for(let m = 0; m<locations.length; m++){
        if(locations[m]===destination.from){
            inRoute = true;
            beginIndex = m;
            tempDistance = 0;
            tempTime = 0;
        }
        if(locations[m]===destination.to){
            endIndex = m;
            routes.push({begin:beginIndex, end:endIndex, time: tempTime, distance: tempDistance});
            inRoute = false;
            tempTime = 0;
            tempDistance = 0;
        }
        if(inRoute){
            tempTime += connMap.get(locations[m]).get(locations[m+1])[1];
            tempDistance += connMap.get(locations[m]).get(locations[m+1])[0];
        }
    }
    return routes;
};

//option -> 0 for distance, 1 for time
let calculateRoute = (locations,startIndex,endIndex,option)=>{
    let total = 0;
    for(let i = startIndex;i<endIndex;i++){
        total += connMap.get(locations[i]).get(locations[i+1])[option];
    }
    return total;
};

let refineSearch = (refinedSearch,rows,startTimeRange,priceRange,destination)=>{
    let currTime = 0;
    let maxTime = 5000;
    let resolvedRows = 0;
    let rowsLength = rows.length;
    let foundError = false;
    return new Promise((resolve,reject)=>{
        let myInterval = setInterval(()=>{
            if(resolvedRows===rowsLength){
                //takes around 1-5 ms locally
                clearInterval(myInterval);
                resolve(refinedSearch);
            }else{

                currTime+=10;
                if(currTime>=maxTime || foundError){
                    clearInterval(myInterval);
                    console.log("RESOLVED ROWS -> "+resolvedRows);
                    reject("taking too much time or error");
                }
            }
        },10);
        for(let i = 0; i<rowsLength; i++){
            let locations = rows[i].route.split('-');
            let availableSeats = [];
            for(let j = 0; j<locations.length; j++){
                availableSeats.push(0);
            }
            pool.query('SELECT start_position, end_position FROM tickets WHERE trip_id = $1',[rows[i].id])
                .then(data=>{
                    if(data.rowCount>=1){
                        for(let k = 0; k<data.rowCount; k++){
                            let begin = parseInt(data.rows[k].start_position);
                            let end = parseInt(data.rows[k].end_position);
                            for(let m = begin; m<end; m++){
                                availableSeats[m]++;
                            }
                        }
                    }
                    constructRefinedSearch(rows[i], refinedSearch, locations, startTimeRange, priceRange, destination,availableSeats);
                    resolvedRows++
                },err=>{
                    console.error(err);
                    foundError = true;
                });
        }
    });
};

let calculatePrice = (ticketStart,ticketEnd,ticketDistance,gas,locations)=>{
    let basePrice = gas/100*ticketDistance*90;
    if((parseInt(ticketStart)!==0) || (parseInt(ticketEnd)!==(locations.length-1))){
        let totalDistance = calculateRoute(locations,0,locations.length-1,0);
        return basePrice * Math.log(Math.E + (1-ticketDistance/totalDistance)*5);
    }else{
        return basePrice;
    }
};

module.exports = {generateToken,verifyRoute,calculateRoute,calculatePrice,refineSearch,getStartTime};