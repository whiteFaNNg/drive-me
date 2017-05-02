/**
 * Created by Kliment on 4/29/2017.
 */
var pool = require('./postgres');

function initSchema(){
    initUsers();
    initCities();
    initConnections();
    initDrivers();
    initPreferences();

}

function initUsers(){
    pool.query('CREATE TABLE IF NOT EXISTS users (' +
        'id serial primary key not null,'+
        'name varchar not null,' +
        'surname varchar,'+
        'email varchar unique not null,'+
        'password varchar,'+
        'token varchar,'+
        'age int)')
        .then(data=>{
            console.log('Table >users< created');
        },err=>{
            console.log('Error while creating table >users<: '+err);
            }
        );
}

function initCities(){
    pool.query('CREATE TABLE IF NOT EXISTS cities ('+
        'id serial primary key not null, '+
        'name varchar unique not null, '+
        'popularity int not null default 0)')
        .then(data=>{
            console.log('Table >cities< created');
            pool.query('SELECT count(*) from cities')
                .then(data=>{
                    if(parseInt(data.rows[0].count)===0){
                       addCities();
                    }
                },err=>{
                    console.log(err);
                })
        },err=>{
            console.log(err);
        });
}

function initConnections(){
    pool.query('CREATE TABLE IF NOT EXISTS connections ('+
        'id serial primary key not null, '+
        'first int not null, '+
        'second int not null, '+
        'distance int not null, '+
        'time int not null)')
        .then(data=>{
            console.log('Table >connections< created');
            pool.query('SELECT count(*) from connections')
                .then(data=>{
                    if(parseInt(data.rows[0].count)===0){
                        addConnections();
                    }
                },err=>{
                    console.log(err);
                })
        },err=>{
            console.log(err);
        });
}

function initDrivers(){
    pool.query('CREATE TABLE IF NOT EXISTS drivers ('+
        'id serial primary key not null, '+
        'name varchar not null, '+
        'surname varchar not null, '+
        'email varchar unique not null, '+
        'password varchar not null, '+
        'token varchar, '+
        'driver_license varchar not null, '+
        'phone_number varchar, '+
        'age int not null, '+
        'short_info text, '+
        'vehicle_type varchar not null, '+
        'vehicle_seats int not null, '+
        'vehicle_year int not null, '+
        'vehicle_gas real not null, '+
        'total_km int not null default 0, '+
        'total_passengers int not null default 0, '+
        'total_rating int not null default 0, '+
        'total_votes int not null default 0 )')
        .then(data=>{
            console.log('Table >drivers< created')
        },err=>{
            console.log('Error while creating >drivers< table: '+err);
        });
}

function initPreferences(){
    pool.query('CREATE TABLE IF NOT EXISTS preferences ('+
        'id serial primary key not null, '+
        'driver_id int not null, '+
        'pets boolean not null default false, '+
        'smoking boolean not null default false, '+
        'music boolean not null default false, '+
        'chatty boolean not null default false )')
        .then(data=>{
            console.log('Table >preferences< created');
        },err=>{
            console.log('Error while creating table >preferences< : '+err);
        })
}

function initVehicles(){
    pool.query('CREATE TABLE IF NOT EXISTS vehicles ('+
        'id serial primary key not null, '+
        'type varchar not null,'+
        'year int not null, '+
        'seats int not null, '+
        'gas real not null, '+
        'driver_id int not null )')
        .then(data=>{
            console.log('Table >vehicles< created');
        },err=>{
            console.log('Error while creating table >vehicles<: '+err);
        });
}

function addCities(){
    pool.query("INSERT INTO cities (name) values ('ohrid'),('struga'),('debar'),('kicevo'),('resen'),('bitola'),('prilep'),"+
        "('krusevo'),('gostivar'),('tetovo'),('skopje'),('kumanovo'),('veles'),('kriva palanka'),('stip'),('kocani'),"+
        "('berovo'),('strumica'),('kavadarci'),('demir kapija'),('gevgelija');")
        .then(data=>{
            console.log("Cities have been inserted");
        },err=>{
            console.log("Error while inserting the cities -> "+err);
        });
}

function addConnections(){

}

module.exports = initSchema;