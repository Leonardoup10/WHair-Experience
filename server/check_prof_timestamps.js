const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

db.serialize(() => {
    // Check Professionals timestamps
    db.all("SELECT id, typeof(createdAt) as cType, typeof(updatedAt) as uType FROM Professionals", (err, rows) => {
        if (err) console.error('Error:', err);
        else {
            console.log('Professionals timestamp types:');
            const badRows = rows.filter(r => r.cType === 'integer' || r.uType === 'integer');
            if (badRows.length > 0) {
                console.log(`Found ${badRows.length} professionals with integer timestamps.`);
                console.log('Sample:', badRows[0]);
            } else {
                console.log('All professionals have text timestamps.');
            }
        }
    });
});

db.close();
