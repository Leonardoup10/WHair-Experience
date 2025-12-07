const XLSX = require('xlsx');
const path = require('path');

const filePath = 'C:\\Users\\leona\\Documents\\LEO\\ESTUDOS\\Python\\DIO\\beauty-salon-mvp\\BaseServicoseVendas.xlsx';

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Get headers (first row)
    const range = XLSX.utils.decode_range(sheet['!ref']);
    const headers = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell = sheet[XLSX.utils.encode_cell({ r: 0, c: C })];
        headers.push(cell ? cell.v : undefined);
    }

    console.log('Sheet Name:', sheetName);
    console.log('Headers:', JSON.stringify(headers, null, 2));

    // Print first data row to see format
    const firstRow = [];
    if (range.e.r >= 1) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell = sheet[XLSX.utils.encode_cell({ r: 1, c: C })];
            firstRow.push(cell ? cell.v : undefined);
        }
        console.log('First Row Data:', JSON.stringify(firstRow, null, 2));
    }

} catch (error) {
    console.error('Error reading file:', error.message);
}
