const mysql = require('mysql2')


const pool = mysql.createPool({
    user: 'ubeers',
    host: 'localhost',
    database: 'ubeers',
    password: 'ubeers',
    port: 3306
})

module.exports = pool;