const { db } = require('./db'); // your existing db setup

const getProblemTestCases = async (problemId) => {
    const query = 'SELECT input, output FROM testcases WHERE problem_id = $1';
    const rows = await db.query(query, [problemId]);
    return rows.rows; // rows.rows because pg returns { rows: [...] }
};

module.exports = { getProblemTestCases };
