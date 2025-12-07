const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

db.serialize(() => {
    // Check the corrupted record
    db.get("SELECT id, typeof(date) as type FROM Sales WHERE id = 3", (err, row) => {
        if (err) console.error('Error fetching ID 3:', err);
        else console.log('Record ID 3:', row);
    });

    // Delete it
    db.run("DELETE FROM Sales WHERE id = 3", function (err) {
        if (err) {
            console.error('Error deleting:', err);
        } else {
            console.log(`Deleted ${this.changes} record(s).`);
        }
    });
});

db.close();
