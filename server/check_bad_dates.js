const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

db.serialize(() => {
    // Check distribution of types again
    db.all("SELECT typeof(date) as type, count(*) as count FROM Sales GROUP BY typeof(date)", (err, rows) => {
        if (err) console.error('Error checking types:', err);
        else console.log('Date types:', rows);
    });

    // Check for empty or short strings
    db.all("SELECT id, date FROM Sales WHERE length(date) < 10", (err, rows) => {
        if (err) console.error('Error checking short dates:', err);
        else console.log('Short dates:', rows);
    });

    // Check for dates that don't look like ISO strings (no hyphens)
    db.all("SELECT id, date FROM Sales WHERE date NOT LIKE '%-%'", (err, rows) => {
        if (err) console.error('Error checking format:', err);
        else console.log('Non-hyphen dates:', rows);
    });
});

db.close();
