/**
 * Created by Kliment on 4/29/2017.
 */
var pool = require('./postgres');

function initSchema(){
    initUsers();
    initCities();
    initConnections();
//    addCities();
}

function initUsers(){
    pool.query('CREATE TABLE IF NOT EXISTS users (' +
        'id serial primary key not null,'+
        'name varchar not null,' +
        'surname varchar,'+
        'email varchar unique not null,'+
        'password varchar,'+
        'token varchar,'+
        'age int)');
}

function initCities(){
    pool.query('CREATE TABLE IF NOT EXISTS cities ('+
        'id serial primary key not null, '+
        'name varchar unique not null)')
        .then(data=>{
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