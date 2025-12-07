const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

db.all(`
    SELECT typeof(date) as date_type, date, id 
    FROM Sales 
    WHERE item_id = (SELECT id FROM Services WHERE name = 'Serviço Importado')
    LIMIT 5
`, (err, rows) => {
    if (err) console.error('Error:', err);
    else console.log('Imported sales date types:', rows);
    db.close();
});
