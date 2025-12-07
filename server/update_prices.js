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
console.log('Updating sale prices in database...\n');

const db = new sqlite3.Database(dbPath);

let updateCount = 0;
let errorCount = 0;

// Get all imported sales
db.all(`
    SELECT s.id, s.client_name, s.date, p.name as prof_name
    FROM Sales s
    LEFT JOIN Professionals p ON s.professional_id = p.id
    WHERE s.item_id = (SELECT id FROM Services WHERE name = 'Serviço Importado')
    ORDER BY s.id
`, (err, sales) => {
    if (err) {
        console.error('Error fetching sales:', err);
        db.close();
        return;
    }

    console.log(`Found ${sales.length} imported sales in database.`);

    // Create a map of Excel data for quick lookup
    const excelMap = {};
    rows.forEach(row => {
        const key = `${row['DATA']}_${(row['PROFISSIONAL'] || '').toUpperCase()}_${(row['CLIENTE'] || '').toUpperCase()}`;
        excelMap[key] = {
            valor: row[' VALOR '] || row['VALOR'] || 0,
            comissao: row['COMISSÃO'] || 0
        };
    });

    // Update each sale
    const stmt = db.prepare('UPDATE Sales SET sale_price = ?, commission_amount = ? WHERE id = ?');

    sales.forEach((sale, index) => {
        const key = `${Math.floor(sale.date / 86400000) + 25569}_${(sale.prof_name || '').toUpperCase()}_${(sale.client_name || '').toUpperCase()}`;
        const excelData = excelMap[key];

        if (excelData) {
            stmt.run(excelData.valor, excelData.comissao, sale.id, (err) => {
                if (err) {
                    console.error(`Error updating sale ${sale.id}:`, err);
                    errorCount++;
                } else {
                    updateCount++;
                }

                if (index === sales.length - 1) {
                    stmt.finalize();
                    console.log('\n-----------------------------------');
                    console.log(`Update finished.`);
                    console.log(`Successfully updated: ${updateCount}`);
                    console.log(`Errors: ${errorCount}`);
                    db.close();
                }
            });
        } else {
            if (index === sales.length - 1) {
                stmt.finalize();
                console.log('\n-----------------------------------');
                console.log(`Update finished.`);
                console.log(`Successfully updated: ${updateCount}`);
                console.log(`Errors: ${errorCount}`);
                db.close();
            }
        }
    });
});
