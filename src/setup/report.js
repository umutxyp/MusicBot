'use strict';

/**
 * Startup checklist output. Uses only Node built-ins: it must work before npm packages exist.
 */
const color = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code, text) => (color ? `\x1b[${code}m${text}\x1b[0m` : text);

const report = {
    title(text) {
        console.log(`\n${paint('1', text)}\n`);
    },
    ok(label, detail = '') {
        console.log(`  ${paint('32', '[ OK ]')} ${label}${detail ? paint('90', `  ${detail}`) : ''}`);
    },
    info(label, detail = '') {
        console.log(`  ${paint('36', '[INFO]')} ${label}${detail ? paint('90', `  ${detail}`) : ''}`);
    },
    warn(label, lines = []) {
        console.log(`  ${paint('33', '[WARN]')} ${label}`);
        for (const line of [].concat(lines)) console.log(`         ${line}`);
    },
    fail(label, lines = []) {
        console.log(`  ${paint('31', '[FAIL]')} ${paint('1', label)}`);
        for (const line of [].concat(lines)) console.log(`         ${line}`);
    },
    /**
     * Print why the bot cannot start and how to fix it, then exit.
     */
    stop(problems) {
        console.log(`\n${paint('31;1', `The bot was not started: ${problems} problem(s) above must be fixed first.`)}`);
        console.log('Fix them and start the bot again. Every step is also explained in README.md.\n');
        process.exit(1);
    },
};

module.exports = report;
