// This file exports middleware functions that can be used in the application, such as authentication or logging middleware.
module.exports = (req, res, next) => {
    console.log('Middleware exécuté');
    next();
};