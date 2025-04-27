const WebSocket = require('ws');
const { getChannel } = require('./queue/channel');
const { queueName, responseQueueName } = require('./queue/queues');
const { verifyToken } = require('./auth/jwt');
const logger = require('./utils/logger');
const { safeJsonParse } = require('./utils/safeJson');
const { PORT } = require('./config');
const { updateSubmissionStatus } = require('./db/submissions'); // Add this

const clients = new Map(); // Map to track userId -> websocket connection

const startWebSocketServer = async (port = PORT) => {
    const server = new WebSocket.Server({ port });

    server.on('connection', (ws) => {
        logger.info('WebSocket client connected');

        ws.on('message', (message) => {
            handleIncomingMessage(message, ws);
        });

        ws.on('close', () => {
            logger.info('WebSocket client disconnected');
            // Remove client from map on disconnect
            for (let [userId, clientWs] of clients.entries()) {
                if (clientWs === ws) {
                    clients.delete(userId);
                    break;
                }
            }
        });
    });

    logger.info(`WebSocket Server started on port ${port}`);

    // Start consuming results here
    await consumeSubmissionResults();
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
        const userId = decoded.sub;

        // Store connection
        clients.set(userId, ws);

        if (type === 'submit') {
            await addSubmissionToQueue(payload, language, userId);
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

// 🚀 New function to consume results and update DB
const consumeSubmissionResults = async () => {
    const ch = await getChannel();

    await ch.consume(responseQueueName, async (msg) => {
        try {
            const result = JSON.parse(msg.content.toString());
            const { userId, problemId, status } = result;

            logger.info(`[Server] Received result for user ${userId}: ${status}`);

            // Update the database
            await updateSubmissionStatus(userId, problemId, status);

            // Send real-time update to client
            const clientWs = clients.get(userId);
            if (clientWs && clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ type: 'submissionResult', status }));
            }

            ch.ack(msg);
        } catch (err) {
            logger.error(`[Server] Error handling submission result: ${err.message}`);
            ch.nack(msg, false, false); // discard the message
        }
    }, { noAck: false });

    logger.info(`[Server] Started consuming submission results`);
};

module.exports = { startWebSocketServer };
