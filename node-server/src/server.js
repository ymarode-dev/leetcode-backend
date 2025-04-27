// src/server.js
const WebSocket = require('ws');
const { getChannel } = require('./queue/channel');
const { queueName } = require('./queue/queues');
const { verifyToken } = require('./auth/jwt');
const logger = require('./utils/logger');
const { safeJsonParse } = require('./utils/safeJson');
const { PORT } = require('./config');

const startWebSocketServer = (port = PORT) => {
    const server = new WebSocket.Server({ port });

    server.on('connection', (ws) => {
        logger.info('WebSocket client connected');

        ws.on('message', (message) => {
            handleIncomingMessage(message, ws);
        });

        ws.on('close', () => {
            logger.info('WebSocket client disconnected');
        });
    });

    logger.info(`WebSocket Server started on port ${port}`);
};

const handleIncomingMessage = async (message, ws) => {
    const messageObj = safeJsonParse(message);

    if (!messageObj) {
        ws.send(JSON.stringify({ error: 'Invalid JSON format' }));
        return;
    }

    const { type, language, payload, token } = messageObj;

    if (!token) {
        ws.send(JSON.stringify({ error: 'Token missing' }));
        return;
    }

    try {
        const decoded = verifyToken(token);

        if (type === 'submit') {
            await addSubmissionToQueue(payload, language, decoded.sub);
            ws.send(JSON.stringify({ success: 'Submission queued' }));
        } else {
            ws.send(JSON.stringify({ error: 'Invalid request type' }));
        }
    } catch (err) {
        logger.error('Token verification failed:', err.message);
        ws.send(JSON.stringify({ error: 'Invalid token' }));
    }
};

const addSubmissionToQueue = async (payload, submissionLanguage, userId) => {
    const ch = await getChannel();

    if (!queueName.hasOwnProperty(submissionLanguage)) {
        throw new Error('Invalid submission language');
    }

    const messagePayload = { ...payload, userId };

    await ch.sendToQueue(
        queueName[submissionLanguage],
        Buffer.from(JSON.stringify(messagePayload)),
        { persistent: true }
    );

    logger.info(`Submission queued for ${submissionLanguage}`);
};

module.exports = { startWebSocketServer };
