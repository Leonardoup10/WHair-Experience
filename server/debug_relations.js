const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

db.serialize(() => {
    // Check a few sales with their professional info
    db.all(`
        SELECT 
            s.id, 
            s.date, 
            s.sale_price, 
            s.professional_id,
            p.name as professional_name,
            s.client_name,
            s.payment_method
        FROM Sales s
        LEFT JOIN Professionals p ON s.professional_id = p.id
        ORDER BY s.id DESC
        LIMIT 10
    `, (err, rows) => {
        if (err) {
            console.error('Error:', err);
        } else {
            console.log('\n=== Latest 10 Sales with Professional Info ===');
            console.log(JSON.stringify(rows, null, 2));
        }
    });

    // Check if there are sales without professional_id
    db.get(`
        SELECT COUNT(*) as count 
        FROM Sales 
        WHERE professional_id IS NULL
    `, (err, row) => {
        if (err) {
            console.error('Error:', err);
        } else {
            console.log('\n=== Sales without Professional ID ===');
            console.log(`Count: ${row.count}`);
        }
    });

    // List all professionals
    db.all(`SELECT id, name FROM Professionals ORDER BY id`, (err, rows) => {
        if (err) {
            console.error('Error:', err);
        } else {
            console.log('\n=== All Professionals ===');
            console.log(JSON.stringify(rows, null, 2));
        }
    });
});

db.close();
