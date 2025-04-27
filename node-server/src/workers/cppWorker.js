// src/workers/cppWorker.js
const { getChannel } = require('../queue/channel');
const { queueName } = require('../queue/queues');
const logger = require('../utils/logger');

const startCppWorker = async () => {
    const ch = await getChannel();
    
    await ch.consume(queueName.cpp, async (msg) => {
        try {
            const data = JSON.parse(msg.content.toString());
            logger.info(`[CppWorker] Processing submission: ${data.userId}`);

            await simulateExecution(data);

            ch.ack(msg);
            logger.info(`[CppWorker] Successfully processed submission: ${data.userId}`);
        } catch (err) {
            logger.error(`[CppWorker] Error processing submission: ${err.message}`);
            ch.nack(msg, false, false);
        }
    }, { noAck: false });
};

const simulateExecution = (data) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            logger.info(`[CppWorker] Code execution done for ${data.userId}`);
            resolve();
        }, 2000);
    });
};

module.exports = { startCppWorker };
