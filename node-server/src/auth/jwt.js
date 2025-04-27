// src/auth/jwt.js
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const logger = require('../utils/logger');

const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        logger.error('[JWT] Verification failed:', err.message);
        throw err;
    }
};

const signToken = (payload, expiresIn = '1h') => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

module.exports = {
    verifyToken,
    signToken
};
