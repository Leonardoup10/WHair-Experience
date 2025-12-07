const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.all("SELECT id, sale_price, commission_amount FROM Sales LIMIT 10", (err, rows) => {
        if (err) console.error('Error:', err);
        else {
            console.log('Sales Sample:');
            rows.forEach(r => console.log(r));

            // Check if ALL are zero
            db.get("SELECT COUNT(*) as count FROM Sales WHERE commission_amount > 0", (err, row) => {
                console.log(`Sales with commission > 0: ${row.count}`);
            });
        }
    });
});

db.close();
