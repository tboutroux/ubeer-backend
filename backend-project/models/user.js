const pool = require('../db');

const User = {
    create: (data, callback) => {
        const query = 'INSERT INTO user (username, email, password) VALUES (?, ?, ?)';
        pool.query(query, [data.username, data.email, data.password], callback);
    },
    update: (id, data, callback) => {
        const query = 'UPDATE user SET username = ?, email = ?, password = ? WHERE id = ?';
        pool.query(query, [data.username, data.email, data.password, id], callback);
    },
    delete: (id, callback) => {
        const query = 'DELETE FROM user WHERE id = ?';
        pool.query(query, [id], callback);
    }
};

module.exports = User;