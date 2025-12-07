const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.all("SELECT id, date, createdAt, updatedAt FROM Sales LIMIT 5", (err, rows) => {
        if (err) console.error('Error:', err);
        else {
            console.log('Raw Date Values:');
            rows.forEach(r => console.log(r));
        }
    });
});

db.close();
