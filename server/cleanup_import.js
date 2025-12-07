const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

console.log('Deleting imported sales (keeping original sales if any)...');

db.serialize(() => {
    // Delete sales linked to the generic service "Serviço Importado"
    db.run(`
        DELETE FROM Sales 
        WHERE item_id = (SELECT id FROM Services WHERE name = 'Serviço Importado')
    `, function (err) {
        if (err) {
            console.error('Error deleting sales:', err);
        } else {
            console.log(`Deleted ${this.changes} imported sales.`);
        }
        db.close();
    });
});
