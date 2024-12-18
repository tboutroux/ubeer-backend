const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.get('/', (req, res) => {
    User.getAll((err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(results);
    });
});
