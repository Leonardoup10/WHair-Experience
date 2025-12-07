const XLSX = require('xlsx');
const filePath = 'C:\\Users\\leona\\Documents\\LEO\\ESTUDOS\\Python\\DIO\\beauty-salon-mvp\\BaseServicoseVendas.xlsx';

try {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log('Excel Headers:', rows[0]);
} catch (error) {
    console.error('Error reading Excel:', error.message);
}
