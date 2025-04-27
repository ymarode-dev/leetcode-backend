// src/config/index.js
require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 1967,
    RABBITMQ_URL: process.env.RABBITMQ_URL || 'amqp://localhost',
    JWT_SECRET: process.env.JWT_SECRET || 'supersecret',
};
