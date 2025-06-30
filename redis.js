const redis = require('redis');

const client = redis.createClient({
    url: process.env.REDIS_URL,
});

client.on('error', (err) => {
    console.error('Erreur Redis :', err);
});

const connectRedis = async () => {
    try {
        await client.connect();
        console.log('Redis connecté');
    } catch (error) {
        console.error('Erreur de connexion à Redis :', error);
    }
};

module.exports = { client, connectRedis };