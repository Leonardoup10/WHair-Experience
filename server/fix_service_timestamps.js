const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log('Converting Services timestamps...');

    const stmt = db.prepare('UPDATE Services SET createdAt = ?, updatedAt = ? WHERE id = ?');
    let updateCount = 0;

    db.all("SELECT id, createdAt, updatedAt FROM Services WHERE typeof(createdAt) = 'integer' OR typeof(updatedAt) = 'integer'", (err, rows) => {
        if (err) {
            console.error('Error fetching rows:', err);
            return;
        }

        console.log(`Found ${rows.length} services to update.`);

        const runUpdate = (created, updated, id) => new Promise((resolve, reject) => {
            stmt.run(created, updated, id, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        (async () => {
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const created = new Date(row.createdAt).toISOString().replace('T', ' ').replace('Z', ' +00:00');
                const updated = new Date(row.updatedAt).toISOString().replace('T', ' ').replace('Z', ' +00:00');

                try {
                    await runUpdate(created, updated, row.id);
                    updateCount++;
                } catch (e) {
                    console.error(`Error updating row ${row.id}:`, e);
                }
            }
            stmt.finalize();
            console.log(`Finished. Updated ${updateCount} services.`);
            db.close();
        })();
    });
});
