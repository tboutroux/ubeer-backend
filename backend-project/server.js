const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const middleware = require('./middleware');
const userRoutes = require('./routes/user');
const beerRoutes = require('./routes/beer');
const breweryRoutes = require('./routes/brewery');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { auth } = require('express-openid-connect');


const config = {
    authRequired: false,
    auth0Logout: true,
    secret: 'a long, randomly-generated string stored in env',
    baseURL: 'http://localhost:3099',
    clientID: 'Re5b1kLFfjIrBjsBKL3RIxAE7l25Rsjn',
    issuerBaseURL: 'https://dev-dqgt7vf684gctqa2.us.auth0.com'
};

const app = express();
const PORT = process.env.PORT || 3099;

// Swagger setup
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Ubeers API',
            version: '1.0.0',
            description: 'API documentation for Ubeers'
        },
        servers: [
            {
                url: 'http://localhost:3099',
                description: 'Local server'
            }
        ]
    },
    apis: ['./routes/*.js']
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


// Middleware setup
app.use(bodyParser.json());
app.use(middleware);
app.use(auth(config));


// Routes setup
app.use('/users', userRoutes)
app.use('/beers', beerRoutes)
app.use('/breweries', breweryRoutes)

app.get('/', (req, res) => {
    res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
  });

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
