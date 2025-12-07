const XLSX = require('xlsx');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const filePath = 'C:\\Users\\leona\\Documents\\LEO\\ESTUDOS\\Python\\DIO\\beauty-salon-mvp\\BaseServicoseVendas.xlsx';

console.log('Reading Excel file...');
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet);

console.log(`Found ${rows.length} rows in Excel.`);

const db = new sqlite3.Database(dbPath);

// Get all imported sales ordered by ID (same order as import)
db.all(`
    SELECT id
    FROM Sales
    WHERE item_id = (SELECT id FROM Services WHERE name = 'Serviço Importado')
    ORDER BY id
`, (err, sales) => {
    if (err) {
        console.error('Error:', err);
        db.close();
        return;
    }

    console.log(`Found ${sales.length} imported sales.`);
    console.log('Updating prices...\n');

    let updateCount = 0;
    const stmt = db.prepare('UPDATE Sales SET sale_price = ?, commission_amount = ? WHERE id = ?');

    sales.forEach((sale, index) => {
        if (index < rows.length) {
            const row = rows[index];
            const valor = row[' VALOR '] || row['VALOR'] || 0;
            const comissao = row['COMISSÃO'] || 0;

            stmt.run(valor, comissao, sale.id, (err) => {
                if (err) {
                    console.error(`Error updating sale ${sale.id}:`, err);
                } else {
                    updateCount++;
                    if (updateCount % 1000 === 0) {
                        console.log(`Updated ${updateCount} sales...`);
                    }
                }

                if (index === sales.length - 1) {
                    stmt.finalize();
                    console.log('\n-----------------------------------');
                    console.log(`Update finished. Total updated: ${updateCount}`);
                    db.close();
                }
            });
        }
    });
});
