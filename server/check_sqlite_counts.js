const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const files = ['database.sqlite', 'database_v2.sqlite'];

files.forEach(file => {
    const dbPath = path.join(__dirname, file);
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.error(`Error opening ${file}:`, err.message);
            return;
        }
    });

    console.log(`--- Checking ${file} ---`);
    const tables = ['Users', 'Professionals', 'Services', 'Products', 'Sales', 'Transactions', 'VaultTransactions'];

    tables.forEach(table => {
        db.get(`SELECT count(*) as count FROM ${table}`, (err, row) => {
            if (err) {
                console.log(`${file} [${table}]: Error/Table missing (${err.message})`);
            } else {
                console.log(`${file} [${table}]: ${row.count}`);
            }
        });
    });
});
