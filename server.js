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
const PORT = process.env.SERV_PORT || 3099;

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: ['https://ubeers.netlify.app', 'https://ubeer-backend.onrender.com/api-docs/#/', 'http://localhost:4200'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type'],
        credentials: true
    }
});

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
            },
            {
                url: 'https://ubeer-backend.onrender.com',
                description: 'Production server'
            }
        ]
    },
    apis: ['./routes/*.js']
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middleware setup
app.use(bodyParser.json());
const allowedOrigins = ['https://ubeers.netlify.app', 'http://localhost:4200', 'https://ubeer-backend.onrender.com/api-docs/#/'];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS blocked for origin: ${origin}`));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};
app.use(cors(corsOptions));


app.use((err, req, res, next) => {
    if (err) {
        console.error('CORS error:', err.message);
        return res.status(500).json({ message: 'CORS error: ' + err.message });
    }
    next();
});

app.use(middleware);

// Routes setup
app.use('/users', userRoutes);
app.use('/beers', beerRoutes);
app.use('/breweries', breweryRoutes);

// app.get('/', (req, res) => {
//     res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
// });

// Configuration Socket.IO
io.on('connection', (socket) => {
    console.log('Un utilisateur est connecté.');

    socket.on('getBreweries', async () => {
        try {
            let breweries = await fetch(`http://localhost:${PORT}/breweries`).then(response => response.json());
            console.log(breweries);
            socket.emit('breweries', breweries); // Envoie des données au client
        } catch (error) {
            console.error('Erreur lors de la récupération des brasseries :', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('Un utilisateur s\'est déconnecté.');
    });
});

// Démarrer le serveur HTTP et Socket.IO
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
