const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

db.serialize(() => {
    db.all("PRAGMA table_info(Sales)", (err, rows) => {
        if (err) console.error('Error getting Sales schema:', err);
        else console.log('Sales Schema:', rows);
    });
    db.all("PRAGMA table_info(Professionals)", (err, rows) => {
        if (err) console.error('Error getting Professionals schema:', err);
        else console.log('Professionals Schema:', rows);
    });
});

db.close();
