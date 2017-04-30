/**
 * Created by Kliment on 4/29/2017.
 */
var pool = require('./postgres');

function initSchema(){
    initUsers();
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

module.exports = initSchema;