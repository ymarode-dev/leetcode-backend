// src/utils/safeJson.js
const safeJsonParse = (str) => {
    try {
        return JSON.parse(str);
    } catch {
        return null;
    }
};

module.exports = { safeJsonParse };
