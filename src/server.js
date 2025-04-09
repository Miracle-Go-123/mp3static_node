const express = require('express');
const cors = require('cors');
const streamRouter = require('./routes/stream');
const updateRouter = require('./routes/update');
const Config = require('./config');

const app = express();
let port = 3000;

// Middleware for parsing form data
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use('/stream', streamRouter);
app.use('/update', updateRouter);

async function initializeServer() {
    const config = await Config.load();
    
    // Update port if config has a different value
    if (config.port) {
        port = config.port;
    }

    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

initializeServer().catch(console.error);