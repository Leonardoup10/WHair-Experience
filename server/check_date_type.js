const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

db.all("SELECT typeof(date) as date_type, date FROM Sales LIMIT 5", (err, rows) => {
    if (err) console.error('Error:', err);
    else console.log('Date types and values:', rows);
    db.close();
});
