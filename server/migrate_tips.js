const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run("ALTER TABLE Sales ADD COLUMN tip_amount DECIMAL(10, 2) DEFAULT 0", (err) => {
        if (err) {
            console.log('Column tip_amount might already exist or error:', err.message);
        } else {
            console.log('✅ Column tip_amount added to Sales table');
        }
    });
});

db.close();
