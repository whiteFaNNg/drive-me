/**
 * Created by Kliment on 4/29/2017.
 */
const Pool = require('pg').Pool;

const config = require('../config/pg-config.json');
const pool = new Pool(config);

module.exports = pool;
