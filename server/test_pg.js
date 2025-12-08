const path = require('path');
const envPath = path.join(__dirname, '.env');
const fs = require('fs');
const log = (msg) => {
    console.error(msg);
    fs.appendFileSync('debug_log.txt', msg + '\n');
};

log('LOG: Loading env from: ' + envPath);
require('dotenv').config({ path: envPath });

if (process.env.DATABASE_URL) {
    // Aggressively strip quotes
    let url = process.env.DATABASE_URL.trim().replace(/^['"]+|['"]+$/g, '');
    process.env.DATABASE_URL = url;

    log('LOG: Cleaned DATABASE_URL (JSON): ' + JSON.stringify(process.env.DATABASE_URL));
    log('LOG: First 5 chars: ' + process.env.DATABASE_URL.substring(0, 5));
    log('LOG: Last 5 chars: ' + process.env.DATABASE_URL.substring(process.env.DATABASE_URL.length - 5));
} else {
    try {
        const raw = fs.readFileSync(envPath, 'utf8');
        log('LOG: .env size: ' + raw.length);
        log('LOG: Has DATABASE_URL=? ' + raw.includes('DATABASE_URL='));
        log('LOG: First 20 chars: ' + raw.substring(0, 20).replace(/\r/g, '\\r').replace(/\n/g, '\\n'));
    } catch (e) {
        log('LOG: Error reading .env raw: ' + e.message);
    }
}

try {
    const sequelize = require('./database');
    log('LOG: Database Loaded.');
    if (sequelize) {
        log('LOG: Sequelize Dialect: ' + sequelize.getDialect());
        sequelize.authenticate()
            .then(() => log('LOG: Connection OK!'))
            .catch(err => log('LOG: Connection Failed: ' + err.message));
    } else {
        log('LOG: require("./database") returned undefined??');
    }
} catch (e) {
    log('LOG: Error requiring database: ' + e.stack);
}
log('LOG: DONE');
