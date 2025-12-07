const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

// Configure busy timeout
db.configure('busyTimeout', 5000);

function runUpdate(sql, params) {
    return new Promise((resolve, reject) => {
        const attempt = (retries = 5) => {
            db.run(sql, params, function (err) {
                if (err) {
                    if (err.code === 'SQLITE_BUSY' && retries > 0) {
                        console.log('Database busy, retrying...');
                        setTimeout(() => attempt(retries - 1), 1000);
                    } else {
                        reject(err);
                    }
                } else {
                    resolve(this.changes);
                }
            });
        };
        attempt();
    });
}

db.serialize(async () => {
    try {
        // Get bad records
        const rows = await new Promise((resolve, reject) => {
            db.all("SELECT id, createdAt, updatedAt FROM Services WHERE typeof(createdAt) = 'integer' OR typeof(updatedAt) = 'integer'", (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        console.log(`Found ${rows.length} services with integer timestamps.`);

        for (const row of rows) {
            if (typeof row.createdAt === 'number') {
                const date = new Date(row.createdAt);
                const isoString = date.toISOString().replace('T', ' ').replace('Z', ' +00:00');
                await runUpdate('UPDATE Services SET createdAt = ? WHERE id = ?', [isoString, row.id]);
                console.log(`Updated createdAt for ID ${row.id}`);
            }

            if (typeof row.updatedAt === 'number') {
                const date = new Date(row.updatedAt);
                const isoString = date.toISOString().replace('T', ' ').replace('Z', ' +00:00');
                await runUpdate('UPDATE Services SET updatedAt = ? WHERE id = ?', [isoString, row.id]);
                console.log(`Updated updatedAt for ID ${row.id}`);
            }
        }

        console.log('All updates finished.');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        db.close();
    }
});
