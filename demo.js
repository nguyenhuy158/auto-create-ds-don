const xlsx = require('xlsx');

const workbook = xlsx.readFile('DS.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Convert the sheet data to JSON, treating the first row as headers




console.log(arrayOfObjects);
