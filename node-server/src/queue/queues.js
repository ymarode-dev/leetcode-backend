// src/queue/queues.js
const queueName = {
    python: 'pythonQueue',
    js: 'jsQueue',
    java: 'javaQueue',
    cpp: 'cppQueue'
};

const responseQueueName = "submission-results";

module.exports = { queueName, responseQueueName };
