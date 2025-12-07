const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

function runUpdates() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run("BEGIN TRANSACTION");

            // Convert createdAt
            db.all("SELECT id, createdAt FROM Sales WHERE typeof(createdAt) = 'integer'", (err, rows) => {
                if (err) {
                    console.error('Error fetching integer createdAt:', err);
                    return;
                }
                console.log(`Found ${rows.length} records with integer createdAt.`);

                if (rows.length > 0) {
                    const stmt = db.prepare('UPDATE Sales SET createdAt = ? WHERE id = ?');
                    rows.forEach(row => {
                        const date = new Date(row.createdAt);
                        const isoString = date.toISOString().replace('T', ' ').replace('Z', ' +00:00');
                        stmt.run(isoString, row.id);
                    });
                    stmt.finalize();
                }
            });

            // Convert updatedAt
            db.all("SELECT id, updatedAt FROM Sales WHERE typeof(updatedAt) = 'integer'", (err, rows) => {
                if (err) {
                    console.error('Error fetching integer updatedAt:', err);
                    return;
                }
                console.log(`Found ${rows.length} records with integer updatedAt.`);

                if (rows.length > 0) {
                    const stmt = db.prepare('UPDATE Sales SET updatedAt = ? WHERE id = ?');
                    rows.forEach(row => {
                        const date = new Date(row.updatedAt);
                        const isoString = date.toISOString().replace('T', ' ').replace('Z', ' +00:00');
                        stmt.run(isoString, row.id);
                    });
                    stmt.finalize();
                }
            });

            db.run("COMMIT", (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    });
}

runUpdates().then(() => {
    console.log('Updates finished successfully.');
    db.close();
}).catch(err => {
    console.error('Error:', err);
    db.run("ROLLBACK");
    db.close();
});
