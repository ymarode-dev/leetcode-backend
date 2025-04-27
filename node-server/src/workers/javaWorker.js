// src/workers/javaWorker.js
const { getChannel } = require('../queue/channel');
const { queueName } = require('../queue/queues');
const logger = require('../utils/logger');

const startJavaWorker = async () => {
    const ch = await getChannel();
    
    await ch.consume(queueName.java, async (msg) => {
        try {
            const data = JSON.parse(msg.content.toString());
            logger.info(`[JavaWorker] Processing submission: ${data.userId}`);

            await simulateExecution(data);

            ch.ack(msg);
            logger.info(`[JavaWorker] Successfully processed submission: ${data.userId}`);
        } catch (err) {
            logger.error(`[JavaWorker] Error processing submission: ${err.message}`);
            ch.nack(msg, false, false);
        }
    }, { noAck: false });
};

const simulateExecution = (data) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            logger.info(`[JavaWorker] Code execution done for ${data.userId}`);
            resolve();
        }, 2000);
    });
};

module.exports = { startJavaWorker };
