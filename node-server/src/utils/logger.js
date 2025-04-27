// src/utils/logger.js
const log = (level, message, ...args) => {
    console.log(`[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}`, ...args);
};

module.exports = {
    info: (msg, ...args) => log('info', msg, ...args),
    warn: (msg, ...args) => log('warn', msg, ...args),
    error: (msg, ...args) => log('error', msg, ...args),
};
