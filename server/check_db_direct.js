const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

db.serialize(() => {
    db.all("SELECT * FROM Professionals", (err, rows) => {
        if (err) console.error('Professionals Error:', err);
        else console.log('Professionals:', rows);
    });

    db.all("SELECT * FROM Services", (err, rows) => {
        if (err) console.error('Services Error:', err);
        else console.log('Services:', rows);
    });
});

db.close();
