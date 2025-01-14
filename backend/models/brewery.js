const pool = require('../db');
const pictureModel = require('../models/picture');

const Brewery = {
    getAll: callback => {
        // Requête pour récupérer les brasseries
        const queryBrewery = 'SELECT id, name, address, profile_picture_id, banner_picture_id FROM brewery';
        
        pool.query(queryBrewery, (err, breweryResults) => {
            if (err) {
                return callback(err, null);
            }
    
            // Pour chaque brasserie, récupérez les images associées (profil et bannière)
            const breweriesWithImages = [];
            
            breweryResults.forEach(brewery => {
                // Récupérer l'image de profil
                const queryProfilePicture = `SELECT data FROM picture WHERE id = ${brewery.profile_picture_id}`;
                pool.query(queryProfilePicture, (err, profilePictureResults) => {
                    if (err) {
                        return callback(err, null);
                    }
                    const profilePictureUrl = profilePictureResults.length > 0 ? profilePictureResults[0].url : null;
    
                    // Récupérer l'image de la bannière
                    const queryBannerPicture = `SELECT data FROM picture WHERE id = ${brewery.banner_picture_id}`;
                    pool.query(queryBannerPicture, (err, bannerPictureResults) => {
                        if (err) {
                            return callback(err, null);
                        }
                        const bannerPictureUrl = bannerPictureResults.length > 0 ? bannerPictureResults[0].url : null;
    
                        // Ajouter les informations de la brasserie avec les URLs des images
                        breweriesWithImages.push({
                            ...brewery,
                            profile_picture_url: profilePictureUrl,
                            banner_picture_url: bannerPictureUrl
                        });
    
                        // Lorsque toutes les brasseries ont été traitées, retournez les résultats
                        if (breweriesWithImages.length === breweryResults.length) {
                            callback(null, breweriesWithImages);
                        }
                    });
                });
            });

            console.log(breweriesWithImages)
        });
    },
    create: (data, callback) => {

        // On ajoute les images dans la table picture
        pictureModel.create({ 
            req: data.req, 
            res: data.res, 
            file: data.profile_picture_id[0] 
        }, (err, profile_picture_id) => {
            if (err) {
                return callback(err);
            }
            pictureModel.create({ 
                req: data.req, 
                res: data.res, 
                file: data.banner_picture_id[0] 
            }, (err, banner_picture_id) => {
                if (err) {
                    return callback(err);
                }

                data.profile_picture_id = profile_picture_id;
                data.banner_picture_id = banner_picture_id;

                // On ajoute la brasserie dans la table brewery
                const query = 'INSERT INTO brewery (name, address, profile_picture_id, banner_picture_id) VALUES (?, ?, ?, ?)';
                pool.query(query, [data.name, data.address, data.profile_picture_id, data.banner_picture_id], callback);
            });
        });
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