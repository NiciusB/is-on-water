module.exports = {
    apps: [
        {
            name: 'is-on-water',
            script: './dist/index.js',
            interpreter_args: '--enable-source-maps -r require-esm-deasync',
            wait_ready: true,
            kill_timeout: 10000,
        },
    ],
}