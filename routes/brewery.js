const express = require('express');
const router = express.Router();
const Brewery = require('../models/brewery');
const multer = require('multer');

const { client } = require('../redis');
const storage = multer.memoryStorage();
upload = multer({ storage: storage });

/**
 * @swagger
 * components:
 *   schemas:
 *     Brewery:
 *       type: object
 *       required:
 *         - name
 *         - address
 *         - profile_picture_id
 *         - banner_picture_id
 *       properties:
 *        id:
 *          type: integer
 *          description: The auto-generated id of the brewery
 *        name:
 *         type: string
 *         description: The name of the brewery
 *        address:
 *         type: string
 *         description: The address of the brewery
 *        profile_picture_id:
 *         type: integer
 *         description: The id of the profile picture of the brewery
 *        banner_picture_id:
 *         type: integer
 *         description: The id of the banner picture of the brewery
 *       example:
 *        id: 1
 *        name: Brewdog
 *        address: 123 Fake St, London
 *        profile_picture_id: 1
 *        banner_picture_id: 2
 */

/**
 * @swagger
 * tags:
 *  name: Breweries
 *  description: The breweries managing API
 */

/**
 * @swagger
 *  /breweries:
 *      get:
 *          summary: Returns the list of all the breweries
 *          tags: 
 *              - Breweries
 *          responses:
 *              200:
 *                  description: The list of the breweries
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: array
 *                              items:
 *                                  $ref: '#/components/schemas/Brewery'
 *              500:
 *                  description: Internal server error
 */
router.get('/', (req, res) => {
    Brewery.getAll((err, results) => {
        if (err) {
            console.error('Error getting breweries:', err);
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(results);
    });
});
/**
 * @swagger
 * /breweries/{id}:
 *   get:
 *     summary: Get the brewery by id
 *     tags:
 *       - Breweries
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric ID of the brewery to get
 *         schema:
 *           type: integer
 *           format: int64
 *     responses:
 *       200:
 *         description: The brewery description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Brewery'
 *       404:
 *         description: Brewery not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', async (req, res) => {
    const breweryId = req.params.id;

    try {
        // Incrémenter le compteur de vues dans Redis
        const views = await client.incr(`brewery:${breweryId}:views`);

        // Récupérer les détails de la brasserie
        Brewery.getOne(breweryId, (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (results.length === 0) {
                return res.status(404).json({ error: 'Brewery not found' });
            }
            res.status(200).json({ ...results, views: parseInt(views || 0) });
        });
    } catch (error) {
        console.error('Erreur Redis :', error);
        res.status(500).json({ error: 'Erreur lors de l\'incrémentation des vues' });
    }
});

/**
 * @swagger
 * /breweries:
 *   post:
 *     summary: Create a new brewery
 *     tags:
 *       - Breweries
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Brewery'
 *     responses:
 *       201:
 *         description: The brewery was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Brewery'
 *       500:
 *         description: Internal server error
 */
router.post(
    '/',
    upload.fields([
        { name: 'profile_picture_id', maxCount: 1 },
        { name: 'banner_picture_id', maxCount: 1 }
    ]),
    (req, res) => {

        // Vérifiez que les fichiers nécessaires sont présents
        if (!req.files || !req.files['profile_picture_id'] || !req.files['banner_picture_id']) {
            return res.status(400).json({ error: 'Missing required files' });
        }

        const datas = {
            name: req.body.name,
            address: req.body.address,
            profile_picture_id: req.files['profile_picture_id'],
            banner_picture_id: req.files['banner_picture_id'],
            req: req,
            res: res
        };

        Brewery.create(datas, (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ id: results.insertId, ...req.body });
        });
    }
);

/**
 * @swagger
 * /breweries/{id}:
 *   put:
 *     summary: Update the brewery by id
 *     tags:
 *       - Breweries
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric ID of the brewery to update
 *         schema:
 *           type: integer
 *           format: int64
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Brewery'
 *     responses:
 *       200:
 *         description: The brewery was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Brewery'
 *       500:
 *         description: Internal server error
 */
router.put('/:id', (req, res) => {
    Brewery.update(req.params.id, req.body, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ id: req.params.id, ...req.body });
    });
});

/**
 * @swagger
 * /breweries/{id}:
 *   delete:
 *     summary: Remove the brewery by id
 *     tags:
 *       - Breweries
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric ID of the brewery to remove
 *         schema:
 *           type: integer
 *           format: int64
 *     responses:
 *       200:
 *         description: The brewery was removed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Brewery'
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', (req, res) => {
    Brewery.delete(req.params.id, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(204);
    });
});

module.exports = router;