const crypto = require('crypto');
const pool = require('../db');

const User = {
    getAll: callback => {
        const query = 'SELECT * FROM user';
        pool.query(query, callback);
    },
    create: (data, callback) => {

        // On chiffre le mot de passe en sha256
        const password = data.password;
        const hash = crypto.createHash('sha256');
        hash.update(password);
        data.password = hash.digest('hex');

        const query = 'INSERT INTO user (username, email, password, role) VALUES (?, ?, ?, ?)';
        pool.query(query, [data.username, data.email, data.password, data.role], callback);
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