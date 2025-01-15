require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
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

// Récupération de l'environnement
const environnement = process.env.ENVIRONMENT
let SERVER = '';

if (environnement === 'development') {
    SERVER = 'localhost';
} else {
    SERVER = 'ubeer-backend.onrender.com';
}

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: ['https://ubeers.netlify.app', 'https://ubeer-backend.onrender.com', 'http://localhost:4200'],
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
const allowedOrigins = ['https://ubeers.netlify.app', 'http://localhost:4200', 'https://ubeer-backend.onrender.com'];

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
app.use('/pictures', picturesRoutes);

// app.get('/', (req, res) => {
//     res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
// });

// Configuration Socket.IO
io.on('connection', (socket) => {
    console.log('Un utilisateur est connecté.');

    socket.on('getBreweries', async () => {
        try {
            let breweries = await fetch(`http://${SERVER}:${PORT}/breweries`).then(response => response.json());
            
            // On recherche les images de profil et de bannière pour chaque brasserie
            for (let brewery of breweries) {
                const profilePicture = await fetch(`http://${SERVER}:${PORT}/pictures/${brewery.profile_picture_id}`)
                .then(response => {
                    return response.json();
                })
                .catch(error => console.error('Erreur lors de la récupération de l\'image de profil :', error));

                const bannerPicture = await fetch(`http://${SERVER}:${PORT}/pictures/${brewery.banner_picture_id}`)
                .then(response => {
                    return response.json();
                })
                .catch(error => console.error('Erreur lors de la récupération de l\'image de bannière :', error));

                brewery.profile_picture_url = profilePicture.data;
                brewery.banner_picture_url = bannerPicture.data;
            }
            
            socket.emit('breweries', breweries); // Envoie des données au client
        } catch (error) {
            console.error('Erreur lors de la récupération des brasseries :', error);
        }
    });

    // Récupérer les détails d'une brasserie par ID
    socket.on('getBreweryById', async (id) => {
        try {
            const response = await fetch(`http://${SERVER}:${PORT}/breweries/${id}`);

            // Vérifier si la réponse a un statut OK (200)
            if (!response.ok) {
                throw new Error(`Erreur de récupération des détails : ${response.statusText}`);
            }
    
            const brewery = await response.json();
    
            if (!brewery) {
                throw new Error('La brasserie est introuvable ou la réponse est vide');
            }
    
            // Recherche des images de profil et de bannière
            const profilePicture = await fetch(`http://${SERVER}:${PORT}/pictures/${brewery.profile_picture_id}`).then(res => res.json());
            const bannerPicture = await fetch(`http://${SERVER}:${PORT}/pictures/${brewery.banner_picture_id}`).then(res => res.json());
    
            brewery.profile_picture_url = profilePicture.data;
            brewery.banner_picture_url = bannerPicture.data;
    
            socket.emit('breweryDetails', brewery); // Envoie des détails de la brasserie
        } catch (error) {
            console.error('Erreur lors de la récupération des détails de la brasserie:', error);
            socket.emit('error', { message: error.message });
        }
    });

    // Suppression d'une brasserie
    socket.on('deleteBrewery', async (id) => {
        try {
            console.log('Suppression de la brasserie avec l\'ID:', id);
            const response = await fetch(`http://${SERVER}:${PORT}/breweries/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`Erreur lors de la suppression : ${response.statusText}`);
            }

            const result = await response.json();
            socket.emit('breweryDeleted', { id: result.id }); // Émettre un événement pour signaler que la brasserie a été supprimée
        } catch (error) {
            console.error('Erreur lors de la suppression de la brasserie:', error);
            socket.emit('error', { message: error.message });
        }
    });

    socket.on('disconnect', () => {
        console.log('Un utilisateur s\'est déconnecté.');
    });
});

// Démarrer le serveur HTTP et Socket.IO
server.listen(PORT, () => {
    console.log(`Server is running on http://${SERVER}:${PORT}`);
});
