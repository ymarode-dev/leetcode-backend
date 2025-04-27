// src/workers/jsWorker.js
const { getChannel } = require('../queue/channel');
const { queueName } = require('../queue/queues');
const logger = require('../utils/logger');

const startJsWorker = async () => {
    const ch = await getChannel();
    
    await ch.consume(queueName.js, async (msg) => {
        try {
            const data = JSON.parse(msg.content.toString());
            logger.info(`[JsWorker] Processing submission: ${data.userId}`);

            await simulateExecution(data);

            ch.ack(msg);
            logger.info(`[JsWorker] Successfully processed submission: ${data.userId}`);
        } catch (err) {
            logger.error(`[JsWorker] Error processing submission: ${err.message}`);
            ch.nack(msg, false, false);
        }
    }, { noAck: false });
};

const simulateExecution = (data) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            logger.info(`[JsWorker] Code execution done for ${data.userId}`);
            resolve();
        }, 2000);
    });
};

module.exports = { startJsWorker };
