const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const middleware = require('./middleware');
const userRoutes = require('./routes/user');
const beerRoutes = require('./routes/beer');
const breweryRoutes = require('./routes/brewery');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');
const { auth } = require('express-openid-connect');

const app = express();
const PORT = process.env.PORT || 3100;

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
        credentials: true
    }
});

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
                url: `http://localhost:${PORT}`,
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

const allowedOrigins = ['http://localhost:4200', 'https://angular-terry-barillon.vercel.app'];
app.use(cors({
    origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
    }
    return callback(null, true);
    },
    credentials: true
}));

app.use(middleware);


// Routes setup
app.use('/users', userRoutes)
app.use('/beers', beerRoutes)
app.use('/breweries', breweryRoutes)

app.get('/', (req, res) => {
    res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});

// Configuration Socket.IO
io.on('connection', (socket) => {
    console.log('Un utilisateur est connecté.');

    // Réponse à l'événement "getBreweries"
    socket.on('getBreweries', async () => {
            
        let breweries = await fetch(`http://localhost:${PORT}/breweries`).then(response => response.json());

        console.log(breweries)

        socket.emit('breweries', breweries); // Envoie des données au client
    });

    socket.on('disconnect', () => {
        console.log('Un utilisateur s\'est déconnecté.');
    });
});

// Démarrer le serveur HTTP et Socket.IO
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});