module.exports = {
    apps: [{
        name: 'mp3static_node',
        script: './src/server.js',
        watch: true,
        env: {
            NODE_ENV: 'development'
        },
        env_production: {
            NODE_ENV: 'production'
        }
    }]
}