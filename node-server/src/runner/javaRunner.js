const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const tmp = require('tmp-promise');

const executeJavaCode = async (code, input) => {
    const tmpDir = await tmp.dir();
    const sourcePath = path.join(tmpDir.path, 'Main.java');

    await fs.writeFile(sourcePath, code);

    return new Promise((resolve, reject) => {
        exec(`javac ${sourcePath}`, (compileErr, _, compileStderr) => {
            if (compileErr) {
                reject(new Error(compileStderr || compileErr.message));
                return;
            }

            const process = exec(`java -cp ${tmpDir.path} Main`, { timeout: 5000 }, (runErr, stdout, stderr) => {
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

module.exports = { executeJavaCode };
