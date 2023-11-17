const express = require('express');
const xlsx = require('xlsx');
const path = require('path');

const app = express();
const port = 3000;

const requestTypeToPerson = {
  'Đơn hoãn thi': 'Ca Phú Phát',
  'Đơn đề nghị thôi học': 'Đặng Phương Du',
  'Nhập học lại (sau khi nghỉ học tạm thời)': 'Đặng Phương Du',
  'Đơn nghỉ học tạm thời': 'Đặng Phương Du',
  'Đơn Đăng ký thi KNTHCM': 'Nguyễn Thị Kim Tuyến',
  'Đơn xin cấp giấy chứng nhận tốt nghiệp tạm thời': 'Nguyễn Thị Kim Tuyến',
  'Xác nhận tình hình nợ môn học': 'Nguyễn Thị Kim Tuyến',
  'Đơn đăng ký môn thay thế tốt nghiệp': 'Nguyễn Văn Khoa',
  'Chuyển nhóm môn học': 'Nguyễn Thủy Kim Tuyền',
  'Đơn xin đăng ký môn học trễ hạn': 'Nguyễn Thủy Kim Tuyền',
  'Đơn đề nghị miễn/chuyển điểm học phần': 'Phạm Uyên Thy',
  'Xác nhận liên quan đến tuyển sinh': 'Phùng Văn Trúc',
  'Đăng ký tiếng Anh bổ sung': 'Phạm Thị Kim Điệp',
  'Đơn đề nghị miễn Tiếng Anh': 'Phạm Uyên Thy',
};

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));


function getArrayOfObjects(sheet) {
  const jsonArray = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  // Extract headers from the first row
  const headers = jsonArray[0];

  // Remove the headers from the array
  const data = jsonArray.slice(1);

  // Convert each row to an object
  const arrayOfObjects = data.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });

  return arrayOfObjects;
}

app.get('/table', (req, res) => {
  // Read the Excel file
  // const workbook = xlsx.readFile('DS_NopDon.xlsx');
  const workbook = xlsx.readFile('DS_NopDon.xlsx');
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const processedData = getArrayOfObjects(sheet);
  res.render('table', { data: processedData });
});

// Define a route to render the Excel data in a table
app.get('/', (req, res) => {
  // Read the Excel file
  // const workbook = xlsx.readFile('DS_NopDon.xlsx');
  const workbook = xlsx.readFile('DS_NopDon.xlsx');
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const processedData = getArrayOfObjects(sheet);
  res.render('index', { data: processedData });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
