const express = require('express');
const router = express.Router();
const Beer = require('../models/beer');

/**
 * @swagger
 * components:
 *   schemas:
 *     Beer:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - price
 *         - brewery_id
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the beer
 *         name:
 *           type: string
 *           description: The name of the beer
 *         description:
 *           type: string
 *           description: The description of the beer
 *         price:
 *           type: number
 *           description: The price of the beer
 *         brewery_id:
 *           type: integer
 *           description: The id of the brewery
 *       example:
 *         id: 1
 *         name: Lager
 *         description: A refreshing lager beer
 *         price: 5.99
 *         brewery_id: 1
 */

/**
 * @swagger
 * tags:
 *   name: Beers
 *   description: The beers managing API
 */

/**
 * @swagger
 * /beers:
 *   get:
 *     summary: Returns the list of all the beers
 *     tags: [Beers]
 *     responses:
 *       200:
 *         description: The list of the beers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Beer'
 *       500:
 *         description: Some server error
 */
router.get('/', (req, res) => {
  Beer.getAll((err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(results);
  });
});

/**
 * @swagger
 * /beers:
 *   post:
 *     summary: Add a new beer
 *     tags: [Beers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Beer'
 *     responses:
 *       201:
 *         description: The beer was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Beer'
 *       500:
 *         description: Some server error
 */
router.post('/', (req, res) => {
  const beerData = req.body;
  Beer.create(beerData, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Beer added successfully', beerId: results.insertId });
  });
});

/**
 * @swagger
 * /beers/{id}:
 *   put:
 *     summary: Update an existing beer
 *     tags: [Beers]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The beer id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Beer'
 *     responses:
 *       200:
 *         description: The beer was successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Beer'
 *       500:
 *         description: Some server error
 */
router.put('/:id', (req, res) => {
  const beerId = req.params.id;
  const beerData = req.body;
  Beer.update(beerId, beerData, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'Beer updated successfully' });
  });
});

/**
 * @swagger
 * /beers/{id}:
 *   delete:
 *     summary: Remove a beer
 *     tags: [Beers]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The beer id
 *     responses:
 *       204:
 *         description: The beer was deleted
 *       500:
 *         description: Some server error
 */
router.delete('/:id', (req, res) => {
  const beerId = req.params.id;
  Beer.delete(beerId, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'Beer deleted successfully' });
  });
});

module.exports = router;
