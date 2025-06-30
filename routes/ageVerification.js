// filepath: /routes/ageVerification.js
const express = require('express');
const multer = require('multer');
const { verifyAge } = require('../services/ageVerification');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /verify-age:
 *   post:
 *     summary: Vérifie l'âge et la biométrie d'un utilisateur à partir d'une pièce d'identité et d'un selfie.
 *     tags: [Age Verification]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               idImage:
 *                 type: string
 *                 format: binary
 *               selfie:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Résultat de la vérification d'âge et biométrique.
 *       400:
 *         description: Erreur dans la soumission.
 *       500:
 *         description: Erreur serveur.
 */
router.post("/", upload.fields([{ name: "idImage" }, { name: "selfie" }]), async (req, res) => {
    console.log("Route /verify-age atteinte");
    try {
        if (!req.files || !req.files.idImage || !req.files.selfie) {
            return res.status(400).json({ error: "Fichiers requis non reçus." });
        }

        console.log("Fichiers reçus:", req.files.idImage[0].originalname, req.files.selfie[0].originalname);

        const idImageBuffer = req.files.idImage[0].buffer;
        const selfieBuffer = req.files.selfie[0].buffer;

        const result = await verifyAge(idImageBuffer, selfieBuffer);

        res.status(200).json({
            isOldEnough: result.isOldEnough,
            age: result.age,
            faceVerification: result.faceVerification,
            details: result.details,
        });
    } catch (error) {
        console.error("Erreur dans /verify-age:", error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;