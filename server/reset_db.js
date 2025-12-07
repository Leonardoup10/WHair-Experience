const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log('Deleting all Transactions...');
    db.run("DELETE FROM Transactions", (err) => {
        if (err) console.error('Error deleting transactions:', err);
        else console.log('Transactions deleted.');
    });

    console.log('Deleting all Sales...');
    db.run("DELETE FROM Sales", (err) => {
        if (err) console.error('Error deleting sales:', err);
        else console.log('Sales deleted.');
    });

    // Reset sequences
    db.run("DELETE FROM sqlite_sequence WHERE name='Sales' OR name='Transactions'", (err) => {
        if (err) console.error('Error resetting sequences:', err);
        else console.log('Sequences reset.');
    });

    // Verify count
    db.get("SELECT COUNT(*) as count FROM Sales", (err, row) => {
        console.log('Sales count after delete:', row.count);
    });
});

db.close();
