const express = require('express');
const bodyParser = require('body-parser');
const middleware = require('./middleware');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3099;

// Middleware setup
app.use(bodyParser.json());
app.use(middleware);

// Routes setup
app.use('/api', routes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});