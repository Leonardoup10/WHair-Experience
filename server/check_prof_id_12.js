const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

db.serialize(() => {
    db.get(`
        SELECT s.id, s.professional_id, p.id as prof_exists, p.name 
        FROM Sales s 
        LEFT JOIN Professionals p ON s.professional_id = p.id 
        WHERE s.id = 12
    `, (err, row) => {
        if (err) console.error('Error:', err);
        else console.log('ID 12 Professional:', row);
    });
});

db.close();
