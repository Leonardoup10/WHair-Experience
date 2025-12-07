const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

db.serialize(() => {
    db.all("SELECT * FROM Sales WHERE id IN (1, 12)", (err, rows) => {
        if (err) console.error('Error:', err);
        else {
            console.log('ID 1:', rows.find(r => r.id === 1));
            console.log('ID 12:', rows.find(r => r.id === 12));
        }
    });
});

db.close();
