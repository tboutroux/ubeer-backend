const express = require('express');
const router = express.Router();
const Picture = require('../models/picture');

/**
 * @swagger
 * components:
 *   schemas:
 *     Picture:
 *       type: object
 *       required:
 *         - url
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the picture
 *         url:
 *           type: string
 *           description: The URL of the picture on Google Drive
 *       example:
 *         id: 1
 *         url: 'https://drive.google.com/uc?id=abc123'
 */

/**
 * @swagger
 * tags:
 *   name: Pictures
 *   description: The pictures managing API
 */

/**
 * @swagger
 * /pictures:
 *   get:
 *     summary: Returns the list of all the pictures
 *     tags: [Pictures]
 *     responses:
 *       200:
 *         description: The list of the pictures
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Picture'
 *       500:
 *         description: Some server error
 */
router.get('/', (req, res) => {
  Picture.getAll((err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(results);
  });
});

/**
 * @swagger
 * /pictures/{id}:
 *   get:
 *     summary: Get a single picture by its ID
 *     tags: [Pictures]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The picture id
 *     responses:
 *       200:
 *         description: The picture details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Picture'
 *       404:
 *         description: Picture not found
 *       500:
 *         description: Some server error
 */
router.get('/:id', (req, res) => {
  const pictureId = req.params.id;
  Picture.getOne(pictureId, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Picture not found' });
    }
    res.status(200).json(results);
  });
});

/**
 * @swagger
 * /pictures:
 *   post:
 *     summary: Add a new picture
 *     tags: [Pictures]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: The picture was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Picture'
 *       500:
 *         description: Some server error
 */
router.post('/', (req, res) => {
  const pictureData = req.file; // Le fichier est dans req.file, pour les fichiers envoyés avec multipart/form-data
  Picture.create(pictureData, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Picture added successfully', pictureId: results });
  });
});

/**
 * @swagger
 * /pictures/{id}:
 *   put:
 *     summary: Update an existing picture URL
 *     tags: [Pictures]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The picture id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Picture'
 *     responses:
 *       200:
 *         description: The picture was successfully updated
 *       500:
 *         description: Some server error
 */
router.put('/:id', (req, res) => {
  const pictureId = req.params.id;
  const pictureData = req.body; // L'URL de la photo mise à jour
  Picture.update(pictureId, pictureData, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'Picture updated successfully' });
  });
});

/**
 * @swagger
 * /pictures/{id}:
 *   delete:
 *     summary: Remove a picture
 *     tags: [Pictures]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The picture id
 *     responses:
 *       204:
 *         description: The picture was deleted
 *       500:
 *         description: Some server error
 */
router.delete('/:id', (req, res) => {
  const pictureId = req.params.id;
  Picture.delete(pictureId, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'Picture deleted successfully' });
  });
});

module.exports = router;
