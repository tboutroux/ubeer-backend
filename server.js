const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const middleware = require('./middleware');
const userRoutes = require('./routes/user');
const beerRoutes = require('./routes/beer');
const breweryRoutes = require('./routes/brewery');
const picturesRoutes = require('./routes/picture');
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
        origin: ['http://localhost:4200', 'https://angular-terry-barillon.vercel.app', 'https://ubeer-backend.onrender.com'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
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
const allowedOrigins = ['http://localhost:4200', 'https://angular-terry-barillon.vercel.app', 'https://ubeer-backend.onrender.com'];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

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
app.use('/pictures', picturesRoutes);

app.get('/', (req, res) => {
    res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});

// Configuration Socket.IO
io.on('connection', (socket) => {
    console.log('Un utilisateur est connecté.');

    socket.on('getBreweries', async () => {
        try {
            let breweries = await fetch(`http://localhost:${PORT}/breweries`).then(response => response.json());
            
            // On recherche les images de profil et de bannière pour chaque brasserie
            for (let brewery of breweries) {
                const profilePicture = await fetch(`http://localhost:${PORT}/pictures/${brewery.profile_picture_id}`)
                .then(response => {
                    return response.json();
                })
                .catch(error => console.error('Erreur lors de la récupération de l\'image de profil :', error));

                const bannerPicture = await fetch(`http://localhost:${PORT}/pictures/${brewery.banner_picture_id}`)
                .then(response => {
                    return response.json();
                })
                .catch(error => console.error('Erreur lors de la récupération de l\'image de bannière :', error));

                brewery.profile_picture_url = profilePicture.data;
                brewery.banner_picture_url = bannerPicture.data;
            }
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
