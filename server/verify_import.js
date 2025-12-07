const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

db.serialize(() => {
    db.all(`
        SELECT s.id, s.date, s.sale_price, p.name as professional, s.payment_method 
        FROM Sales s
        LEFT JOIN Professionals p ON s.professional_id = p.id
        ORDER BY s.id DESC
        LIMIT 5
    `, (err, rows) => {
        if (err) console.error('Error verifying sales:', err);
        else console.log('Latest 5 Sales:', rows);
    });

    db.get("SELECT COUNT(*) as count FROM Sales", (err, row) => {
        console.log('Total Sales Count:', row.count);
    });
});

db.close();
