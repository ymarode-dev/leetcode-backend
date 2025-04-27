// src/db/client.js
const { Pool } = require('pg');

const pool = new Pool({
    url: 'your_db_user',
});

const query = (text, params) => {
    return pool.query(text, params);
};

module.exports = {
    query,
    pool
};
