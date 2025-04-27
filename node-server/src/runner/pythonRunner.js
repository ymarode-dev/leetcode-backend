const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const tmp = require('tmp-promise');

const executePythonCode = async (code, input) => {
    const tmpFile = await tmp.file({ postfix: '.py' });
    await fs.writeFile(tmpFile.path, code);

    return new Promise((resolve, reject) => {
        const process = exec(`python3 ${tmpFile.path}`, { timeout: 5000 }, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(stderr || error.message));
            } else {
                resolve(stdout);
            }
        });

        if (process.stdin) {
            process.stdin.write(input);
            process.stdin.end();
        }
    });
};

module.exports = { executePythonCode };
