const pool = require('../db');

const Beer = {
  getAll: callback => {
    const query = 'SELECT * FROM beer';
    pool.query(query, callback);
  },
  create: (data, callback) => {
    const query = 'INSERT INTO beer (name, description, price, brewery_id) VALUES (?, ?, ?, ?)';
    pool.query(query, [data.name, data.description, data.price, data.brewery_id], callback);
  },
  update: (id, data, callback) => {
    const query = 'UPDATE beer SET name = ?, description = ?, price = ?, brewery_id = ? WHERE id = ?';
    pool.query(query, [data.name, data.description, data.price, data.brewery_id, id], callback);
  },
  delete: (id, callback) => {
    const query = 'DELETE FROM beer WHERE id = ?';
    pool.query(query, [id], callback);
  },
  getFiltered: (query, params, callback) => {
    pool.query(query, params, callback);
  },
  count: callback => {
    const query = 'SELECT COUNT(*) AS total FROM beer';
    pool.query(query, (err, results) => {
      if (err) {
        return callback(err);
      }
      callback(null, results[0].total);
    });
  },
    
};

module.exports = Beer;
