const pool = require('../db');

const Brewery = {
    getAll: callback => {
        const query = `SELECT brewery.id, brewery.name, brewery.address, picture.url AS profile_picture_url, picture.url AS banner_picture_url 
                        FROM brewery 
                        JOIN picture AS profile_picture 
                        ON brewery.profile_picture_id = profile_picture.id 
                        JOIN picture AS banner_picture 
                        ON brewery.banner_picture_id = banner_picture.id`;
        pool.query(query, callback);
    },
    create: (data, callback) => {

        // Insert new pictures into the picture table if they don't already exist, else use the existing picture id
        

        // Insert new brewery into the brewery table
        const query = 'INSERT INTO brewery (name, address, profile_picture_id, banner_picture_id) VALUES (?, ?, ?, ?)';
        pool.query(query, [data.name, data.address, data.profile_picture_id, data.banner_picture_id], callback);
    },
    update: (id, data, callback) => {
        const query = 'UPDATE brewery SET name = ?, address = ?, profile_picture_id = ?, banner_picture_id = ? WHERE id = ?';
        pool.query(query, [data.name, data.address, data.profile_picture_id, data.banner_picture_id, id], callback);
    },
    delete: (id, callback) => {
        const query = 'DELETE FROM brewery WHERE id = ?';
        pool.query(query, [id], callback);
    }
};

module.exports = Brewery;