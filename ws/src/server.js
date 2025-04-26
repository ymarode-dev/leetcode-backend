const WebSocket = require('ws');
const amqp = require('amqplib/callback_api');
const jwt = require('jsonwebtoken');
const server = new WebSocket.Server({ port: 1995 });

const queueName = {
    python: 'pythonQueue',
    js: 'jsQueue',
    java: 'javaQueue',
    cpp: 'cppQueue'
}

const JWT_SECRET = 'supersecret'; // Use the same secret key as Flask app

let channelInstance = null;

// Connect to RabbitMQ
amqp.connect('amqp://localhost', (err, conn) => {
    if (err) {
        console.error('Error connecting to RabbitMQ:', err);
        process.exit(1);
    }

    conn.createChannel((err, ch) => {
        if (err) {
            console.error('Error creating channel:', err);
            process.exit(1);
        }

        // Create queues
        for (let key in queueName) {
            ch.assertQueue(queueName[key], { durable: true });
        }
        channelInstance = ch;

        // WebSocket connection handling
        server.on('connection', (ws) => {
            console.log('Client Connected');
            
            ws.on('message', (message) => {
                console.log('Received message:', message);
                requestInvoker(message, ws);
            });

            ws.on('close', () => {
                console.log('Client disconnected');
            });
        });
    });
});

// Function to handle the incoming WebSocket message
const requestInvoker = (message, ws) => {
    let messageObj = null;
    try {
        messageObj = JSON.parse(message);
    } catch (err) {
        console.error('Error parsing message:', err);
        ws.send(JSON.stringify({ error: 'Invalid JSON format' }));
        return;
    }

    const { type, language, payload, token } = messageObj;

    // Check if token is provided
    if (!token) {
        console.log('Token missing');
        ws.send(JSON.stringify({ error: 'Token missing' }));
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Authenticated user:', decoded);

        if (type === 'submit') {
            addSubmissionToQueue(payload, language, decoded);
            ws.send(JSON.stringify({ success: 'Submission added to queue' }));
        } else {
            console.log('Invalid request type');
            ws.send(JSON.stringify({ error: 'Invalid request type' }));
        }
    } catch (err) {
        console.error('Invalid token:', err.message);
        ws.send(JSON.stringify({ error: 'Invalid token' }));
    }
}

const addSubmissionToQueue = (payload, submissionLanguage, user) => {
    try {
        if (!queueName.hasOwnProperty(submissionLanguage)) {
            console.error('Invalid submission language');
            return;
        }

        const payloadWithUser = {
            ...payload,
            userId: user.sub 
        };

        console.log('queueName:', queueName[submissionLanguage]);
        channelInstance.sendToQueue(
            queueName[submissionLanguage],
            Buffer.from(JSON.stringify(payloadWithUser)),
            { persistent: true }
        );
        console.log('Submission added to queue');
    } catch (err) {
        console.error('Error adding submission to queue:', err);
    }
}
