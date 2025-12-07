const XLSX = require('xlsx');
const path = require('path');

const filePath = 'C:\\Users\\leona\\Documents\\LEO\\ESTUDOS\\Python\\DIO\\beauty-salon-mvp\\BaseServicoseVendas.xlsx';

console.log('Reading Excel file...');
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet);

console.log('Searching for specific Wanda Alves entries...');
const targetRows = rows.filter(r =>
    r['PROFISSIONAL'] &&
    r['PROFISSIONAL'].toUpperCase().includes('WANDA') &&
    (r[' VALOR '] == 85 || r[' VALOR '] == 55 || r['VALOR'] == 85 || r['VALOR'] == 55)
);

targetRows.forEach(r => {
    console.log(`DATA: ${r['DATA']} | VALOR: ${r[' VALOR '] || r['VALOR']} | COMISSÃO: ${r['COMISSÃO']}`);
});
