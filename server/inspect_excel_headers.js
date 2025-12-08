const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '..', 'BaseServicoseVendas.xlsx');

try {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: null }); // usage of defval to see empty cells

    if (rows.length > 0) {
        console.log('--- HEADERS ---');
        console.log(Object.keys(rows[0]));

        console.log('\n--- FIRST 5 ROWS ---');
        console.log(rows.slice(0, 5));
    } else {
        console.log('File is empty.');
    }
} catch (e) {
    console.error('Error reading Excel:', e);
}
