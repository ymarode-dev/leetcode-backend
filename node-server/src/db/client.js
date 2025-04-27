// src/db/client.js
const { Pool } = require('pg');

const pool = new Pool({
    user: 'your_db_user',
    host: 'localhost',
    database: 'your_db_name',
    password: 'your_db_password',
    port: 5432,
});

const query = (text, params) => {
    return pool.query(text, params);
};

module.exports = {
    query,
    pool
};
