const { getChannel } = require('../queue/channel');
const { queueName, responseQueueName } = require('../queue/queues');
const logger = require('../utils/logger');
const { getProblemTestCases } = require('../db/problems'); // New helper function
const { executePythonCode } = require('../runner/pythonRunner'); // New helper to run code

const startPythonWorker = async () => {
    const ch = await getChannel();
    
    await ch.consume(queueName.python, async (msg) => {
        try {
            const data = JSON.parse(msg.content.toString());
            logger.info(`[PythonWorker] Processing submission: ${data.userId}, Problem: ${data.problemId}`);

            const result = await processSubmission(data);

            // Send result to response queue
            await ch.sendToQueue(responseQueueName, Buffer.from(JSON.stringify(result)));

            ch.ack(msg);
            logger.info(`[PythonWorker] Successfully processed submission: ${data.userId}`);
        } catch (err) {
            logger.error(`[PythonWorker] Error processing submission: ${err.message}`);
            ch.nack(msg, false, false); // Discard the message
        }
    }, { noAck: false });
};

const processSubmission = async (data) => {
    const { code, problemId, userId } = data;

    // 1. Get test cases
    const testCases = await getProblemTestCases(problemId);
    if (!testCases || testCases.length === 0) {
        throw new Error("No test cases found for problem");
    }

    let allPassed = true;

    // 2. Run code for each test case
    for (const testCase of testCases) {
        const { input, expectedOutput } = testCase;

        const actualOutput = await executePythonCode(code, input);

        logger.info(`[PythonWorker] Expected: "${expectedOutput.trim()}", Got: "${actualOutput.trim()}"`);

        if (actualOutput.trim() !== expectedOutput.trim()) {
            allPassed = false;
            break;
        }
    }

    // 3. Final result
    const status = allPassed ? "Accepted" : "Wrong Answer";

    return {
        userId,
        problemId,
        status
    };
};

module.exports = { startPythonWorker };
