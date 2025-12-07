const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

db.serialize(() => {
    db.get("SELECT id, date, typeof(date) as type FROM Sales WHERE id = 12", (err, row) => {
        if (err) console.error('Error:', err);
        else {
            console.log('Record ID 12:', row);
            console.log('Date length:', row.date.length);
            console.log('Date char codes:', row.date.split('').map(c => c.charCodeAt(0)));
        }
    });
});

db.close();
