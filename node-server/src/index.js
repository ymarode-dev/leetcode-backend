// src/index.js
require('dotenv').config();
const { connectRabbitMQ } = require('./queue/channel');
const { startWebSocketServer } = require('./server');
const { startPythonWorker } = require('./workers/pythonWorker');
const { startJsWorker } = require('./workers/jsWorker');
const { startJavaWorker } = require('./workers/javaWorker');
const { startCppWorker } = require('./workers/cppWorker');
const logger = require('./utils/logger');

const startServer = async () => {
    try {
        await connectRabbitMQ();
        logger.info('Connected to RabbitMQ');

        startWebSocketServer();
        logger.info('WebSocket Server started');

        startPythonWorker();
        startJsWorker();
        startJavaWorker();
        startCppWorker();
        logger.info('All Workers started');
    } catch (err) {
        logger.error('Server startup error:', err);
        process.exit(1);
    }
};

startServer();
