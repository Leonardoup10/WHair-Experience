const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

db.serialize(() => {
    // Check for any dates that are NOT text
    db.all("SELECT typeof(date) as type, count(*) as count FROM Sales GROUP BY typeof(date)", (err, rows) => {
        if (err) console.error('Error checking types:', err);
        else console.log('Date types distribution:', rows);
    });

    // Check a sample of dates to see their format
    db.all("SELECT id, date FROM Sales LIMIT 5", (err, rows) => {
        if (err) console.error('Error fetching sample:', err);
        else console.log('Sample dates:', rows);
    });

    // Check for any null dates
    db.get("SELECT count(*) as count FROM Sales WHERE date IS NULL", (err, row) => {
        if (err) console.error('Error checking nulls:', err);
        else console.log('Null dates count:', row.count);
    });
});

db.close();
