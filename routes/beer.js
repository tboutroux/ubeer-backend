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
 *  get:
 *    summary: Returns the list of all the beers with pagination and filtering
 *    tags: [Beers]
 *    parameters:
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *        description: The page number (default is 1)
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *        description: The number of items per page (default is 10)
 *      - in: query
 *        name: name
 *        schema:
 *          type: string
 *        description: Filter beers by name
 *      - in: query
 *        name: price
 *        schema:
 *          type: number
 *        description: Filter beers by price (less than or equal to)
 *      - in: query
 *        name: brewery_id
 *        schema:
 *          type: integer
 *        description: Filter beers by brewery ID
 *    responses:
 *      200:
 *        description: The list of beers with pagination and filtering
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                data:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/Beer'
 *                pagination:
 *                  type: object
 *                  properties:
 *                    current_page:
 *                      type: integer
 *                    total_pages:
 *                      type: integer
 *                    total_items:
 *                      type: integer
 *                    limit:
 *                      type: integer
 *      500:
 *        description: Some server error
 *
 */
router.get('/', (req, res) => {

  const { page = 1, limit = 10, name, price, brewery_id } = req.query;

  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM beer WHERE 1=1'; // 1=1 est un raccourci pour éviter des erreurs dans les conditions
  const queryParams = [];

  if (name) {
    query += ' AND name LIKE ?';
    queryParams.push(`%${name}%`);
  }

  if (price) {
    query += ' AND price <= ?';
    queryParams.push(price);
  }

  if (brewery_id) {
    query += ' AND brewery_id = ?';
    queryParams.push(brewery_id);
  }

  query += ' LIMIT ? OFFSET ?';
  queryParams.push(parseInt(limit), parseInt(offset));

  // Exécution de la requête SQL
  Beer.getFiltered(query, queryParams, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Récupérer le nombre total d'enregistrements pour la pagination
    Beer.count((err, totalCount) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(200).json({
        data: results,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(totalCount / limit),
          total_items: totalCount,
          limit: parseInt(limit),
        },
      });
    });
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
  console.log('Received beer data:', beerData); // Ajout de logs pour vérifier les données reçues

  Beer.create(beerData, (err, results) => {
    if (err) {
      console.error('Error creating beer:', err); // Ajout de logs pour afficher l'erreur
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
