const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.all("PRAGMA table_info(Professionals)", (err, rows) => {
        if (err) console.error('Error:', err);
        else {
            console.log('Professionals Table Columns:');
            rows.forEach(r => console.log(`- ${r.name} (${r.type})`));
        }
    });
});

db.close();
