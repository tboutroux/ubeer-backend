require('dotenv').config();
const pool = require('../db');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const os = require('os');

const Picture = {
    getAll: callback => {
        const query = 'SELECT * FROM picture';
        pool.query(query, callback);
    },
    create: async (data, callback) => {
        const { file } = data;
    
        // Google Drive config
        const auth = new google.auth.GoogleAuth({
            keyFile: 'google-credentials.json',
            scopes: 'https://www.googleapis.com/auth/drive'
        });
    
        const drive = google.drive({ version: 'v3', auth });
    
        // Créer un fichier temporaire
        const tempFilePath = path.join(os.tmpdir(), file.originalname);
        fs.writeFileSync(tempFilePath, file.buffer);
    
        const fileMetadata = {
            name: file.originalname,
            parents: [process.env.GOOGLE_DRIVE_FOLDER_ID] // Doit être un tableau
        };
    
        const media = {
            mimeType: file.mimetype,
            body: fs.createReadStream(tempFilePath)
        };
    
        try {
            const response = await drive.files.create({
                resource: fileMetadata,
                media: media,
                fields: 'id'
            });
    
            const fileId = response.data.id;
            const fileUrl = `https://drive.google.com/uc?id=${fileId}`;
    
            // Insérer l'URL dans la base de données
            const query = 'INSERT INTO picture (data) VALUES (?)';
            pool.query(query, [fileUrl], (err, results) => {
                // Supprimer le fichier temporaire après usage
                fs.unlinkSync(tempFilePath);
    
                if (err) {
                    return callback(err);
                }
                callback(null, results.insertId);
            });
        } catch (error) {
            // Supprimer le fichier temporaire même en cas d'erreur
            fs.unlinkSync(tempFilePath);
            callback(error);
        }
    },
    update: (id, data, callback) => {
        const query = 'UPDATE picture SET url = ? WHERE id = ?';
        pool.query(query, [data.url, id], callback);
    },
    delete: (id, callback) => {
        const query = 'DELETE FROM picture WHERE id = ?';
        pool.query(query, [id], callback);
    }
};

module.exports = Picture;