const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Check sales in Dec 2025
    db.all("SELECT id, date, sale_price, commission_amount FROM Sales WHERE date LIKE '2025-12%' LIMIT 10", (err, rows) => {
        if (err) console.error('Error:', err);
        else {
            console.log('Dec 2025 Sales Sample:');
            rows.forEach(r => console.log(r));

            if (rows.length === 0) console.log('No sales found for 2025-12');
        }
    });
});

db.close();
