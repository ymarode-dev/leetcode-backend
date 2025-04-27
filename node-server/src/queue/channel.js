// src/queue/channel.js
const amqp = require('amqplib');
const { RABBITMQ_URL } = require('../config');
const logger = require('../utils/logger');

let connection = null;
let channel = null;

const connectRabbitMQ = async () => {
    if (connection && channel) return { connection, channel };

    try {
        connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        logger.info('[RabbitMQ] Connected');

        connection.on('error', (err) => {
            logger.error('[RabbitMQ] Connection error:', err.message);
        });
        connection.on('close', () => {
            logger.error('[RabbitMQ] Connection closed. Attempting reconnect...');
            setTimeout(connectRabbitMQ, 5000);
        });

        return { connection, channel };
    } catch (err) {
        logger.error('[RabbitMQ] Initial connection failed:', err.message);
        process.exit(1);
    }
};

const getChannel = async () => {
    if (!channel) {
        await connectRabbitMQ();
    }
    return channel;
};

module.exports = { connectRabbitMQ, getChannel };
