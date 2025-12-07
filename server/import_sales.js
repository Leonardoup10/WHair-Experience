const XLSX = require('xlsx');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const filePath = 'C:\\Users\\leona\\Documents\\LEO\\ESTUDOS\\Python\\DIO\\beauty-salon-mvp\\BaseServicoseVendas.xlsx';

const db = new sqlite3.Database(dbPath);

function excelDateToJSDate(serial) {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate());
}

function normalizeString(str) {
    return str ? str.toString().trim().toUpperCase() : '';
}

async function runImport() {
    console.log('Starting import...');

    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    console.log(`Found ${rows.length} rows to import.`);

    db.serialize(() => {
        // 1. Ensure Generic Service Exists
        let serviceId;
        db.get("SELECT id FROM Services WHERE name = 'Serviço Importado'", (err, row) => {
            if (err) {
                console.error('Error checking service:', err);
                return;
            }
            if (row) {
                serviceId = row.id;
                processRows(rows, serviceId);
            } else {
                db.run("INSERT INTO Services (name, price, createdAt, updatedAt) VALUES (?, ?, ?, ?)",
                    ['Serviço Importado', 0, new Date(), new Date()],
                    function (err) {
                        if (err) {
                            console.error('Error creating generic service:', err);
                            return;
                        }
                        serviceId = this.lastID;
                        console.log('Created generic service with ID:', serviceId);
                        processRows(rows, serviceId);
                    }
                );
            }
        });
    });
}

async function processRows(rows, serviceId) {
    let successCount = 0;
    let errorCount = 0;

    const stmt = db.prepare(`
        INSERT INTO Sales (
            professional_id, type, item_id, sale_price, commission_amount, 
            client_name, client_origin, payment_method, date, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Cache professionals to avoid repeated lookups
    const profCache = {};

    // Promisify db functions
    const getProf = (name) => new Promise((resolve, reject) => {
        db.get("SELECT id FROM Professionals WHERE UPPER(name) = ?", [name], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });

    const createProf = (name) => new Promise((resolve, reject) => {
        db.run("INSERT INTO Professionals (name, service_commission_rate, product_commission_rate, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)",
            [name, 0.45, 0.1, new Date(), new Date()],
            function (err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
    });

    const runStmt = (params) => new Promise((resolve, reject) => {
        stmt.run(...params, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });

    console.log('Processing rows...');

    // Batch processing to avoid blocking event loop too long
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const profName = normalizeString(row['PROFISSIONAL']);

        try {
            let profId;
            if (profCache[profName]) {
                profId = profCache[profName];
            } else {
                const profRow = await getProf(profName);
                if (profRow) {
                    profId = profRow.id;
                } else {
                    profId = await createProf(row['PROFISSIONAL']);
                    console.log(`Created new professional: ${row['PROFISSIONAL']}`);
                }
                profCache[profName] = profId;
            }

            const date = excelDateToJSDate(row['DATA']);
            const type = 'SERVICE';
            const salePrice = row[' VALOR '] || row['VALOR'] || 0;
            const commission = row['COMISSÃO'] || 0;
            const clientName = row['CLIENTE'] || 'Cliente Importado';
            const origin = row['FUNIL'] || 'Outro';
            const paymentMethod = row['FORMA_PAGAMENTO'] || 'Numerário';

            await runStmt([
                profId, type, serviceId, salePrice, commission,
                clientName, origin, paymentMethod, date, new Date(), new Date()
            ]);
            successCount++;

        } catch (err) {
            console.error(`Error processing row ${i}:`, err);
            errorCount++;
        }

        if (i % 1000 === 0) console.log(`Processed ${i} rows...`);
    }

    stmt.finalize();
    console.log('-----------------------------------');
    console.log(`Import finished.`);
    console.log(`Successfully imported: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    db.close();
}

runImport();
