const XLSX = require('xlsx');

const filePath = 'C:\\Users\\leona\\Documents\\LEO\\ESTUDOS\\Python\\DIO\\beauty-salon-mvp\\BaseServicoseVendas.xlsx';

const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet);

console.log('First 3 rows from Excel:');
console.log(JSON.stringify(rows.slice(0, 3), null, 2));

console.log('\n\nColumn names:');
console.log(Object.keys(rows[0]));
