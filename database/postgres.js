const Pool = require('pg').Pool;

const config = require('../config/pg-config.json');
const pool = new Pool(config);

module.exports = pool;
