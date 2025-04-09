const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const Config = require('../config');

router.get('/', async (req, res) => {
    try {
        const config = await Config.load();
        if (!config.streamUrl) {
            return res.status(404).json({
                result: false,
                message: "Stream URL not found."
            });
        }

        // Set headers
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Fetch the stream with icy metadata
        const response = await fetch(config.streamUrl, {
            headers: { 'Icy-MetaData': '1' }
        });

        console.log({
            'icy-br': response.headers.get('icy-br') || '',
            'ice-audio-info': response.headers.get('ice-audio-info') || '',
            'icy-name': response.headers.get('icy-name') || '',
            'icy-pub': response.headers.get('icy-pub') || '',
            'icy-metaint': response.headers.get('icy-metaint') || '',
        });

        // Pipe the response directly to the client
        response.body.pipe(res);

        // Handle client disconnect
        req.on('close', () => {
            response.body.destroy();
        });

    } catch (error) {
        console.error('Error streaming audio:', error);
        res.status(500).json({
            result: false,
            message: error.message
        });
    }
});

module.exports = router;