const express = require('express');
const router = express.Router();
const AgeVerificationAttempt = require('../models/ageVerificationAttempt');

/**
 * @swagger
 * /api/age-verification-attempt:
 *   post:
 *     summary: Log an age verification attempt
 *     tags: [AgeVerification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imageUrl:
 *                 type: string
 *               estimatedAge:
 *                 type: integer
 *                 nullable: true
 *               success:
 *                 type: boolean
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *               userId:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Attempt logged
 *       500:
 *         description: Server error
 */
router.post('/', (req, res) => {
  const { imageUrl, estimatedAge, success, timestamp, userId } = req.body;
  AgeVerificationAttempt.create({ imageUrl, estimatedAge, success, timestamp, userId }, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Attempt logged' });
  });
});

module.exports = router;