// src/workers/pythonWorker.js
const { getChannel } = require('../queue/channel');
const { queueName } = require('../queue/queues');
const logger = require('../utils/logger');

const startPythonWorker = async () => {
    const ch = await getChannel();
    
    await ch.consume(queueName.python, async (msg) => {
        try {
            const data = JSON.parse(msg.content.toString());
            logger.info(`[PythonWorker] Processing submission: ${data.userId}`);

            // Simulate code execution
            await simulateExecution(data);

            ch.ack(msg);
            logger.info(`[PythonWorker] Successfully processed submission: ${data.userId}`);
        } catch (err) {
            logger.error(`[PythonWorker] Error processing submission: ${err.message}`);
            ch.nack(msg, false, false); // Discard the message
        }
    }, { noAck: false });
};

const simulateExecution = (data) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            logger.info(`[PythonWorker] Code execution done for ${data.userId}`);
            resolve();
        }, 2000); // simulate 2 second execution
    });
};

module.exports = { startPythonWorker };
