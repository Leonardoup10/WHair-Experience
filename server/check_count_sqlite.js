const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
console.log('Checking database at:', dbPath);

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.get("SELECT COUNT(*) as count FROM Sales", (err, row) => {
        if (err) console.error('Error:', err);
        else console.log('Total Sales (sqlite3):', row.count);
    });
});

db.close();
