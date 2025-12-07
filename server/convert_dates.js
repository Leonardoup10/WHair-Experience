const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

console.log('Converting integer dates to datetime strings...\n');

db.all(`
    SELECT id, date 
    FROM Sales 
    WHERE typeof(date) = 'integer'
`, (err, rows) => {
    if (err) {
        console.error('Error:', err);
        db.close();
        return;
    }

    console.log(`Found ${rows.length} sales with integer dates.`);

    const stmt = db.prepare('UPDATE Sales SET date = ? WHERE id = ?');
    let updateCount = 0;

    const runUpdate = (isoString, id) => new Promise((resolve, reject) => {
        stmt.run(isoString, id, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });

    // Use async IIFE for sequential processing
    (async () => {
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const date = new Date(row.date);
            const isoString = date.toISOString().replace('T', ' ').replace('Z', ' +00:00');

            try {
                await runUpdate(isoString, row.id);
                updateCount++;
                if (updateCount % 1000 === 0) {
                    console.log(`Converted ${updateCount} dates...`);
                }
            } catch (err) {
                console.error(`Error updating sale ${row.id}:`, err);
            }
        }

        stmt.finalize();
        console.log('\n-----------------------------------');
        console.log(`Conversion finished. Total converted: ${updateCount}`);
        db.close();
    })();
});
