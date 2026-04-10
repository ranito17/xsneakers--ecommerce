const app = require('./src/app');
const config = require('./src/config/config');

// Refuse to start in production without a real JWT secret
if (config.nodeEnv === 'production' && !config.jwtSecret) {
    console.error('FATAL: JWT_SECRET environment variable is not set. Refusing to start.');
    process.exit(1);
}

app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port} in ${config.nodeEnv} mode`);
});