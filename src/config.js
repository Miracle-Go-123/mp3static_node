const fs = require('fs').promises;
const path = require('path');

class Config {
    constructor(jsonData) {
        if (jsonData) {
            this.port = jsonData.port ?? 3000;
            this.streamUrl = jsonData.streamUrl ?? '';
            this.admin = jsonData.admin ?? { id: '', password: '' };
        }
    }

    static async load() {
        try {
            const configPath = path.join(__dirname, '../config.json');
            const data = await fs.readFile(configPath, 'utf8');
            const json = JSON.parse(data);
            return new Config(json);
        } catch (error) {
            return new Config(null);
        }
    }

    static async save(config) {
        const configPath = path.join(__dirname, '../config.json');
        await fs.writeFile(configPath, JSON.stringify(config));
    }
}

module.exports = Config;