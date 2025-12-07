const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

db.serialize(() => {
    db.get("SELECT COUNT(*) as count, SUM(sale_price) as total FROM Sales WHERE sale_price = 0", (err, row) => {
        if (err) console.error('Error:', err);
        else console.log('Sales with price = 0:', row);
    });

    db.get("SELECT COUNT(*) as count, SUM(sale_price) as total FROM Sales WHERE sale_price > 0", (err, row) => {
        if (err) console.error('Error:', err);
        else console.log('Sales with price > 0:', row);
    });

    db.all(`
        SELECT s.id, s.date, s.sale_price, s.commission_amount, p.name as professional
        FROM Sales s
        LEFT JOIN Professionals p ON s.professional_id = p.id
        ORDER BY s.id DESC
        LIMIT 5
    `, (err, rows) => {
        if (err) console.error('Error:', err);
        else {
            console.log('\nLatest 5 sales:');
            console.log(JSON.stringify(rows, null, 2));
        }
        db.close();
    });
});
