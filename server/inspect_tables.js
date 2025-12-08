const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log('Tables found:', tables.map(t => t.name));

    tables.forEach(t => {
        db.get(`SELECT count(*) as count FROM ${t.name}`, (err, row) => {
            console.log(`${t.name}: ${row ? row.count : 'error'}`);
        });
    });
});
