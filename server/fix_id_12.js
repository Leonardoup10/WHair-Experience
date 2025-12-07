const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

db.serialize(() => {
    // Update ID 12 with a known good date format (copied from ID 1 but changed year)
    const newDate = '2025-12-01 10:27:58.055 +00:00';
    db.run("UPDATE Sales SET date = ? WHERE id = 12", [newDate], function (err) {
        if (err) console.error('Error updating:', err);
        else console.log(`Updated ID 12 date to: ${newDate}`);
    });
});

db.close();
