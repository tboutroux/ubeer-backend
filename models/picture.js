require('dotenv').config();
const pool = require('../db');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const os = require('os');

const Picture = {
    getAll: callback => {
        const query = 'SELECT * FROM picture';
        pool.query(query, (err, results) => {
            if (err) {
                console.error('Error getting pictures:', err);
                return callback(err);
            }
            const pictures = results.map(picture => {
                try {
                    const baseUrl = 'https://drive.google.com/thumbnail?id=';
                
                    // Vérifie si l'URL correspond au format "/d/<fileId>/"
                    if (picture.data.includes('/d/')) {
                        const fileId = picture.data.split('/d/')[1].split('/')[0];
                        picture.url = `${baseUrl}${fileId}`;
                    }
                    // Vérifie si l'URL correspond au format "https://drive.google.com/uc?id=<fileId>"
                    else if (picture.data.includes('uc?id=')) {
                        const fileId = picture.data.split('uc?id=')[1].split('&')[0]; // Pour éviter les paramètres supplémentaires
                        picture.url = `${baseUrl}${fileId}`;
                    }
                    // Gère les autres formats inattendus
                    else {
                        console.warn('Unrecognized Google Drive URL format:', picture.data);
                        picture.url = picture.data; // Utilise l'URL d'origine comme fallback
                    }
                } catch (error) {
                    console.error('Error getting picture URL:', error);
                    picture.url = null; // Met l'URL à null si une erreur survient
                }
                
                return picture;
            });
            callback(null, pictures);
        });
    },
    getOne: (id, callback) => {
        const query = 'SELECT * FROM picture WHERE id = ?';
        pool.query(query, [id], (err, results) => {
            if (err) {
                return callback(err);
            }
            if (results.length > 0) {
                const picture = results[0];
                try {
                    const baseUrl = 'https://drive.google.com/thumbnail?id=';
                
                    // Vérifie si l'URL correspond au format "/d/<fileId>/"
                    if (picture.data.includes('/d/')) {
                        const fileId = picture.data.split('/d/')[1].split('/')[0];
                        picture.url = `${baseUrl}${fileId}`;
                    }
                    // Vérifie si l'URL correspond au format "https://drive.google.com/uc?id=<fileId>"
                    else if (picture.data.includes('uc?id=')) {
                        const fileId = picture.data.split('uc?id=')[1].split('&')[0]; // Pour éviter les paramètres supplémentaires
                        picture.url = `${baseUrl}${fileId}`;
                    }
                    // Gère les autres formats inattendus
                    else {
                        console.warn('Unrecognized Google Drive URL format:', picture.data);
                        picture.url = picture.data; // Utilise l'URL d'origine comme fallback
                    }
                } catch (error) {
                    console.error('Error getting picture URL:', error);
                    picture.url = null; // Met l'URL à null si une erreur survient
                }

                console.log(picture.url);
                callback(null, { data: picture.url }); // Inclure une réponse cohérente
            } else {
                callback(null, { data: null }); // Répondre avec un objet vide si aucune donnée n'est trouvée
            }
            
        });
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

            console.log('File uploaded:', response.data.id);
    
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
            console.error('Error uploading file:', error);
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