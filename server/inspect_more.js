const XLSX = require('xlsx');
const filePath = 'C:\\Users\\leona\\Documents\\LEO\\ESTUDOS\\Python\\DIO\\beauty-salon-mvp\\BaseServicoseVendas.xlsx';

try {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 'A' }); // Use A, B, C... to see all columns including those without headers

    console.log('First 5 rows (raw):');
    console.log(JSON.stringify(data.slice(0, 6), null, 2));
} catch (error) {
    console.error(error);
}
