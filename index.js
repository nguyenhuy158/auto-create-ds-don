const express = require('express');
const xlsx = require('xlsx');
const path = require('path');
const moment = require('moment');
const fs = require('fs');

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
    'Hủy lịch học Tiếng Anh': 'Phạm Thị Kim Điệp',
};

const keepColumns = [
    'Người giải quyết đơn',
    'Số BN',
    'Loại đơn (Tên đơn)',
    'MSSV',
    'Họ và tên'
];

function filterObject(obj) {
    Object.keys(obj)
        .filter(key => !keepColumns.includes(key))
        .forEach(key => delete obj[key]);
    return obj;
}

function replacePerson(obj) {
    if (obj['Loại đơn (Tên đơn)'] in requestTypeToPerson) {
        obj['Người giải quyết đơn'] = requestTypeToPerson[obj['Loại đơn (Tên đơn)']];
    }
    return obj;
}

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

function removeOldFiles(directoryPath = 'uploads/') {
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.log(`🚀 🚀 file: index.js:64 🚀 fs.readdir 🚀 err`, err);
            return;
        }

        files.forEach(file => {
            const filePath = path.join(directoryPath, file);

            fs.stat(filePath, (err, stats) => {
                if (err) {
                    console.log(`🚀 🚀 file: index.js:71 🚀 fs.stat 🚀 err`, err);
                    return;
                }

                const now = moment();
                const fileTime = moment(stats.mtime);
                const diffMinutes = now.diff(fileTime, 'minutes');

                if (diffMinutes > 5) {
                    fs.unlink(filePath, err => {
                        if (err) throw err;
                        console.log(`Deleted file: ${filePath}`);
                    });
                }
            });
        });
    });
}

app.post('/upload', upload.single('file'), (req, res) => {
    try {
        removeOldFiles();

        if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            console.log(req.file);

            let oldPath = req.file.path;
            let newPath = path.join(path.dirname(oldPath), 'DS_NopDon_' + new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + '.xlsx');
            let filename = path.basename(newPath);

            fs.rename(oldPath, newPath, (err) => {
                if (err) {
                    res.json({ error: true, message: `File rename failed: ${err}` });
                } else {
                    console.log(req.file);
                    res.json({ error: false, message: `File uploaded and renamed successfully ${filename}`, filename });
                }
            });
        } else {
            res.json({ error: true, message: 'Upload failed: not a correct file' });
        }
    } catch (error) {
        res.json({ error: true, message: `Upload failed ${error}` });
    }
});

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
function filterData(data, removeTypes) {
    return data.filter(obj => !removeTypes.includes(obj['Loại đơn (Tên đơn)']));
}
const removeTypes = ['Đơn xin cấp bảng điểm', 'Đơn đề nghị miễn Tiếng Anh'];

function handle(filename = 'DS_NopDon.xlsx') {
    // Read the Excel file
    const workbook = xlsx.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    let processedData = getArrayOfObjects(sheet);

    // Filter out columns that are not needed
    processedData.forEach(obj => filterObject(obj));

    // Replace the person who will handle the request
    processedData.forEach(obj => replacePerson(obj));

    processedData.sort((a, b) => {
        if (a['Người giải quyết đơn'] < b['Người giải quyết đơn']) {
            return -1;
        }
        if (a['Người giải quyết đơn'] > b['Người giải quyết đơn']) {
            return 1;
        }
        return 0;
    });

    // Define an object with all keys from the first object in processedData set to ''
    const emptyObj = Object.fromEntries(Object.keys(processedData[0]).map(key => [key, '']));

    let prevPerson = null;
    for (let i = 0; i < processedData.length; i++) {
        if (prevPerson !== null && processedData[i]['Người giải quyết đơn'] !== prevPerson) {
            processedData.splice(i, 0, { ...emptyObj });
            i++; // Skip the newly inserted empty object
        }
        prevPerson = processedData[i]['Người giải quyết đơn'];
    }

    processedData.unshift(emptyObj);

    processedData = filterData(processedData, removeTypes);

    for (let i = 0; i < processedData.length - 1; i++) {
        if (JSON.stringify(processedData[i]) === JSON.stringify(emptyObj)) {
            processedData[i] = {
                'Người giải quyết đơn': processedData[i + 1]['Người giải quyết đơn'],
                'Loại đơn (Tên đơn)': processedData[i + 1]['Loại đơn (Tên đơn)'],
            };
        }
    }

    for (let i = 0; i < processedData.length; i++) {
        if (Object.keys(processedData[i]).length === 5) {
            processedData[i]['Người giải quyết đơn'] = '';
        }
    }

    let stt = 1;
    prevPerson = null;
    for (let i = 0; i < processedData.length; i++) {
        if (processedData[i]['Người giải quyết đơn'] !== prevPerson) {
            stt = 1;
        }
        if (Object.keys(processedData[i]).length > 2) {
            processedData[i]['STT'] = stt++;
        }
        prevPerson = processedData[i]['Người giải quyết đơn'];
    }

    let prevType = null;
    for (let i = 0; i < processedData.length; i++) {
        if (Object.keys(processedData[i]).length === 2) {
            prevType = processedData[i]['Loại đơn (Tên đơn)'];
            continue;
        }
        if (processedData[i]['Loại đơn (Tên đơn)'] !== prevType) {
            const newObj = {
                'Người giải quyết đơn': processedData[i]['Người giải quyết đơn'],
                'Loại đơn (Tên đơn)': processedData[i]['Loại đơn (Tên đơn)'],
            };
            processedData.splice(i, 0, newObj);
            i++; // Skip the newly inserted object
        }
        prevType = processedData[i]['Loại đơn (Tên đơn)'];
    }

    console.log(`🚀 🚀 file: index.js:79 🚀 app.get 🚀 processedData`, processedData);

    let totalDon = processedData.filter(obj => Object.keys(obj).length === 6).length;

    let dateSent = moment().add(1, 'days').format('DD/MM/YYYY');
    let dateReceive = moment().format('DD [tháng] MM [năm] YYYY');
    dateReceive = 'Tp. Hồ Chí Minh, ngày ' + dateReceive;
    return { processedData, dateSent, dateReceive, totalDon };
}

app.get('/', (req, res) => {
    // const { processedData, dateSent, dateReceive, totalDon } = handle();
    processedData = {};
    dateSent = '';
    dateReceive = '';
    totalDon = '';
    res.render('table', { data: processedData, dateSent, dateReceive, totalDon });
});


app.post('/', (req, res) => {
    try {
        const { filename } = req.body;
        const { processedData, dateSent, dateReceive, totalDon } = handle(path.join('uploads', filename));

        res.json({ error: false, data: processedData, dateSent, dateReceive, totalDon, message: 'Yeah danh sách tạo rồi nè copy vô file excel thôiii' });
    } catch (error) {
        console.log(`🚀 🚀 file: index.js:219 🚀 app.post 🚀 error`, error);
        res.json({ error: true, message: `Create Danh Sach Fail ${error}` });
    }
});

app.get('/huong-dan-su-dung', (req, res) => {
    res.render('tutorial');
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.use(function (req, res) {
    res.status(404).render('404');
});

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).render('500');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
