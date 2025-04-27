const { getChannel } = require('../queue/channel');
const { queueName, responseQueueName } = require('../queue/queues');
const logger = require('../utils/logger');
const { getProblemTestCases } = require('../db/problems');
const { executeCppCode } = require('../runner/cppRunner'); // New

const startCppWorker = async () => {
    const ch = await getChannel();
    
    await ch.consume(queueName.cpp, async (msg) => {
        try {
            const data = JSON.parse(msg.content.toString());
            logger.info(`[CppWorker] Processing submission: ${data.userId}, Problem: ${data.problemId}`);

            const result = await processSubmission(data);

            await ch.sendToQueue(responseQueueName, Buffer.from(JSON.stringify(result)));

            ch.ack(msg);
            logger.info(`[CppWorker] Successfully processed submission: ${data.userId}`);
        } catch (err) {
            logger.error(`[CppWorker] Error processing submission: ${err.message}`);
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

        const actualOutput = await executeCppCode(code, input);

        logger.info(`[CppWorker] Expected: "${expectedOutput.trim()}", Got: "${actualOutput.trim()}"`);

        if (actualOutput.trim() !== expectedOutput.trim()) {
            allPassed = false;
            break;
        }
    }

    const status = allPassed ? "Accepted" : "Wrong Answer";

    return { userId, problemId, status };
};

module.exports = { startCppWorker };
