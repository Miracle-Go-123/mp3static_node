const express = require('express');
const router = express.Router();
const Config = require('../config');
const path = require('path');

// GET request to render update form
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/update.html'));
});

// POST request to handle configuration updates
router.post('/', async (req, res) => {
    try {
        // Parse form data
        const formData = new URLSearchParams(req.body);
        const id = formData.get('id');
        const pwd = formData.get('pwd');
        const newStreamUrl = formData.get('newStreamUrl');

        // Load current config
        const config = await Config.load();

        // Validate id and pwd
        if (id !== config.admin.id || pwd !== config.admin.password) {
            return res.status(401).send("Invalid ID or password.");
        }

        // Update config with new values
        const updatedConfig = {
            port: config.port,
            streamUrl: newStreamUrl,
            admin: {
                id: config.admin.id,
                password: config.admin.password
            }
        };

        // Save updated config
        await Config.save(updatedConfig);

        res.send("A new stream URL updated successfully");
    } catch (error) {
        console.error('Error updating stream URL:', error);
        res.status(500).send("Error updating a new stream URL");
    }
});

module.exports = router;