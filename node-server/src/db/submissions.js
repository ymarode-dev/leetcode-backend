const { db } = require('./db'); // assuming you have db.js with Postgres pool

const updateSubmissionStatus = async (userId, problemId, status) => {
    const query = `
        INSERT INTO submissions (user_id, problem_id, status)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, problem_id)
        DO UPDATE SET status = EXCLUDED.status
    `;
    await db.query(query, [userId, problemId, status]);
};

module.exports = { updateSubmissionStatus };
