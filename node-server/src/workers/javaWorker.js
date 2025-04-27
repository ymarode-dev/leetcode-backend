const { getChannel } = require('../queue/channel');
const { queueName, responseQueueName } = require('../queue/queues');
const logger = require('../utils/logger');
const { getProblemTestCases } = require('../db/problems');
const { executeJavaCode } = require('../runner/javaRunner'); // New

const startJavaWorker = async () => {
    const ch = await getChannel();
    
    await ch.consume(queueName.java, async (msg) => {
        try {
            const data = JSON.parse(msg.content.toString());
            logger.info(`[JavaWorker] Processing submission: ${data.userId}, Problem: ${data.problemId}`);

            const result = await processSubmission(data);

            await ch.sendToQueue(responseQueueName, Buffer.from(JSON.stringify(result)));

            ch.ack(msg);
            logger.info(`[JavaWorker] Successfully processed submission: ${data.userId}`);
        } catch (err) {
            logger.error(`[JavaWorker] Error processing submission: ${err.message}`);
            ch.nack(msg, false, false);
        }
    }, { noAck: false });
};

const processSubmission = async (data) => {
    const { code, problemId, userId } = data;

    const testCases = await getProblemTestCases(problemId);
    if (!testCases || testCases.length === 0) {
        throw new Error("No test cases found for problem");
    }

    let allPassed = true;

    for (const testCase of testCases) {
        const { input, expectedOutput } = testCase;

        const actualOutput = await executeJavaCode(code, input);

        logger.info(`[JavaWorker] Expected: "${expectedOutput.trim()}", Got: "${actualOutput.trim()}"`);

        if (actualOutput.trim() !== expectedOutput.trim()) {
            allPassed = false;
            break;
        }
    }

    const status = allPassed ? "Accepted" : "Wrong Answer";

    return { userId, problemId, status };
};

module.exports = { startJavaWorker };
