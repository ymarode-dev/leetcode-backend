const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const tmp = require('tmp-promise');

const executeCppCode = async (code, input) => {
    const tmpDir = await tmp.dir();
    const sourcePath = path.join(tmpDir.path, 'code.cpp');
    const outputPath = path.join(tmpDir.path, 'code.out');

    await fs.writeFile(sourcePath, code);

    return new Promise((resolve, reject) => {
        exec(`g++ ${sourcePath} -o ${outputPath}`, (compileErr, _, compileStderr) => {
            if (compileErr) {
                reject(new Error(compileStderr || compileErr.message));
                return;
            }

            const process = exec(`${outputPath}`, { timeout: 5000 }, (runErr, stdout, stderr) => {
                if (runErr) {
                    reject(new Error(stderr || runErr.message));
                } else {
                    resolve(stdout);
                }
            });

            if (process.stdin) {
                process.stdin.write(input);
                process.stdin.end();
            }
        });
    });
};

module.exports = { executeCppCode };
