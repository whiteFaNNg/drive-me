/**
 * Created by Kliment on 4/29/2017.
 */
var Pool = require('pg').Pool;

var config = require('../config/pg-config.json');
var pool = new Pool(config);

module.exports = pool;
